import { type Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { 
  checkResendRateLimit, 
  recordSuccessfulResend, 
  recordThrottleCooldown,
  MAX_RESENDS_PER_HOUR as IN_MEMORY_MAX_RESENDS,
  RESEND_COOLDOWN_SECONDS as IN_MEMORY_COOLDOWN_SECONDS,
  ONE_HOUR_MS as IN_MEMORY_ONE_HOUR_MS,
} from '@/lib/utils/resendRateLimiter';

/**
 * Spatial Furniture AI — Persistent Serverless-Safe Email Verification Rate Limiter
 * 
 * Enforces:
 * - 60-second cooldown between verification dispatches.
 * - Maximum 5 successful dispatches per user per rolling 1-hour window.
 * - Concurrency safety via Firestore runTransaction reservation/commit/release protocol.
 * - Prevents race conditions across separate Vercel serverless function instances & cold starts.
 * - Stored in dedicated collection 'email_rate_limits', keyed by authenticated Firebase UID.
 * - 100% Free on Firebase Spark Plan (uses minimal reads/writes well below daily 20k/50k limits).
 */

export const RATE_LIMIT_COLLECTION = 'email_rate_limits';
export const MAX_RESENDS_PER_HOUR = IN_MEMORY_MAX_RESENDS; // 5
export const RESEND_COOLDOWN_SECONDS = IN_MEMORY_COOLDOWN_SECONDS; // 60
export const ONE_HOUR_MS = IN_MEMORY_ONE_HOUR_MS; // 3,600,000 ms
export const RESERVATION_TTL_MS = 30 * 1000; // 30 seconds

export interface RateLimitReservation {
  reservationId: string;
  reservedAt: number; // epoch ms
  expiresAt: number;  // epoch ms (reservedAt + RESERVATION_TTL_MS)
}

export interface EmailRateLimitDoc {
  uid: string;
  timestamps: number[];        // confirmed send timestamps in rolling 1-hour window
  lastSentTimestamp: number;   // timestamp of last successful send (or timeout cooldown)
  pendingReservation?: RateLimitReservation | null;
  updatedAt: number;
}

export type RateLimitReason = 'cooldown' | 'hourly_limit' | 'in_flight';

export interface ReservationResult {
  allowed: boolean;
  reservationId?: string;
  reason?: RateLimitReason;
  remainingAttempts: number;
  cooldownSeconds: number;
  retryAfterSeconds: number;
}

export interface CommitResult {
  success: boolean;
  remainingAttempts: number;
  lastSentTimestamp: number;
  error?: string;
}

export interface ReleaseOptions {
  isTimeout?: boolean;
  failureReason?: string;
}

/**
 * Phase 1: Atomically attempts to reserve a rate-limited dispatch slot for the user.
 * 
 * Guarantees:
 * - If cooldown is active: rejects with 'cooldown'
 * - If 5 sends in rolling 1h: rejects with 'hourly_limit'
 * - If another dispatch is in-flight: rejects with 'in_flight'
 * - If available: atomically locks slot with unique reservationId and 30s TTL
 */
export async function reserveResendSlot(
  uid: string,
  currentTimeMs: number = Date.now(),
  customDb?: Firestore
): Promise<ReservationResult> {
  if (!uid) {
    return {
      allowed: false,
      reason: 'cooldown',
      remainingAttempts: 0,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      retryAfterSeconds: RESEND_COOLDOWN_SECONDS,
    };
  }

  const db = customDb || getAdminFirestore();

  // Graceful fallback to memory limiter if Firestore Admin is uninitialized (e.g. dev without keys)
  if (!db) {
    const memStatus = checkResendRateLimit(uid, currentTimeMs);
    if (!memStatus.allowed) {
      return {
        allowed: false,
        reason: memStatus.reason as RateLimitReason,
        remainingAttempts: memStatus.remainingAttempts,
        cooldownSeconds: memStatus.cooldownSeconds,
        retryAfterSeconds: memStatus.retryAfterSeconds,
      };
    }
    const syntheticId = `mem_res_${currentTimeMs}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      allowed: true,
      reservationId: syntheticId,
      remainingAttempts: memStatus.remainingAttempts,
      cooldownSeconds: 0,
      retryAfterSeconds: 0,
    };
  }

  const docRef = db.collection(RATE_LIMIT_COLLECTION).doc(uid);

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);

    let timestamps: number[] = [];
    let lastSentTimestamp = 0;
    let pendingReservation: RateLimitReservation | null = null;

    if (docSnap.exists) {
      const data = docSnap.data() as EmailRateLimitDoc;
      timestamps = Array.isArray(data.timestamps) ? data.timestamps : [];
      lastSentTimestamp = typeof data.lastSentTimestamp === 'number' ? data.lastSentTimestamp : 0;
      pendingReservation = data.pendingReservation || null;
    }

    // Filter timestamps within the sliding 1-hour window
    const validTimestamps = timestamps.filter(
      (ts) => currentTimeMs - ts < ONE_HOUR_MS && ts <= currentTimeMs
    );

    // 1. Check if there is an active (unexpired) in-flight reservation
    if (pendingReservation && pendingReservation.expiresAt > currentTimeMs) {
      const inFlightRemaining = Math.max(1, Math.ceil((pendingReservation.expiresAt - currentTimeMs) / 1000));
      const remainingAttempts = Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length);
      return {
        allowed: false,
        reason: 'in_flight',
        remainingAttempts,
        cooldownSeconds: inFlightRemaining,
        retryAfterSeconds: inFlightRemaining,
      };
    }

    // 2. Check 60-second cooldown from last successful send (or timeout)
    if (lastSentTimestamp > 0) {
      const elapsed = Math.floor((currentTimeMs - lastSentTimestamp) / 1000);
      if (elapsed < RESEND_COOLDOWN_SECONDS && elapsed >= 0) {
        const cooldownRemaining = RESEND_COOLDOWN_SECONDS - elapsed;
        const remainingAttempts = Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length);
        return {
          allowed: false,
          reason: 'cooldown',
          remainingAttempts,
          cooldownSeconds: cooldownRemaining,
          retryAfterSeconds: cooldownRemaining,
        };
      }
    }

    // 3. Check 5 sends per rolling hour limit
    if (validTimestamps.length >= MAX_RESENDS_PER_HOUR) {
      const oldest = Math.min(...validTimestamps);
      const retryAfter = Math.max(1, Math.ceil((oldest + ONE_HOUR_MS - currentTimeMs) / 1000));
      return {
        allowed: false,
        reason: 'hourly_limit',
        remainingAttempts: 0,
        cooldownSeconds: 0,
        retryAfterSeconds: retryAfter,
      };
    }

    // 4. Reserve slot atomically
    const reservationId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `res_${currentTimeMs}_${Math.random().toString(36).substring(2, 9)}`;

    const newReservation: RateLimitReservation = {
      reservationId,
      reservedAt: currentTimeMs,
      expiresAt: currentTimeMs + RESERVATION_TTL_MS,
    };

    transaction.set(docRef, {
      uid,
      timestamps: validTimestamps,
      lastSentTimestamp,
      pendingReservation: newReservation,
      updatedAt: currentTimeMs,
    });

    const remainingAttempts = Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length);
    return {
      allowed: true,
      reservationId,
      remainingAttempts,
      cooldownSeconds: 0,
      retryAfterSeconds: 0,
    };
  });
}

/**
 * Phase 2: Commits a successful email dispatch in Firestore.
 * 
 * Clears the reservation, records the new timestamp, updates lastSentTimestamp,
 * and increments the user's hourly usage quota.
 */
export async function commitResendSlot(
  uid: string,
  reservationId: string,
  commitTimeMs: number = Date.now(),
  customDb?: Firestore
): Promise<CommitResult> {
  const db = customDb || getAdminFirestore();

  if (!db) {
    recordSuccessfulResend(uid, commitTimeMs);
    return {
      success: true,
      remainingAttempts: MAX_RESENDS_PER_HOUR - 1,
      lastSentTimestamp: commitTimeMs,
    };
  }

  const docRef = db.collection(RATE_LIMIT_COLLECTION).doc(uid);

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);

    if (!docSnap.exists) {
      return {
        success: false,
        remainingAttempts: MAX_RESENDS_PER_HOUR,
        lastSentTimestamp: 0,
        error: 'No rate limit record found.',
      };
    }

    const data = docSnap.data() as EmailRateLimitDoc;

    // Strict validation: reservationId must match the active pending reservation
    if (
      !reservationId || 
      !data.pendingReservation || 
      data.pendingReservation.reservationId !== reservationId
    ) {
      const currentTimestamps = (data.timestamps || []).filter(
        (ts) => commitTimeMs - ts < ONE_HOUR_MS && ts <= commitTimeMs
      );
      return {
        success: false,
        remainingAttempts: Math.max(0, MAX_RESENDS_PER_HOUR - currentTimestamps.length),
        lastSentTimestamp: data.lastSentTimestamp || 0,
        error: 'Invalid, mismatched, or absent reservation ID.',
      };
    }

    // Validate that reservation has not expired before commit
    if (commitTimeMs > data.pendingReservation.expiresAt) {
      const currentTimestamps = (data.timestamps || []).filter(
        (ts) => commitTimeMs - ts < ONE_HOUR_MS && ts <= commitTimeMs
      );
      return {
        success: false,
        remainingAttempts: Math.max(0, MAX_RESENDS_PER_HOUR - currentTimestamps.length),
        lastSentTimestamp: data.lastSentTimestamp || 0,
        error: 'Reservation has expired.',
      };
    }

    const timestamps = Array.isArray(data.timestamps) ? data.timestamps : [];
    const validTimestamps = timestamps.filter(
      (ts) => commitTimeMs - ts < ONE_HOUR_MS && ts <= commitTimeMs
    );
    validTimestamps.push(commitTimeMs);

    transaction.set(docRef, {
      uid,
      timestamps: validTimestamps,
      lastSentTimestamp: commitTimeMs,
      pendingReservation: null, // Clear active reservation
      updatedAt: commitTimeMs,
    });

    const remainingAttempts = Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length);
    return {
      success: true,
      remainingAttempts,
      lastSentTimestamp: commitTimeMs,
    };
  });
}

/**
 * Phase 3: Releases a reserved slot following a failed dispatch attempt.
 * 
 * Strictly verifies that the reservationId matches the active pending reservation.
 * 
 * Concurrency & Quota Safety:
 * - If failure is DEFINITIVE (e.g. SMTP connection refused, bad auth, invalid address):
 *   Slot reservation is cleared immediately, NO timestamp is recorded, NO cooldown is applied.
 *   The user's hourly quota is 100% preserved.
 * 
 * - If failure is an AMBIGUOUS TIMEOUT (options.isTimeout = true):
 *   The SMTP server might have accepted the message before the response dropped.
 *   Enforces a 60-second cooldown (lastSentTimestamp = currentTimeMs) to prevent spamming,
 *   BUT DOES NOT append to timestamps, preserving the user's 5-send hourly quota!
 */
export async function releaseResendSlot(
  uid: string,
  reservationId: string,
  options: ReleaseOptions = {},
  currentTimeMs: number = Date.now(),
  customDb?: Firestore
): Promise<void> {
  const db = customDb || getAdminFirestore();

  if (!db) {
    if (options.isTimeout) {
      recordThrottleCooldown(uid, RESEND_COOLDOWN_SECONDS, undefined, currentTimeMs);
    }
    return;
  }

  const docRef = db.collection(RATE_LIMIT_COLLECTION).doc(uid);

  await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists) return;

    const data = docSnap.data() as EmailRateLimitDoc;

    // Strict validation: reservationId must match the currently pending reservation
    if (
      !reservationId || 
      !data.pendingReservation || 
      data.pendingReservation.reservationId !== reservationId
    ) {
      return; // Reject release if reservation ID is mismatched or absent
    }

    const validTimestamps = (data.timestamps || []).filter(
      (ts) => currentTimeMs - ts < ONE_HOUR_MS && ts <= currentTimeMs
    );

    // On timeout: enforce cooldown to prevent spam, but do NOT consume hourly quota
    // On definitive failure: keep previous lastSentTimestamp (no cooldown)
    const newLastSent = options.isTimeout ? currentTimeMs : (data.lastSentTimestamp || 0);

    // Opportunistic cleanup: if document has no active timestamps and cooldown has elapsed
    const isStale = validTimestamps.length === 0 && (currentTimeMs - newLastSent > ONE_HOUR_MS);

    if (isStale) {
      transaction.delete(docRef);
    } else {
      transaction.set(docRef, {
        uid,
        timestamps: validTimestamps,
        lastSentTimestamp: newLastSent,
        pendingReservation: null,
        updatedAt: currentTimeMs,
      });
    }
  });
}

/**
 * Checks the current rate limit status without creating a reservation.
 */
export async function getRateLimitStatus(
  uid: string,
  currentTimeMs: number = Date.now(),
  customDb?: Firestore
): Promise<ReservationResult> {
  const db = customDb || getAdminFirestore();
  if (!db) {
    const memStatus = checkResendRateLimit(uid, currentTimeMs);
    return {
      allowed: memStatus.allowed,
      reason: memStatus.reason as RateLimitReason,
      remainingAttempts: memStatus.remainingAttempts,
      cooldownSeconds: memStatus.cooldownSeconds,
      retryAfterSeconds: memStatus.retryAfterSeconds,
    };
  }

  const docRef = db.collection(RATE_LIMIT_COLLECTION).doc(uid);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return {
      allowed: true,
      remainingAttempts: MAX_RESENDS_PER_HOUR,
      cooldownSeconds: 0,
      retryAfterSeconds: 0,
    };
  }

  const data = docSnap.data() as EmailRateLimitDoc;
  const timestamps = Array.isArray(data.timestamps) ? data.timestamps : [];
  const validTimestamps = timestamps.filter(
    (ts) => currentTimeMs - ts < ONE_HOUR_MS && ts <= currentTimeMs
  );

  // Check in-flight reservation
  if (data.pendingReservation && data.pendingReservation.expiresAt > currentTimeMs) {
    const inFlightRemaining = Math.max(1, Math.ceil((data.pendingReservation.expiresAt - currentTimeMs) / 1000));
    return {
      allowed: false,
      reason: 'in_flight',
      remainingAttempts: Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length),
      cooldownSeconds: inFlightRemaining,
      retryAfterSeconds: inFlightRemaining,
    };
  }

  // Check cooldown
  if (data.lastSentTimestamp > 0) {
    const elapsed = Math.floor((currentTimeMs - data.lastSentTimestamp) / 1000);
    if (elapsed < RESEND_COOLDOWN_SECONDS && elapsed >= 0) {
      const cooldownRemaining = RESEND_COOLDOWN_SECONDS - elapsed;
      return {
        allowed: false,
        reason: 'cooldown',
        remainingAttempts: Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length),
        cooldownSeconds: cooldownRemaining,
        retryAfterSeconds: cooldownRemaining,
      };
    }
  }

  // Check hourly limit
  if (validTimestamps.length >= MAX_RESENDS_PER_HOUR) {
    const oldest = Math.min(...validTimestamps);
    const retryAfter = Math.max(1, Math.ceil((oldest + ONE_HOUR_MS - currentTimeMs) / 1000));
    return {
      allowed: false,
      reason: 'hourly_limit',
      remainingAttempts: 0,
      cooldownSeconds: 0,
      retryAfterSeconds: retryAfter,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_RESENDS_PER_HOUR - validTimestamps.length),
    cooldownSeconds: 0,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the Firestore rate limit record for a user (used for tests or administrative resets).
 */
export async function resetFirestoreRateLimit(
  uid: string,
  customDb?: Firestore
): Promise<void> {
  const db = customDb || getAdminFirestore();
  if (db) {
    try {
      await db.collection(RATE_LIMIT_COLLECTION).doc(uid).delete();
    } catch {
      // Ignore if document did not exist
    }
  }
}
