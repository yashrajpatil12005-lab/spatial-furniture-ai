import { GoogleGenAI } from '@google/genai';
import { Product } from '../types';

export interface RecommendationPreferences {
  roomType?: string;
  style?: string;
  color?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  additionalNotes?: string;
  roomAnalysis?: string;
}

export interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
  roomFitReason?: string;
  harmonyHighlight?: string;
  placementTip?: string;
}

export const generateRecommendations = async (
  preferences: RecommendationPreferences,
  candidates: Product[]
): Promise<RecommendationResult[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  // Use the standard gemini-2.5-flash as requested
  const ai = new GoogleGenAI({ apiKey });

  // Map candidates to a simplified format to save tokens
  const productContext = candidates.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    style: p.style,
    color: p.color,
    material: p.material,
    price: p.price,
    dim: `${p.width}x${p.height}x${p.depth}cm`,
    desc: p.description
  }));

  const promptText = `
    You are an expert interior designer and furniture recommendation engine.
    
    CUSTOMER PREFERENCES:
    Room Type: ${preferences.roomType || 'Any'}
    Style: ${preferences.style || 'Any'}
    Color: ${preferences.color || 'Any'}
    Material: ${preferences.material || 'Any'}
    Budget: ${preferences.minPrice ? '₹' + preferences.minPrice : 'Any'} - ${preferences.maxPrice ? '₹' + preferences.maxPrice : 'Any'}
    Additional Notes: ${preferences.additionalNotes || 'None'}
    
    ${preferences.roomAnalysis ? `EXISTING AI ROOM ANALYSIS & ARCHITECTURAL INSIGHTS:\n${preferences.roomAnalysis}` : ''}
    
    CANDIDATE PRODUCTS:
    ${JSON.stringify(productContext, null, 2)}
    
    TASK:
    Analyze the customer preferences (and the room analysis if provided) against the candidate products.
    Select the top (up to 5) most suitable products. Strongly prioritize matching style, budget, and practical room fit.
    
    CRITICAL INSTRUCTION:
    Respond ONLY with valid JSON. Do not include markdown code blocks. The response must precisely match this format:
    {
      "recommendations": [
        {
          "productId": "id_from_candidates",
          "score": 95,
          "reason": "1-2 short sentences explaining why this piece fits the overall preference and room setting.",
          "roomFitReason": "Specific architectural explanation of how this piece suits the room's geometry, lighting, or layout.",
          "harmonyHighlight": "1 sentence on color/material synergy with the room.",
          "placementTip": "1 practical placement suggestion for the space."
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText
    });

    const responseText = response.text || '';
    
    // Clean up potential markdown formatting from Gemini
    let cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    const data = JSON.parse(cleanedText);
    
    if (data && data.recommendations && Array.isArray(data.recommendations)) {
      // Validate that the returned IDs actually exist in our candidates
      const validRecommendations: RecommendationResult[] = [];
      for (const rec of data.recommendations) {
        if (typeof rec.productId === 'string' && candidates.some(c => c.id === rec.productId)) {
          validRecommendations.push({
            productId: rec.productId,
            score: typeof rec.score === 'number' ? Math.min(Math.max(Math.round(rec.score), 50), 99) : 85,
            reason: typeof rec.reason === 'string' && rec.reason.trim() ? rec.reason.trim() : 'Matches your desired aesthetic and room proportions.',
            roomFitReason: typeof rec.roomFitReason === 'string' && rec.roomFitReason.trim() ? rec.roomFitReason.trim() : undefined,
            harmonyHighlight: typeof rec.harmonyHighlight === 'string' && rec.harmonyHighlight.trim() ? rec.harmonyHighlight.trim() : undefined,
            placementTip: typeof rec.placementTip === 'string' && rec.placementTip.trim() ? rec.placementTip.trim() : undefined,
          });
        }
      }
      return validRecommendations.slice(0, 5);
    }
    
    return [];

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Recommendation AI Error:', errorMsg);
    throw new Error('AI recommendation generation failed.');
  }
};
