import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/firebase/serverAuth';

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const isGeminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
  );

  return NextResponse.json({
    firebase: 'Configured',
    firestore: 'Connected',
    gemini: isGeminiConfigured ? 'Configured' : 'Not configured',
    spatialComputing: 'In Development',
  });
}