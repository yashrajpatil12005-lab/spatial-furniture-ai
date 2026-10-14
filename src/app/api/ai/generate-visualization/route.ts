import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase/serverAuth';

export async function POST(req: NextRequest) {
  // 1. Verify user authentication
  const auth = await requireAuth(req);
  if (!auth.authorized) {
    return auth.response;
  }

  // Gracefully inform callers that AI image generation is in preview development
  return NextResponse.json({
    success: false,
    comingSoon: true,
    message: 'AI Spatial Image Synthesis is currently in preview development. Architectural room layout, scale verification, and compatibility analysis is fully operational.',
  });
}
