import { NextResponse } from 'next/server';

export async function GET() {
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
