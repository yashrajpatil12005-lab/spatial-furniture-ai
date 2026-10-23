/**
 * Per-User Resend Rate Limiter — Spatial Furniture AI
 *
 * Enforces:
 * - Up to 5 verification email resends per user per sliding 1-hour window.
 * - 60-second cooldown between successful sends or Firebase throttle events.
 * - Per-authenticated-user tracking (keyed by UID with optional email alias).
 * - Persistent storage (localStorage with memory fallback) across page reloads/restarts.
 * - Failed requests and Firebase throttle events do NOT count towards user's 5-resend quota.
 */

export const MAX_RESENDS_PER_HOUR = 5;
export const RESEND_COOLDOWN_SECONDS = 60;
export const ONE_HOUR_MS = 60 * 60 * 1000;

export interface ResendRateStatus {
  allowed: boolean;
  reason?: 'cooldown' | 'hourly_limit';
  remainingAttempts: number;
  cooldownSeconds: number;
  retryAfterSeconds: number;
}

export interface UserResendRecord {
  timestamps: number[];
  lastSentTimestamp: number;
}

const STORAGE_KEY_PREFIX = 'spatial_auth_resend_rate_';
const inMemoryStore = new Map<string, UserResendRecord>();

/**
 * Retrieves the raw record for a given user from localStorage (or in-memory fallback).
 */
export function getUserResendRecord(userId: string): UserResendRecord {
  if (!userId) {
    return { timestamps: [], lastSentTimestamp: 0 };
  }

  // 1. Try reading from localStorage in browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.timestamps) && typeof parsed.lastSentTimestamp === 'number') {
          return parsed as UserResendRecord;
        }
      }
    } catch {
      // Ignore localStorage read errors (e.g., private browsing mode quota)
    }
  }

  // 2. Fallback to in-memory store
  return inMemoryStore.get(userId) || { timestamps: [], lastSentTimestamp: 0 };
}

/**
 * Saves the record for a given user to localStorage (and in-memory store).
 */
export function saveUserResendRecord(userId: string, record: UserResendRecord): void {
  if (!userId) return;

  inMemoryStore.set(userId, record);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(record));
    } catch {
      // Ignore localStorage write errors
    }
  }
}

/**
 * Evaluates whether a user is currently allowed to send/resend a verification email.
 * Cleans up timestamps older than 1 hour.
 * Supports primary identifier (e.g., UID) and alternate identifier (e.g., email address).
 */
export function checkResendRateLimit(
  userId: string,
  currentTimeMs: number = Date.now(),
  alternateIdentifier?: string
): ResendRateStatus {
  let record = getUserResendRecord(userId);

  // If primary identifier has no records, check alternate identifier (e.g. email)
  if ((!record.lastSentTimestamp && record.timestamps.length === 0) && alternateIdentifier) {
    const altRecord = getUserResendRecord(alternateIdentifier);
    if (altRecord.lastSentTimestamp || altRecord.timestamps.length > 0) {
      record = altRecord;
    }
  }

  // Filter timestamps within the sliding 1-hour window
  const validTimestamps = record.timestamps.filter(
    (ts) => currentTimeMs - ts < ONE_HOUR_MS && ts <= currentTimeMs
  );

  // Check 60-second cooldown from last send or throttle event
  if (record.lastSentTimestamp > 0) {
    const elapsedSeconds = Math.floor((currentTimeMs - record.lastSentTimestamp) / 1000);
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS && elapsedSeconds >= 0) {
      const cooldownSeconds = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      const remainingAttempts = Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length);
      return {
        allowed: false,
        reason: 'cooldown',
        remainingAttempts,
        cooldownSeconds,
        retryAfterSeconds: cooldownSeconds,
      };
    }
  }

  // Check maximum 5 attempts per sliding hour
  if (validTimestamps.length >= MAX_RESENDS_PER_HOUR) {
    const oldestTimestamp = Math.min(...validTimestamps);
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + ONE_HOUR_MS - currentTimeMs) / 1000));
    return {
      allowed: false,
      reason: 'hourly_limit',
      remainingAttempts: 0,
      cooldownSeconds: 0,
      retryAfterSeconds,
    };
  }

  // Allowed
  const remainingAttempts = MAX_RESENDS_PER_HOUR - validTimestamps.length;
  return {
    allowed: true,
    remainingAttempts,
    cooldownSeconds: 0,
    retryAfterSeconds: 0,
  };
}

