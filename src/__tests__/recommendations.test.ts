import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateRecommendations, RecommendationPreferences } from '@/lib/ai/recommendations';
import { Product } from '@/lib/types';

// Mock @google/genai
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

describe('AI Furniture Recommendations Engine', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  const mockCandidates: Product[] = [
    {
      id: 'prod-1',
      name: 'Nordic Oak Lounge Chair',
      category: 'Chairs',
      description: 'Lounge chair in natural oak',
      brand: 'Nordic Living',
      style: 'Scandinavian',
      color: 'Natural Oak',
      material: 'Wood',
      price: 18500,
      width: 75,
      height: 82,
      depth: 80,
      stock: 6,
      imageUrl: 'https://example.com/chair.jpg',
      model3dUrl: 'https://example.com/chair.glb',
      retailerId: 'ret-1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'prod-2',
      name: 'Velvet Deco Sofa',
      category: 'Sofas',
      description: 'Deco sofa in emerald velvet',
      brand: 'Luxe Living',
      style: 'Modern Luxury',
      color: 'Emerald Green',
      material: 'Velvet',
      price: 65000,
      width: 210,
      height: 85,
      depth: 95,
      stock: 3,
      imageUrl: 'https://example.com/sofa.jpg',
      model3dUrl: 'https://example.com/sofa.glb',
      retailerId: 'ret-1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const defaultPreferences: RecommendationPreferences = {
    roomType: 'Living Room',
    style: 'Scandinavian',
    color: 'Oak',
    minPrice: 10000,
    maxPrice: 50000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  it('throws an error if GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateRecommendations(defaultPreferences, mockCandidates)).rejects.toThrow(
      'GEMINI_API_KEY is not configured on the server.'
    );
  });

  it('generates enriched recommendation results matching candidate products', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        recommendations: [
          {
            productId: 'prod-1',
            score: 95,
            reason: 'Perfect fit for Scandinavian aesthetic.',
            roomFitReason: 'Compact frame preserves open walkway.',
            harmonyHighlight: 'Natural oak reflects sunlight.',
            placementTip: 'Place near reading lamp.',
          },
        ],
      }),
    });

    const results = await generateRecommendations(defaultPreferences, mockCandidates);
    expect(results).toHaveLength(1);
    expect(results[0].productId).toBe('prod-1');
    expect(results[0].score).toBe(95);
    expect(results[0].roomFitReason).toBe('Compact frame preserves open walkway.');
    expect(results[0].placementTip).toBe('Place near reading lamp.');
  });

  it('filters out product IDs returned by the model that are not in the candidate pool', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        recommendations: [
          { productId: 'non-existent-product', score: 99, reason: 'Fake product' },
          { productId: 'prod-2', score: 80, reason: 'Valid candidate' },
        ],
      }),
    });

    const results = await generateRecommendations(defaultPreferences, mockCandidates);
    expect(results).toHaveLength(1);
    expect(results[0].productId).toBe('prod-2');
  });

  it('handles markdown wrapped JSON responses from Gemini', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n{"recommendations": [{"productId": "prod-1", "score": 90, "reason": "Wrapped in markdown"}]}\n```',
    });

    const results = await generateRecommendations(defaultPreferences, mockCandidates);
    expect(results).toHaveLength(1);
    expect(results[0].productId).toBe('prod-1');
  });

  it('throws error gracefully if Gemini API throws an exception', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota limit reached'));
    await expect(generateRecommendations(defaultPreferences, mockCandidates)).rejects.toThrow(
      'AI recommendation generation failed.'
    );
  });
});
