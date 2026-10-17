import { NextRequest, NextResponse } from 'next/server';
import { fetchProductsFromServer } from '@/lib/firebase/serverDb';
import { generateRecommendations, RecommendationPreferences } from '@/lib/ai/recommendations';
import { requireAuth } from '@/lib/firebase/serverAuth';

export async function POST(req: NextRequest) {
  // 1. Verify user authentication and email verification
  const auth = await requireAuth(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const token = auth.token;

  try {
    const body = await req.json();
    const preferences: RecommendationPreferences = body.preferences || {};
    
    // 1. Fetch authoritative product info securely
    const allProducts = await fetchProductsFromServer(token);
    
    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({ success: true, recommendations: [], fallbackProducts: [] });
    }

    // 2. Stage 1 - Local filtering
    let candidates = allProducts.filter(p => p.stock > 0); // Only in-stock
    
    if (preferences.minPrice) {
      candidates = candidates.filter(p => p.price >= preferences.minPrice!);
    }
    if (preferences.maxPrice) {
      candidates = candidates.filter(p => p.price <= preferences.maxPrice!);
    }
    if (preferences.style && preferences.style !== 'Any') {
      const styleLower = preferences.style.toLowerCase();
      candidates = candidates.filter(p => p.style.toLowerCase() === styleLower);
    }
    // Note: We don't filter out completely based on color/material to leave some reasoning to Gemini,
    // unless they strictly selected it. But for local filtering, let's keep it loose to provide fallback.

    // If we have more than 15 candidates, trim them down to save Gemini token limits and latency
    if (candidates.length > 15) {
      // Sort by price as a deterministic tie-breaker
      candidates.sort((a, b) => a.price - b.price);
      candidates = candidates.slice(0, 15);
    }

    if (candidates.length === 0) {
      // No matches at all
      return NextResponse.json({ success: true, recommendations: [], fallbackProducts: [] });
    }

    // 3. Stage 2 - Gemini Reasoning
    try {
      const recommendations = await generateRecommendations(preferences, candidates);
      return NextResponse.json({
        success: true,
        recommendations,
        fallbackProducts: candidates // returning the raw candidates in case client needs them
      });
    } catch (aiError) {
      console.warn("AI Generation Failed, returning fallback candidates.", aiError);
      return NextResponse.json({
        success: true, // Still "success" because we can render fallback
        recommendations: [],
        fallbackProducts: candidates.slice(0, 5), // Provide top 5 deterministic as fallback
        aiFailed: true
      });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Recommendation API Error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations.' },
      { status: 500 }
    );
  }
}
