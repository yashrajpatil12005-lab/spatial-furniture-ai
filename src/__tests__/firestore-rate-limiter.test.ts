import { describe, it, expect, beforeEach } from 'vitest';
import { 
  reserveResendSlot, 
  commitResendSlot, 
  releaseResendSlot, 
  getRateLimitStatus,
  MAX_RESENDS_PER_HOUR,
  ONE_HOUR_MS,
  RESERVATION_TTL_MS,
  type EmailRateLimitDoc
} from '@/lib/firebase/firestoreRateLimiter';
import type { Firestore } from 'firebase-admin/firestore';

interface MockDocRef {
  path: string;
}

interface MockTransaction {
  get: (docRef: MockDocRef) => Promise<{ exists: boolean; data: () => EmailRateLimitDoc | undefined }>;
  set: (docRef: MockDocRef, data: EmailRateLimitDoc) => void;
  delete: (docRef: MockDocRef) => void;
}

/**
 * High-fidelity in-memory Mock Firestore implementation
 * accurately simulates Firestore transactions, document snapshots, and multi-instance concurrency.
 */
class InMemoryFirestoreMock {
  public store = new Map<string, EmailRateLimitDoc>();

  collection = (collectionName: string) => ({
    doc: (docId: string) => {
      const path = `${collectionName}/${docId}`;
      return {
        path,
        get: async () => {
          const data = this.store.get(path);
          return {
            exists: Boolean(data),
            data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
          };
        },
        delete: async () => {
          this.store.delete(path);
        },
      };
    },
  });

  runTransaction = async <T>(updateFunction: (transaction: MockTransaction) => Promise<T>): Promise<T> => {
    const stagedWrites = new Map<string, EmailRateLimitDoc | null>();

    const transaction: MockTransaction = {
      get: async (docRef: MockDocRef) => {
        const data = this.store.get(docRef.path);
        return {
          exists: Boolean(data),
          data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
        };
      },
      set: (docRef: MockDocRef, data: EmailRateLimitDoc) => {
        stagedWrites.set(docRef.path, JSON.parse(JSON.stringify(data)));
      },
      delete: (docRef: MockDocRef) => {
        stagedWrites.set(docRef.path, null);
      },
    };

    const result = await updateFunction(transaction);

    for (const [path, data] of stagedWrites.entries()) {
      if (data === null) {
        this.store.delete(path);
      } else {
        this.store.set(path, data);
      }
    }

    return result;
  };
}

