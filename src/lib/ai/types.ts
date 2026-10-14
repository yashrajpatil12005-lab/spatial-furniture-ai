import { Product, FurnitureCustomization } from '../types';

export interface VisualizationRequest {
  image: File; // on the client side
  product: Product;
  customization: FurnitureCustomization;
}

export interface RoomObservations {
  roomType: string;
  layoutDescription: string;
  visibleFeatures: string[];
}

export interface LightingAndPalette {
  naturalLight: string;
  artificialLight: string;
  colorPalette: string[];
  finishInteraction: string;
}

export interface FurnitureCompatibility {
  styleScore: number;
  styleHarmony: string;
  colorCoordination: string;
  materialSynergy: string;
}

export interface SpatialConsiderations {
  estimatedScaleFit: string;
  clearanceNotes: string;
  measurementDisclaimers: string[];
}

export interface PlacementRecommendations {
  suggestedSpot: string;
  reasoning: string;
  practicalTips: string[];
}

export interface RoomAnalysisData {
  summary: string;
  roomObservations: RoomObservations;
  lightingAndPalette: LightingAndPalette;
  furnitureCompatibility: FurnitureCompatibility;
  spatialConsiderations: SpatialConsiderations;
  placementRecommendations: PlacementRecommendations;
  constraintsAndUncertainties: string[];
  userNextSteps: string[];
}

export interface VisualizationResponse {
  success: boolean;
  imageGenerated: boolean;
  imageUrl?: string; // Would contain the base64 or hosted URL if generated
  message: string;
  error?: string;
  analysis?: string; // Text analysis of the room provided by Gemini vision
  structuredAnalysis?: RoomAnalysisData;
  finishReason?: string;
}
