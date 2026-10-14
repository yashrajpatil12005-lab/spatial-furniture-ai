import { describe, it, expect } from 'vitest';
import { validateAndNormalizeRoomAnalysis, formatAnalysisText } from '@/lib/ai/gemini';

describe('Gemini Room Analysis Normalization & Formatting', () => {
  const sampleValidJson = {
    summary: 'Spacious modern living room with excellent natural light.',
    roomObservations: {
      roomType: 'Living Room',
      layoutDescription: 'Open-concept living room with large south-facing windows.',
      visibleFeatures: ['Hardwood flooring', 'White baseboards', 'Recessed ceiling lights'],
    },
    lightingAndPalette: {
      naturalLight: 'Strong direct sunlight from large south windows.',
      artificialLight: 'Warm 3000K recessed pot lights.',
      colorPalette: ['#F5F5DC Beige', '#8B4513 Walnut', '#FFFFFF White'],
      finishInteraction: 'Matte oak finish diffuses direct glare evenly.',
    },
    furnitureCompatibility: {
      styleScore: 92,
      styleHarmony: 'Scandinavian minimalist silhouette matches modern clean lines.',
      colorCoordination: 'Earthy tones complement neutral wall palette.',
      materialSynergy: 'Solid oak construction aligns with visible wood flooring.',
    },
    spatialConsiderations: {
      estimatedScaleFit: 'Fits well in the 3.5m open floor space.',
      clearanceNotes: 'Preserves a generous 110cm circulation pathway.',
      measurementDisclaimers: [
        'Camera angle may foreshorten perceived room depth.',
        'Verify physical clearance between sofa and coffee table.',
      ],
    },
    placementRecommendations: {
      suggestedSpot: 'Center on the main living area rug facing the entertainment wall.',
      reasoning: 'Creates a balanced conversational focal point.',
      practicalTips: [
        'Allow 45cm space between sofa edge and coffee table.',
        'Keep 90cm minimum distance to patio doors.',
      ],
    },
    constraintsAndUncertainties: [
      'Unseen left-hand entryway is partially outside camera frame.',
    ],
    userNextSteps: [
      'Measure physical floor area with tape measure.',
      'Check entry doorway width for delivery.',
    ],
  };

  it('correctly parses a complete, valid JSON object', () => {
    const result = validateAndNormalizeRoomAnalysis(sampleValidJson);
    expect(result.summary).toBe('Spacious modern living room with excellent natural light.');
    expect(result.roomObservations.roomType).toBe('Living Room');
    expect(result.furnitureCompatibility.styleScore).toBe(92);
    expect(result.roomObservations.visibleFeatures).toHaveLength(3);
  });

  it('strips markdown code blocks (```json ... ```) and extracts JSON properly', () => {
    const wrappedJson = '```json\n' + JSON.stringify(sampleValidJson) + '\n```';
    const result = validateAndNormalizeRoomAnalysis(wrappedJson);
    expect(result.summary).toBe(sampleValidJson.summary);
    expect(result.roomObservations.roomType).toBe('Living Room');
  });

  it('resiliently handles conversational prefix and suffix text around JSON', () => {
    const conversational = `Here is your architectural spatial analysis:\n${JSON.stringify(sampleValidJson)}\nHope this helps your design!`;
    const result = validateAndNormalizeRoomAnalysis(conversational);
    expect(result.summary).toBe(sampleValidJson.summary);
    expect(result.furnitureCompatibility.styleScore).toBe(92);
  });

  it('provides safe architectural fallbacks when fields or sections are missing', () => {
    const emptyObj = {};
    const result = validateAndNormalizeRoomAnalysis(emptyObj, 'Fallback executive summary');
    
    expect(result.summary).toBe('Fallback executive summary');
    expect(result.roomObservations.roomType).toBe('Interior Room');
    expect(result.furnitureCompatibility.styleScore).toBe(85);
    expect(result.lightingAndPalette.colorPalette).toBeInstanceOf(Array);
    expect(result.spatialConsiderations.measurementDisclaimers.length).toBeGreaterThan(0);
    expect(result.userNextSteps.length).toBeGreaterThan(0);
  });

  it('clamps styleScore safely between 0 and 100', () => {
    const overScore = { ...sampleValidJson, furnitureCompatibility: { ...sampleValidJson.furnitureCompatibility, styleScore: 150 } };
    const underScore = { ...sampleValidJson, furnitureCompatibility: { ...sampleValidJson.furnitureCompatibility, styleScore: -20 } };

    expect(validateAndNormalizeRoomAnalysis(overScore).furnitureCompatibility.styleScore).toBe(100);
    expect(validateAndNormalizeRoomAnalysis(underScore).furnitureCompatibility.styleScore).toBe(0);
  });

  it('formats comprehensive markdown summary incorporating all 6 dimensions', () => {
    const data = validateAndNormalizeRoomAnalysis(sampleValidJson);
    const markdown = formatAnalysisText(data);

    expect(markdown).toContain('### Overview');
    expect(markdown).toContain('### Room Observations (Living Room)');
    expect(markdown).toContain('### Lighting & Color Palette');
    expect(markdown).toContain('### Furniture Compatibility (92% Match)');
    expect(markdown).toContain('### Spatial & Dimensional Considerations');
    expect(markdown).toContain('### Suggested Placement & Practical Considerations');
    expect(markdown).toContain('### Potential Constraints & Uncertainties');
    expect(markdown).toContain('### Next Steps');
  });
});