/**
 * Records a successful verification email dispatch for the user.
 * Call this ONLY AFTER Firebase sendEmailVerification() confirms success.
 */
export function recordSuccessfulResend(
  userId: string,
  timestampMs: number = Date.now(),
  alternateIdentifier?: string
): ResendRateStatus {
  if (!userId && !alternateIdentifier) {
    return {
      allowed: false,
      remainingAttempts: 0,
      cooldownSeconds: 0,
      retryAfterSeconds: 0,
    };
  }

  const primaryId = userId || alternateIdentifier || '';
  const record = getUserResendRecord(primaryId);

  // Keep only timestamps within 1 hour, then append new timestamp
  const validTimestamps = record.timestamps.filter(
    (ts) => timestampMs - ts < ONE_HOUR_MS && ts <= timestampMs
  );
  validTimestamps.push(timestampMs);

  const updatedRecord: UserResendRecord = {
    timestamps: validTimestamps,
    lastSentTimestamp: timestampMs,
  };

  if (userId) saveUserResendRecord(userId, updatedRecord);
  if (alternateIdentifier) saveUserResendRecord(alternateIdentifier, updatedRecord);

  return checkResendRateLimit(primaryId, timestampMs);
}

/**
 * Records a cooldown due to a Firebase server-side throttle (auth/too-many-requests).
 * PRESERVES the user's hourly quota (does NOT add to timestamps).
 * Sets lastSentTimestamp so the frontend prevents rapid retries while throttled.
 */
export function recordThrottleCooldown(
  userId: string,
  cooldownSeconds: number = RESEND_COOLDOWN_SECONDS,
  alternateIdentifier?: string,
  timestampMs: number = Date.now()
): ResendRateStatus {
  const primaryId = userId || alternateIdentifier || '';
  if (!primaryId) {
    return {
      allowed: false,
      remainingAttempts: 0,
      cooldownSeconds,
      retryAfterSeconds: cooldownSeconds,
    };
  }

  const record = getUserResendRecord(primaryId);

  // Keep existing timestamps without adding a new one (quota is strictly preserved!)
  const validTimestamps = record.timestamps.filter(
    (ts) => timestampMs - ts < ONE_HOUR_MS && ts <= timestampMs
  );

  // Calculate synthetic lastSentTimestamp based on requested cooldownSeconds
  const syntheticLastSent = timestampMs - (RESEND_COOLDOWN_SECONDS - cooldownSeconds) * 1000;

  const updatedRecord: UserResendRecord = {
    timestamps: validTimestamps,
    lastSentTimestamp: Math.max(record.lastSentTimestamp, syntheticLastSent),
  };

  if (userId) saveUserResendRecord(userId, updatedRecord);
  if (alternateIdentifier) saveUserResendRecord(alternateIdentifier, updatedRecord);

  return checkResendRateLimit(primaryId, timestampMs);
}

/**
 * Clears the rate limit record for a user (useful for tests or administrative resets).
 */
export function resetResendRateLimit(userId: string, alternateIdentifier?: string): void {
  if (userId) {
    inMemoryStore.delete(userId);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${userId}`);
      } catch {
        // Ignore
      }
    }
  }

  if (alternateIdentifier) {
    inMemoryStore.delete(alternateIdentifier);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${alternateIdentifier}`);
      } catch {
        // Ignore
      }
    }
  }
}
