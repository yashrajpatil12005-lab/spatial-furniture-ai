import { Product, FurnitureCustomization } from '../types';

export interface VisualizationRequest {
  image: File; // on the client side
  product: Product;
  customization: FurnitureCustomization;
}

export interface VisualizationResponse {
  success: boolean;
  imageGenerated: boolean;
  imageUrl?: string; // Would contain the base64 or hosted URL if generated
  message: string;
  error?: string;
  analysis?: string; // Text analysis of the room provided by Gemini vision
}
