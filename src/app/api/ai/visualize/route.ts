
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { generateRoomVisualizationConcept } from '@/lib/ai/gemini';
import {
  GeminiServiceError,
  parseGeminiError,
} from '@/lib/ai/geminiClient';
import { Product, FurnitureCustomization } from '@/lib/types';
import { VisualizationResponse } from '@/lib/ai/types';
import { requireAuth } from '@/lib/firebase/serverAuth';
import {
  supabaseAdmin,
  ROOM_SCANS_BUCKET,
} from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(req: NextRequest) {
  // 1. Verify authentication
  const auth = await requireAuth(req);

  if (!auth.authorized) {
    return NextResponse.json<VisualizationResponse>(
      {
        success: false,
        imageGenerated: false,
        message: auth.error || 'Please sign in to analyze your room.',
        error: auth.error || 'Unauthorized: Authentication required.',
      },
      { status: auth.status || 401 }
    );
  }

  let uploadedImagePath: string | null = null;

  try {
    const formData = await req.formData();

    const imageFile = formData.get('image');
    const productStr = formData.get('product');
    const customizationStr = formData.get('customization');
    const sharingConsent = formData.get('sharingConsent');

    // 2. Verify consent on the server
    if (sharingConsent !== 'true') {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Please provide consent before uploading your room photo.',
          error: 'Room photo sharing consent is required.',
        },
        { status: 403 }
      );
    }

    // 3. Validate required fields
    if (
      !(imageFile instanceof File) ||
      typeof productStr !== 'string' ||
      typeof customizationStr !== 'string'
    ) {
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

    // 4. Validate image type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Unsupported file type. Please upload JPEG, PNG, or WebP.',
          error: 'Unsupported image MIME type.',
        },
        { status: 400 }
      );
    }

    // 5. Validate image size
    if (imageFile.size === 0 || imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Image must be larger than 0 and no bigger than 4.5MB.',
          error: 'Invalid image size.',
        },
        { status: 400 }
      );
    }

    // 6. Parse product and customization
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
          message: 'Invalid product or customization data.',
          error: 'Invalid JSON payload format.',
        },
        { status: 400 }
      );
    }

    // 7. Convert image to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 8. Run Gemini analysis
    const result = await generateRoomVisualizationConcept(
      buffer,
      imageFile.type,
      product,
      customization
    );

    // 9. Upload original image to private Supabase Storage
    const extension = FILE_EXTENSIONS[imageFile.type];
    const fileName = `${randomUUID()}.${extension}`;

    uploadedImagePath = `${auth.user.uid}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(ROOM_SCANS_BUCKET)
      .upload(uploadedImagePath, buffer, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Room Scan] Supabase upload failed:', uploadError);

      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Room analysis completed, but saving your room image failed.',
          error: 'Private image storage failed.',
        },
        { status: 500 }
      );
    }

    // 10. Save metadata in Firestore
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID.');
    }

    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}` +
      '/databases/(default)/documents/room_scans';

    const firestoreResponse = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          customerId: {
            stringValue: auth.user.uid,
          },
          imagePath: {
            stringValue: uploadedImagePath,
          },
          productId: {
            stringValue: String(product.id ?? ''),
          },
          productName: {
            stringValue: String(product.name ?? ''),
          },
          analysis: {
            stringValue: result.analysis || '',
          },
          createdAt: {
            timestampValue: new Date().toISOString(),
          },
        },
      }),
    });

    if (!firestoreResponse.ok) {
      const firestoreError = await firestoreResponse.text();

      console.error('[Room Scan] Firestore save failed:', firestoreError);

      throw new Error('Firestore metadata save failed.');
    }

    const savedDocument = await firestoreResponse.json();
    const roomScanId = savedDocument.name?.split('/').pop() || null;

    // 11. Return Gemini analysis and saved record information
    return NextResponse.json({
      success: true,
      imageGenerated: result.imageGenerated,
      message: result.message,
      analysis: result.analysis,
      structuredAnalysis: result.structuredAnalysis,
      finishReason: result.finishReason,
      imageSaved: true,
      roomScanId,
    });
  } catch (error: unknown) {
    // 12. Remove uploaded image if a later operation fails
    if (uploadedImagePath) {
      try {
        const { error: cleanupError } = await supabaseAdmin.storage
          .from(ROOM_SCANS_BUCKET)
          .remove([uploadedImagePath]);

        if (cleanupError) {
          console.error('[Room Scan] Image cleanup failed:', cleanupError);
        }
      } catch (cleanupError) {
        console.error('[Room Scan] Image cleanup failed:', cleanupError);
      }
    }

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

    if (
      error instanceof Error &&
      error.message === 'Firestore metadata save failed.'
    ) {
      return NextResponse.json<VisualizationResponse>(
        {
          success: false,
          imageGenerated: false,
          message: 'Room analysis completed, but saving the room record failed. Please try again.',
          error: error.message,
        },
        { status: 500 }
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
