import { GoogleGenAI } from '@google/genai';

/**
 * Custom error class capturing HTTP status, error code, safe user message,
 * and sanitized diagnostic information for server logging.
 */
export class GeminiServiceError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly diagnostic: string;

  constructor(status: number, code: string, userMessage: string, diagnostic: string) {
    super(userMessage);
    this.name = 'GeminiServiceError';
    this.status = status;
    this.code = code;
    this.userMessage = userMessage;
    this.diagnostic = diagnostic;
  }
}

/**
 * Safely strips any sensitive API keys, authorization bearer tokens,
 * or raw image base64 strings from messages or logs.
 */
export function sanitizeErrorMessage(message: unknown): string {
  if (!message) return 'Unknown error occurred.';
  const str = typeof message === 'string' ? message : message instanceof Error ? message.message : String(message);

  return str
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/data:image\/[a-zA-Z]+;base64,[^"'\s]+/g, '[REDACTED_IMAGE_DATA]')
    .replace(/"data"\s*:\s*"[^"]+"/g, '"data":"[REDACTED_IMAGE_DATA]"');
}

/**
 * Resolves the Gemini API key from standard server-side environment variables.
 * Trims surrounding whitespace and quotes.
 * Supports GEMINI_API_KEY, GOOGLE_API_KEY, and GOOGLE_GENAI_API_KEY.
 */
export function getGeminiApiKey(): string | undefined {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!rawKey) return undefined;

  let trimmed = rawKey.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.substring(1, trimmed.length - 1).trim();
  }

  return trimmed.length > 0 ? trimmed : undefined;
}

export interface ParsedGeminiError {
  status: number;
  code: string;
  userMessage: string;
  diagnostic: string;
}

/**
 * Distinguishes among invalid API key, missing environment variable,
 * unsupported model, quota exhaustion (429), permission errors (403),
 * invalid request (400), and upstream server errors (5xx).
 */
export function parseGeminiError(error: unknown, context: string): ParsedGeminiError {
  const rawMsg =
    error instanceof Error ? error.message : typeof error === 'string' ? error : String(error || '');
  const sanitized = sanitizeErrorMessage(rawMsg);

  const errorObj = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  const statusNumber = typeof errorObj.status === 'number' ? errorObj.status : undefined;

  // 1. Missing API Key
  if (
    rawMsg.includes('API key is not configured') ||
    rawMsg.includes('GEMINI_API_KEY is not configured') ||
    rawMsg.includes('API_KEY_MISSING')
  ) {
    return {
      status: 503,
      code: 'API_KEY_MISSING',
      userMessage:
        'The AI service is currently not configured on this server. Please check the GEMINI_API_KEY environment variable in server deployment settings.',
      diagnostic: `[${context}] GEMINI_API_KEY is not configured or empty in server environment variables.`,
    };
  }

  // 2. Quota Exhaustion / Rate Limits (429 / RESOURCE_EXHAUSTED)
  if (
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('Quota exceeded') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('429') ||
    statusNumber === 429
  ) {
    return {
      status: 429,
      code: 'QUOTA_EXHAUSTED',
      userMessage:
        'AI service request limit or quota exceeded for this account. Please wait a few moments before trying again.',
      diagnostic: `[${context}] Gemini Quota Exceeded (429 RESOURCE_EXHAUSTED): ${sanitized.slice(0, 250)}`,
    };
  }

  // 3. Invalid or Rejected API Key / Permission Denied (401 / 403)
  if (
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('API key not valid') ||
    rawMsg.includes('PERMISSION_DENIED') ||
    statusNumber === 401 ||
    statusNumber === 403
  ) {
    return {
      status: 503,
      code: 'API_KEY_INVALID',
      userMessage:
        'AI service authentication failed on the server. Please check the configured Gemini API key in server deployment settings.',
      diagnostic: `[${context}] Gemini API credentials rejected: ${sanitized.slice(0, 200)}`,
    };
  }

  // 4. Model Unsupported / Not Found / Deprecated (404)
  if (
    rawMsg.includes('NOT_FOUND') ||
    rawMsg.includes('not found for API version') ||
    rawMsg.includes('is no longer available') ||
    statusNumber === 404
  ) {
    return {
      status: 502,
      code: 'MODEL_UNSUPPORTED',
      userMessage:
        'The configured AI model is currently unavailable or has been updated by the provider.',
      diagnostic: `[${context}] Gemini Model Not Found (404): ${sanitized.slice(0, 200)}`,
    };
  }

  // 5. Invalid Argument / Payload Format (400)
  if (
    rawMsg.includes('INVALID_ARGUMENT') ||
    rawMsg.includes('Bad Request') ||
    statusNumber === 400
  ) {
    return {
      status: 400,
      code: 'INVALID_ARGUMENT',
      userMessage:
        'The uploaded image format or furniture specifications could not be processed by the AI model.',
      diagnostic: `[${context}] Invalid Argument (400): ${sanitized.slice(0, 200)}`,
    };
  }

  // 6. Upstream / Server Error (5xx)
  const is5xx = statusNumber && statusNumber >= 500 && statusNumber < 600;
  return {
    status: is5xx ? statusNumber : 502,
    code: 'UPSTREAM_ERROR',
    userMessage:
      'The AI service encountered a temporary error while analyzing your room. Please try again in a few moments.',
    diagnostic: `[${context}] Upstream error (${statusNumber || 502}): ${sanitized.slice(0, 250)}`,
  };
}

/**
 * Creates and returns an initialized GoogleGenAI client instance.
 * Throws GeminiServiceError if no key is configured.
 */
export function createGenAIClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new GeminiServiceError(
      503,
      'API_KEY_MISSING',
      'The AI service is currently not configured on this server. Please check the GEMINI_API_KEY environment variable in server deployment settings.',
      'Missing GEMINI_API_KEY in server environment variables.'
    );
  }

  return new GoogleGenAI({ apiKey });
}
