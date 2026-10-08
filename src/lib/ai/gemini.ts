import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product, FurnitureCustomization } from '../types';

export const generateRoomVisualizationConcept = async (
  imageBuffer: Buffer,
  mimeType: string,
  product: Product,
  customization: FurnitureCustomization
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  // Initialize the Gemini API client securely on the server
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // We use gemini-2.5-flash for fast, advanced visual reasoning
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Prepare the multimodal prompt
  const prompt = `
    You are an expert interior design AI. I have uploaded an image of a room.
    Please analyze this room's visible environment (walls, floor, lighting, available space).
    
    I want to visualize placing a piece of furniture in this room:
    Furniture: ${product.name}
    Category: ${product.category}
    Style: ${product.style}
    
    The customer has customized this furniture with the following specs:
    Color: ${customization.color}
    Material: ${customization.material}
    Finish: ${customization.finish}
    Dimensions: ${customization.width}cm (Width) x ${customization.height}cm (Height) x ${customization.depth}cm (Depth)

    Since you cannot generate images, please provide a highly detailed, realistic description of how this exact piece of customized furniture would look placed naturally in the uploaded room. Mention the lighting, spatial context, and how the customized color and material interact with the room's existing decor.
  `;

  // Convert buffer to base64 for the API payload (never logged)
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Standard Gemini 2.5 Flash cannot generate pixel images, so we strictly flag it.
    // If we were using Imagen 3 via Vertex AI, we would return the image buffer here.
    return {
      imageGenerated: false,
      message: 'The configured Gemini model (gemini-2.5-flash) supports advanced multimodal room analysis but does not support direct image generation.',
      analysis: responseText
    };

  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    throw new Error('An error occurred while calling the Gemini API.');
  }
};