describe('Firestore Serverless Rate Limiter Suite', () => {
  let mockDb: InMemoryFirestoreMock;
  const testUid = 'user_serverless_test_123';

  beforeEach(() => {
    mockDb = new InMemoryFirestoreMock();
  });

  describe('Cooldown Enforcement', () => {
    it('allows the initial send reservation', async () => {
      const now = 1700000000000;
      const res = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);

      expect(res.allowed).toBe(true);
      expect(res.reservationId).toBeDefined();
      expect(res.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR);
    });

    it('enforces 60-second cooldown after a committed dispatch', async () => {
      const t0 = 1700000000000;
      const res1 = await reserveResendSlot(testUid, t0, mockDb as unknown as Firestore);
      expect(res1.allowed).toBe(true);

      await commitResendSlot(testUid, res1.reservationId!, t0, mockDb as unknown as Firestore);

      // Attempt immediate second send at t0 + 10s (should be blocked by cooldown)
      const t1 = t0 + 10000;
      const res2 = await reserveResendSlot(testUid, t1, mockDb as unknown as Firestore);

      expect(res2.allowed).toBe(false);
      expect(res2.reason).toBe('cooldown');
      expect(res2.cooldownSeconds).toBe(50);
      expect(res2.retryAfterSeconds).toBe(50);
      expect(res2.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR - 1);

      // Attempt after 60s cooldown at t0 + 61s (should be allowed)
      const t2 = t0 + 61000;
      const res3 = await reserveResendSlot(testUid, t2, mockDb as unknown as Firestore);

      expect(res3.allowed).toBe(true);
      expect(res3.reservationId).toBeDefined();
    });
  });

  describe('Rolling 1-Hour Quota (Max 5 Sends)', () => {
    it('enforces maximum 5 dispatches per sliding 1-hour window', async () => {
      let currentTime = 1700000000000;

      // Perform 5 successful sends spaced out by 70s each (beyond cooldown)
      for (let i = 0; i < MAX_RESENDS_PER_HOUR; i++) {
        const res = await reserveResendSlot(testUid, currentTime, mockDb as unknown as Firestore);
        expect(res.allowed).toBe(true);
        await commitResendSlot(testUid, res.reservationId!, currentTime, mockDb as unknown as Firestore);
        currentTime += 70000;
      }

      // 6th attempt within the hour (should be blocked by hourly limit)
      const blockedRes = await reserveResendSlot(testUid, currentTime, mockDb as unknown as Firestore);
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.reason).toBe('hourly_limit');
      expect(blockedRes.remainingAttempts).toBe(0);
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);

      // Advance time beyond 1 hour from the oldest timestamp
      const oldestTimestamp = 1700000000000;
      const timeAfterOldestExpires = oldestTimestamp + ONE_HOUR_MS + 1000;

      const allowedAgain = await reserveResendSlot(testUid, timeAfterOldestExpires, mockDb as unknown as Firestore);
      expect(allowedAgain.allowed).toBe(true);
      expect(allowedAgain.reservationId).toBeDefined();
    });
  });

  describe('Concurrency & In-Flight Protection', () => {
    it('blocks concurrent requests when a reservation is currently in-flight', async () => {
      const now = 1700000000000;

      // Instance 1 reserves a slot (in-flight dispatch begins)
      const res1 = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res1.allowed).toBe(true);

      // Instance 2 (concurrent request on another Vercel container) attempts to reserve before Instance 1 commits
      const res2 = await reserveResendSlot(testUid, now + 1000, mockDb as unknown as Firestore);
      expect(res2.allowed).toBe(false);
      expect(res2.reason).toBe('in_flight');
      expect(res2.retryAfterSeconds).toBeGreaterThan(0);

      // Once Instance 1 commits, cooldown takes over
      await commitResendSlot(testUid, res1.reservationId!, now + 2000, mockDb as unknown as Firestore);

      const res3 = await reserveResendSlot(testUid, now + 3000, mockDb as unknown as Firestore);
      expect(res3.allowed).toBe(false);
      expect(res3.reason).toBe('cooldown');
    });

    it('self-heals if an in-flight reservation expires (e.g. serverless instance killed unexpectedly)', async () => {
      const now = 1700000000000;

      // Container 1 reserves slot but crashes before commit or release
      const res1 = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res1.allowed).toBe(true);

      // Fast forward past the 30-second RESERVATION_TTL_MS
      const timeAfterCrash = now + RESERVATION_TTL_MS + 1000;

      // Container 2 arrives; should detect expired reservation and grant new reservation
      const res2 = await reserveResendSlot(testUid, timeAfterCrash, mockDb as unknown as Firestore);
      expect(res2.allowed).toBe(true);
      expect(res2.reservationId).not.toBe(res1.reservationId);
    });
  });

  describe('Definitive Failures vs Ambiguous SMTP Timeouts', () => {
    it('definitively failed sends do NOT count towards quota or enforce cooldown', async () => {
      const now = 1700000000000;

      const res1 = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res1.allowed).toBe(true);

      // SMTP fails with authentication or connection error (definitive failure)
      await releaseResendSlot(testUid, res1.reservationId!, { isTimeout: false, failureReason: 'Invalid credentials' }, now, mockDb as unknown as Firestore);

      // Document should not have recorded a timestamp
      const status = await getRateLimitStatus(testUid, now + 1000, mockDb as unknown as Firestore);
      expect(status.allowed).toBe(true);
      expect(status.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR);

      // User can immediately retry (no cooldown penalty for server error)
      const res2 = await reserveResendSlot(testUid, now + 1000, mockDb as unknown as Firestore);
      expect(res2.allowed).toBe(true);
    });

    it('ambiguous SMTP timeouts enforce 60s cooldown to prevent duplicate emails while preserving hourly quota', async () => {
      const now = 1700000000000;

      const res1 = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res1.allowed).toBe(true);

      // SMTP connection times out (provider might have received email)
      await releaseResendSlot(testUid, res1.reservationId!, { isTimeout: true, failureReason: 'ETIMEDOUT' }, now, mockDb as unknown as Firestore);

      // 1. Immediate retry at now + 5s is blocked by 60s cooldown to prevent email flooding
      const immediateRetry = await reserveResendSlot(testUid, now + 5000, mockDb as unknown as Firestore);
      expect(immediateRetry.allowed).toBe(false);
      expect(immediateRetry.reason).toBe('cooldown');
      expect(immediateRetry.cooldownSeconds).toBe(55);

      // 2. But user's hourly quota is NOT consumed (remains 5 available once cooldown passes)
      const afterCooldown = await reserveResendSlot(testUid, now + 65000, mockDb as unknown as Firestore);
      expect(afterCooldown.allowed).toBe(true);
      expect(afterCooldown.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR);
    });
  });

  describe('Cross-Container Shared Persistence (Simulated Cold Starts & Multiple Instances)', () => {
    it('persists rate limits across separate simulated Vercel container instances', async () => {
      const t0 = 1700000000000;

      // Instance A executes in Vercel Lambda container 1
      const resA = await reserveResendSlot(testUid, t0, mockDb as unknown as Firestore);
      await commitResendSlot(testUid, resA.reservationId!, t0, mockDb as unknown as Firestore);

      // Simulate Instance B: a completely separate Vercel container (cold start) accessing the same Firestore database
      // Instance B has zero local memory of Instance A
      const resB = await reserveResendSlot(testUid, t0 + 15000, mockDb as unknown as Firestore);

      expect(resB.allowed).toBe(false);
      expect(resB.reason).toBe('cooldown');
      expect(resB.cooldownSeconds).toBe(45);
    });
  });

  describe('Reservation Forgery & Authorization Protection', () => {
    it('rejects commit attempt with a forged, mismatched, or absent reservationId', async () => {
      const now = 1700000000000;
      const res = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res.allowed).toBe(true);

      // Attempt commit with a forged reservationId
      const fakeCommit = await commitResendSlot(testUid, 'forged-fake-uuid', now, mockDb as unknown as Firestore);
      expect(fakeCommit.success).toBe(false);
      expect(fakeCommit.error).toContain('Invalid, mismatched, or absent');

      // Attempt commit with empty string
      const emptyCommit = await commitResendSlot(testUid, '', now, mockDb as unknown as Firestore);
      expect(emptyCommit.success).toBe(false);

      // Genuine reservation can still be committed with valid reservationId
      const legitCommit = await commitResendSlot(testUid, res.reservationId!, now, mockDb as unknown as Firestore);
      expect(legitCommit.success).toBe(true);
    });

    it('rejects commit attempt if reservation has expired beyond RESERVATION_TTL_MS', async () => {
      const now = 1700000000000;
      const res = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res.allowed).toBe(true);

      // Attempt commit 35 seconds later (past 30s TTL)
      const expiredTime = now + RESERVATION_TTL_MS + 5000;
      const expiredCommit = await commitResendSlot(testUid, res.reservationId!, expiredTime, mockDb as unknown as Firestore);

      expect(expiredCommit.success).toBe(false);
      expect(expiredCommit.error).toContain('Reservation has expired');
    });

    it('refuses to release a reservation if the reservationId does not match', async () => {
      const now = 1700000000000;
      const res = await reserveResendSlot(testUid, now, mockDb as unknown as Firestore);
      expect(res.allowed).toBe(true);

      // Malicious or rogue release attempt with wrong reservationId
      await releaseResendSlot(testUid, 'forged-uuid-attack', { isTimeout: false }, now, mockDb as unknown as Firestore);

      // Legitimate reservation must remain active (in-flight)
      const secondAttempt = await reserveResendSlot(testUid, now + 1000, mockDb as unknown as Firestore);
      expect(secondAttempt.allowed).toBe(false);
      expect(secondAttempt.reason).toBe('in_flight');
    });

    it('cannot use one user reservationId to commit or release against another user UID', async () => {
      const now = 1700000000000;
      const victimUid = 'victim_user_1';
      const attackerUid = 'attacker_user_2';

      // Victim reserves a slot
      const victimRes = await reserveResendSlot(victimUid, now, mockDb as unknown as Firestore);
      expect(victimRes.allowed).toBe(true);

      // Attacker tries to commit their own rate limit record using victim's reservation ID
      const attackerCommit = await commitResendSlot(attackerUid, victimRes.reservationId!, now, mockDb as unknown as Firestore);
      expect(attackerCommit.success).toBe(false);

      // Attacker tries to release victim's reservation using attacker's UID
      await releaseResendSlot(attackerUid, victimRes.reservationId!, { isTimeout: false }, now, mockDb as unknown as Firestore);

      // Victim's reservation is untouched and still valid
      const legitVictimCommit = await commitResendSlot(victimUid, victimRes.reservationId!, now, mockDb as unknown as Firestore);
      expect(legitVictimCommit.success).toBe(true);
    });
  });
});
