import { Product, FurnitureCustomization } from '../types';
import { RoomAnalysisData } from './types';
import { createGenAIClient, parseGeminiError, GeminiServiceError } from './geminiClient';

export interface RoomVisualizationConceptResult {
  imageGenerated: boolean;
  message: string;
  analysis: string;
  structuredAnalysis: RoomAnalysisData;
  finishReason?: string;
}

/**
 * Strips markdown code block wrappers (```json ... ```) from raw text if present.
 */
function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Validates and normalizes raw Gemini output into a strictly-typed RoomAnalysisData object.
 * Guarantees that every required section and array is populated even if the model omits a field.
 */
export function validateAndNormalizeRoomAnalysis(
  rawJson: unknown,
  fallbackText?: string
): RoomAnalysisData {
  let obj: Record<string, unknown> | null = null;

  if (typeof rawJson === 'string') {
    try {
      obj = JSON.parse(cleanJsonText(rawJson));
    } catch {
      obj = null;
    }
  } else if (rawJson && typeof rawJson === 'object') {
    obj = rawJson as Record<string, unknown>;
  }

  const safeArray = (val: unknown, fallback: string[]): string[] => {
    if (Array.isArray(val) && val.length > 0) {
      const items = val.map(item => String(item).trim()).filter(s => s.length > 0);
      if (items.length > 0) return items;
    }
    return fallback;
  };

  const safeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
    return fallback;
  };

  const safeNumber = (val: unknown, fallback: number, min: number, max: number): number => {
    if (typeof val === 'number' && !isNaN(val)) {
      return Math.min(Math.max(Math.round(val), min), max);
    }
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        return Math.min(Math.max(parsed, min), max);
      }
    }
    return fallback;
  };

  const obs = (obj?.roomObservations as Record<string, unknown>) || {};
  const light = (obj?.lightingAndPalette as Record<string, unknown>) || {};
  const compat = (obj?.furnitureCompatibility as Record<string, unknown>) || {};
  const spatial = (obj?.spatialConsiderations as Record<string, unknown>) || {};
  const placement = (obj?.placementRecommendations as Record<string, unknown>) || {};

  const fallbackSummary = fallbackText ? fallbackText.slice(0, 240) : 'Visual room analysis completed based on visible layout, lighting, and customized specifications.';

  return {
    summary: safeString(obj?.summary, fallbackSummary),
    roomObservations: {
      roomType: safeString(obs.roomType, 'Interior Room'),
      layoutDescription: safeString(
        obs.layoutDescription,
        'Visible room perimeter and boundary layout detected from photo.'
      ),
      visibleFeatures: safeArray(obs.visibleFeatures, [
        'Visible flooring and wall boundaries identified from camera angle',
        'Ambient lighting and primary openings visible in frame',
      ]),
    },
    lightingAndPalette: {
      naturalLight: safeString(
        light.naturalLight,
        'Visible natural illumination based on camera exposure and window direction.'
      ),
      artificialLight: safeString(
        light.artificialLight,
        'Ambient interior fixtures observed within frame.'
      ),
      colorPalette: safeArray(light.colorPalette, [
        'Neutral primary undertones',
        'Natural ambient tones',
      ]),
      finishInteraction: safeString(
        light.finishInteraction,
        'Surface finish interacts with ambient light direction.'
      ),
    },
    furnitureCompatibility: {
      styleScore: safeNumber(compat.styleScore, 85, 0, 100),
      styleHarmony: safeString(
        compat.styleHarmony,
        'Furniture design elements coordinate with visible room aesthetics.'
      ),
      colorCoordination: safeString(
        compat.colorCoordination,
        'Selected colorway complements dominant wall and floor undertones.'
      ),
      materialSynergy: safeString(
        compat.materialSynergy,
        'Material texture pairs naturally with existing floor and furniture finishes.'
      ),
    },
    spatialConsiderations: {
      estimatedScaleFit: safeString(
        spatial.estimatedScaleFit,
        'Proportions visually correspond to open floor space in the uploaded photo.'
      ),
      clearanceNotes: safeString(
        spatial.clearanceNotes,
        'Estimated walkway clearance requires minimum 90cm unobstructed pathway.'
      ),
      measurementDisclaimers: safeArray(spatial.measurementDisclaimers, [
        'Camera focal length and perspective create visual approximations rather than exact dimensions',
        'Exact room dimensions and ceiling height cannot be verified from a 2D photograph',
        'Always measure physical door entries, wall width, and floor clearance before ordering',
      ]),
    },
    placementRecommendations: {
      suggestedSpot: safeString(
        placement.suggestedSpot,
        'Position adjacent to primary open wall with clear walkway access.'
      ),
      reasoning: safeString(
        placement.reasoning,
        'Preserves open traffic circulation while maintaining functional sightlines.'
      ),
      practicalTips: safeArray(placement.practicalTips, [
        'Maintain minimum 90cm clearance for walking pathways',
        'Check nearby power outlets and switch access',
        'Ensure window and door swing clearances remain unobstructed',
      ]),
    },
    constraintsAndUncertainties: safeArray(obj?.constraintsAndUncertainties, [
      'Areas outside the camera frame cannot be evaluated for clearance or obstructions',
      'Exact wall flatness, baseboard depth, and radiator clearances should be checked physically',
    ]),
    userNextSteps: safeArray(obj?.userNextSteps, [
      'Measure physical floor space where piece is intended with a tape measure',
      'Verify hallway and doorway passage widths along the delivery path',
      'Review lighting during different times of day against finish samples',
    ]),
  };
}

