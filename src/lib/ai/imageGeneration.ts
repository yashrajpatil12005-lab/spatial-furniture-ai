import { GoogleGenAI } from '@google/genai';
import { Product, FurnitureCustomization } from '../types';

export const generateFurnitureInRoomImage = async (
  imageBuffer: Buffer,
  mimeType: string,
  product: Product,
  customization: FurnitureCustomization
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  // Initialize the new Google GenAI SDK for the latest models
  const ai = new GoogleGenAI({ apiKey });

  // Extremely specific prompt demanding architecture preservation and furniture insertion
  const promptText = `
    You are an expert AI image editor. I am providing a photograph of a room.
    
    TASK:
    Photorealistically insert the following furniture into the provided room photo.
    
    FURNITURE DETAILS:
    Product: ${product.name}
    Category: ${product.category}
    Brand: ${product.brand}
    Description: ${product.description}
    Color: ${customization.color}
    Material: ${customization.material}
    Finish: ${customization.finish}
    Dimensions: ${customization.width}cm (Width) x ${customization.height}cm (Height) x ${customization.depth}cm (Depth)

    CRITICAL CONSTRAINTS:
    1. Do NOT redesign the room.
    2. Do NOT change the walls, floor, windows, doors, or architecture.
    3. PRESERVE the existing lighting direction, shadows, and camera viewpoint.
    4. PRESERVE the original perspective.
    5. ONLY insert the specified furniture in a logical, empty location that fits the provided dimensions.
    6. Ensure realistic scale and perspective match.
    7. Generate realistic shadows and floor contact.
    8. The output must look like an unedited real photograph of the existing room with the new furniture added.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
              }
            },
            {
              text: promptText
            }
          ]
        }
      ]
    });

    // The model should return an image part
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts || [];
      const imagePart = parts.find(p => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/'));
      
      if (imagePart && imagePart.inlineData) {
        return {
          success: true,
          image: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`
        };
      }
    }

    return {
      success: false,
      error: 'The AI model did not return a generated image.'
    };

  } catch (error: any) {
    console.error('Image Generation Error:', error.message || error);
    
    const errorMessage = error.message || 'Unknown API Error';
    const safeErrorMessage = errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key')
      ? 'Server misconfiguration: AI API is not properly configured.'
      : errorMessage;

    throw new Error(safeErrorMessage);
  }
};
