import { NextRequest, NextResponse } from 'next/server';
import { generateRoomVisualizationConcept } from '@/lib/ai/gemini';
import { GeminiServiceError, parseGeminiError } from '@/lib/ai/geminiClient';
import { Product, FurnitureCustomization } from '@/lib/types';
import { VisualizationResponse } from '@/lib/ai/types';
import { requireAuth } from '@/lib/firebase/serverAuth';

// Vercel serverless request body safe limit: 4.5MB
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  // 1. Verify user authentication and email verification
  const auth = await requireAuth(req);
  if (!auth.authorized) {
    return NextResponse.json<VisualizationResponse>(
      {
        success: false,
        imageGenerated: false,
        message: auth.error || 'Please sign in to analyze room layout.',
        error: auth.error || 'Unauthorized: Authentication required.',
      },
      { status: auth.status || 401 }
    );
  }

  try {
    const formData = await req.formData();

    const imageFile = formData.get('image') as File | null;
    const productStr = formData.get('product') as string | null;
    const customizationStr = formData.get('customization') as string | null;

    if (!imageFile || !productStr || !customizationStr) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Missing required fields (image, product, customization).',
          error: 'Missing required form data fields.',
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.',
          error: 'Unsupported image MIME type.',
        },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'File is too large. Maximum allowed size is 4.5MB.',
          error: 'Payload size exceeds serverless threshold.',
        },
        { status: 400 }
      );
    }

    // Safely parse JSON payloads
    let product: Product;
    let customization: FurnitureCustomization;
    try {
      product = JSON.parse(productStr);
      customization = JSON.parse(customizationStr);
    } catch {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Malformed JSON metadata provided for product or customization.',
          error: 'Invalid JSON payload format.',
        },
        { status: 400 }
      );
    }

    // Convert to buffer for multimodal payload
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call server-side Gemini 2.5 Flash
    const result = await generateRoomVisualizationConcept(buffer, imageFile.type, product, customization);

    return NextResponse.json<VisualizationResponse>({
      success: true,
      imageGenerated: result.imageGenerated,
      message: result.message,
      analysis: result.analysis,
      structuredAnalysis: result.structuredAnalysis,
      finishReason: result.finishReason,
    });
  } catch (error: unknown) {
    if (error instanceof GeminiServiceError) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: error.userMessage,
          error: error.userMessage,
        },
        { status: error.status }
      );
    }

    const parsed = parseGeminiError(error, '/api/ai/visualize');
    console.error('[API Route Error] [/api/ai/visualize]:', {
      status: parsed.status,
      code: parsed.code,
      diagnostic: parsed.diagnostic,
    });

    return NextResponse.json<VisualizationResponse>(
      {
        success: false,
        imageGenerated: false,
        message: parsed.userMessage,
        error: parsed.userMessage,
      },
      { status: parsed.status }
    );
  }
}

