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
    
    ${preferences.roomAnalysis ? `EXISTING AI ROOM ANALYSIS:\n${preferences.roomAnalysis}` : ''}
    
    CANDIDATE PRODUCTS:
    ${JSON.stringify(productContext, null, 2)}
    
    TASK:
    Analyze the customer preferences (and the room analysis if provided) against the candidate products.
    Select the top (up to 5) most suitable products. Do not recommend products that completely violate the constraints unless there are no better options, but strongly prioritize matching style, budget, and practical fit.
    
    CRITICAL INSTRUCTION:
    Respond ONLY with valid JSON. Do not include markdown code blocks. The response must precisely match this format:
    {
      "recommendations": [
        {
          "productId": "id_from_candidates",
          "score": 95,
          "reason": "1-2 short sentences explaining why this fits."
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
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanedText);
    
    if (data && data.recommendations && Array.isArray(data.recommendations)) {
      // Validate that the returned IDs actually exist in our candidates
      const validRecommendations = data.recommendations
        .filter((rec: any) => candidates.some(c => c.id === rec.productId))
        .slice(0, 5) as RecommendationResult[];
        
      return validRecommendations;
    }
    
    return [];

  } catch (error: any) {
    console.error('Recommendation AI Error:', error.message || error);
    throw new Error('AI recommendation generation failed.');
  }
};