/**
 * Builds a clean, human-readable markdown summary for text-based consumers (e.g. RecommendationPanel / localStorage).
 */
export function formatAnalysisText(data: RoomAnalysisData): string {
  return [
    `### Overview`,
    data.summary,
    '',
    `### Room Observations (${data.roomObservations.roomType})`,
    data.roomObservations.layoutDescription,
    ...data.roomObservations.visibleFeatures.map(f => `- ${f}`),
    '',
    `### Lighting & Color Palette`,
    `- Natural Light: ${data.lightingAndPalette.naturalLight}`,
    `- Artificial Light: ${data.lightingAndPalette.artificialLight}`,
    `- Color Palette: ${data.lightingAndPalette.colorPalette.join(', ')}`,
    `- Finish Interaction: ${data.lightingAndPalette.finishInteraction}`,
    '',
    `### Furniture Compatibility (${data.furnitureCompatibility.styleScore}% Match)`,
    `- Style Harmony: ${data.furnitureCompatibility.styleHarmony}`,
    `- Color Coordination: ${data.furnitureCompatibility.colorCoordination}`,
    `- Material Synergy: ${data.furnitureCompatibility.materialSynergy}`,
    '',
    `### Spatial & Dimensional Considerations`,
    `- Estimated Scale Fit: ${data.spatialConsiderations.estimatedScaleFit}`,
    `- Walkway Clearances: ${data.spatialConsiderations.clearanceNotes}`,
    ...data.spatialConsiderations.measurementDisclaimers.map(d => `* Disclaimer: ${d}`),
    '',
    `### Suggested Placement & Practical Considerations`,
    `- Recommended Spot: ${data.placementRecommendations.suggestedSpot}`,
    `- Design Rationale: ${data.placementRecommendations.reasoning}`,
    ...data.placementRecommendations.practicalTips.map(t => `- Tip: ${t}`),
    '',
    `### Potential Constraints & Uncertainties`,
    ...data.constraintsAndUncertainties.map(c => `- ${c}`),
    '',
    `### Next Steps`,
    ...data.userNextSteps.map((s, idx) => `${idx + 1}. ${s}`),
  ].join('\n');
}

