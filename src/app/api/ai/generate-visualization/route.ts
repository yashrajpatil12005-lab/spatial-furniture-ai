import { NextRequest, NextResponse } from 'next/server';
import { generateFurnitureInRoomImage } from '@/lib/ai/imageGeneration';
import { Product, FurnitureCustomization } from '@/lib/types';

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
      return NextResponse.json(
        { success: false, error: 'Missing required fields (image, product, customization).' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Maximum size is 5MB.' },
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
      return NextResponse.json(
        { success: false, error: 'Malformed JSON data provided.' },
        { status: 400 }
      );
    }

    // Read the file as a Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Gemini Image Generation (Server Side Only)
    const result = await generateFurnitureInRoomImage(buffer, imageFile.type, product, customization);

    if (result.success) {
      return NextResponse.json({
        success: true,
        image: result.image
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate image.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Image Generation API Error:', error.message || error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An internal server error occurred.'
      },
      { status: 500 }
    );
  }
}
