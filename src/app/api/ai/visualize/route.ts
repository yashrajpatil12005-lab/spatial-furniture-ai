import { NextRequest, NextResponse } from 'next/server';
import { generateRoomVisualizationConcept } from '@/lib/ai/gemini';
import { Product, FurnitureCustomization } from '@/lib/types';
import { VisualizationResponse } from '@/lib/ai/types';

// Standard max size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const imageFile = formData.get('image') as File | null;
    const productStr = formData.get('product') as string | null;
    const customizationStr = formData.get('customization') as string | null;

    if (!imageFile || !productStr || !customizationStr) {
      return NextResponse.json<VisualizationResponse>(
        { success: false, imageGenerated: false, message: 'Missing required fields (image, product, customization).' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json<VisualizationResponse>(
        { success: false, imageGenerated: false, message: 'Unsupported file type. Please upload a JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<VisualizationResponse>(
        { success: false, imageGenerated: false, message: 'File is too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Safely parse JSON
    let product: Product;
    let customization: FurnitureCustomization;
    try {
      product = JSON.parse(productStr);
      customization = JSON.parse(customizationStr);
    } catch (e) {
      return NextResponse.json<VisualizationResponse>(
        { success: false, imageGenerated: false, message: 'Malformed JSON data provided.' },
        { status: 400 }
      );
    }

    // Read the file as a Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Gemini (Server Side Only)
    const result = await generateRoomVisualizationConcept(buffer, imageFile.type, product, customization);

    return NextResponse.json<VisualizationResponse>({
      success: true,
      imageGenerated: result.imageGenerated,
      message: result.message,
      analysis: result.analysis
    });

  } catch (error: any) {
    // Note: the prompt strictly says never expose the API key in errors,
    // so we provide a generic safe message to the client unless it's a specific known issue.
    const errorMessage = error.message || 'Unknown API Error';
    const isKeyError = errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key not valid');
    
    // Safely strip the key if it happened to be in the error message for some reason
    const safeErrorMessage = isKeyError 
      ? 'Server misconfiguration: AI API is not properly configured.' 
      : errorMessage;

    console.error('API Route Error:', errorMessage);

    return NextResponse.json<VisualizationResponse>(
      { 
        success: false, 
        imageGenerated: false, 
        message: 'An error occurred on the server while generating the visualization concept.',
        error: safeErrorMessage
      },
      { status: 500 }
    );
  }
}