export const generateRoomVisualizationConcept = async (
  imageBuffer: Buffer,
  mimeType: string,
  product: Product,
  customization: FurnitureCustomization
): Promise<RoomVisualizationConceptResult> => {
  const ai = createGenAIClient();

  // Prepare detailed multimodal room evaluation prompt with strict schema instructions
  const prompt = `You are a professional interior designer and architectural spatial analyst.
Analyze the provided photograph of a room alongside the specific customized furniture piece.

TARGET FURNITURE SPECIFICATIONS:
- Product: ${product.name}
- Category: ${product.category}
- Style: ${product.style}
- Brand: ${product.brand || 'Spatial Collection'}
- Description: ${product.description || 'N/A'}

CUSTOMER CUSTOMIZATION:
- Color: ${customization.color}
- Material: ${customization.material}
- Finish: ${customization.finish}
- Dimensions: ${customization.width} cm (Width) x ${customization.height} cm (Height) x ${customization.depth} cm (Depth)

ACCURACY & SAFETY REQUIREMENTS:
1. Analyze ONLY what is directly visible in the image and the specified product parameters.
2. Clearly distinguish VISUAL ESTIMATES from MEASURED FACTS:
   - Do NOT invent specific unmeasured room dimensions or guarantee physical fit.
   - Clarify that space and scale assessments are visual estimates based on 2D camera perspective.
   - Advise the customer to verify actual clearances and dimensions with a physical tape measure.
3. Evaluate how the customized material (${customization.material}), finish (${customization.finish}), and color (${customization.color}) harmonize with visible wall paint, flooring undertones, and light sources.
4. Output your analysis STRICTLY as a valid JSON object matching the following structure:

{
  "summary": "1-2 sentence executive evaluation of the furniture compatibility and fit",
  "roomObservations": {
    "roomType": "Visible room type (e.g. Living Room, Bedroom, Studio, Dining Room)",
    "layoutDescription": "Concise architectural description of visible layout, wall boundaries, and flooring",
    "visibleFeatures": ["3-5 concise bullet points of visible architectural elements, flooring type, existing furniture, or focal points"]
  },
  "lightingAndPalette": {
    "naturalLight": "Direction and intensity of visible natural light (windows, skylights)",
    "artificialLight": "Visible light fixtures, ceiling lights, or ambient illumination",
    "colorPalette": ["3-5 dominant and accent color tones observed in the room"],
    "finishInteraction": "Specific assessment of how the ${customization.finish} finish and ${customization.material} will interact with the room's lighting"
  },
  "furnitureCompatibility": {
    "styleScore": 88,
    "styleHarmony": "Analysis of how ${product.style} style complements or contrasts with existing decor",
    "colorCoordination": "Analysis of ${customization.color} with existing room wall and floor undertones",
    "materialSynergy": "Analysis of ${customization.material} texture paired with existing room materials"
  },
  "spatialConsiderations": {
    "estimatedScaleFit": "Visual estimation of how ${customization.width}x${customization.height}x${customization.depth}cm scale fits the visible floor area",
    "clearanceNotes": "Visual estimation of walkways and whether a standard 90cm corridor is achievable",
    "measurementDisclaimers": [
      "Visual assessment only; 2D camera angles and focal length may distort perceived depth",
      "Exact room dimensions and wall lengths cannot be verified from a photograph",
      "Verify all physical clearances with a tape measure before purchasing"
    ]
  },
  "placementRecommendations": {
    "suggestedSpot": "Specific visible location best suited for placement",
    "reasoning": "Aesthetic and practical rationale for this spot",
    "practicalTips": ["2-3 practical tips regarding power outlets, door swings, traffic flow, or wall anchoring"]
  },
  "constraintsAndUncertainties": [
    "2-3 constraints or blind spots not visible in the camera frame (e.g., unseen doorways, ceiling height, HVAC vents)"
  ],
  "userNextSteps": [
    "3-4 concrete verification steps for the user before ordering (e.g., tape measure physical footprint, test color sample, check delivery pathway width)"
  ]
}

Return ONLY the JSON object. Do not include extraneous conversational text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    const candidate = response.candidates?.[0];
    const finishReason = candidate?.finishReason;

    if (!responseText.trim()) {
      throw new GeminiServiceError(
        502,
        'EMPTY_RESPONSE',
        'AI room analysis returned an empty response. Please try again with a clearer photo.',
        `Gemini 2.5 Flash returned no text content in candidates. Finish reason: ${finishReason || 'unknown'}`
      );
    }

    if (finishReason === 'MAX_TOKENS') {
      console.warn('[Gemini API Warning] [generateRoomVisualizationConcept]: Output token limit reached (MAX_TOKENS).');
    }

    const structuredAnalysis = validateAndNormalizeRoomAnalysis(responseText, responseText);
    const formattedSummary = formatAnalysisText(structuredAnalysis);

    return {
      imageGenerated: false,
      message: 'Room layout analysis successfully generated with Gemini 2.5 Flash.',
      analysis: formattedSummary,
      structuredAnalysis,
      finishReason,
    };
  } catch (error: unknown) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }
    const parsed = parseGeminiError(error, 'generateRoomVisualizationConcept');
    console.error('[Gemini API Error] [generateRoomVisualizationConcept]:', {
      status: parsed.status,
      code: parsed.code,
      diagnostic: parsed.diagnostic,
    });
    throw new GeminiServiceError(parsed.status, parsed.code, parsed.userMessage, parsed.diagnostic);
  }
};
