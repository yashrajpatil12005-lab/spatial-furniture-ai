import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkResendRateLimit,
  recordSuccessfulResend,
  recordThrottleCooldown,
  resetResendRateLimit,
  MAX_RESENDS_PER_HOUR,
  RESEND_COOLDOWN_SECONDS,
  ONE_HOUR_MS,
} from '@/lib/utils/resendRateLimiter';

describe('Per-User Resend Rate Limiter Unit Tests', () => {
  const userA = 'user-test-uid-123';
  const userB = 'user-test-uid-456';
  const baseTime = 1700000000000; // Fixed timestamp reference

  beforeEach(() => {
    resetResendRateLimit(userA);
    resetResendRateLimit(userB);
  });

  it('allows initial resend with full quota of 5 remaining attempts', () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
    const status = checkResendRateLimit(userA, baseTime);
    expect(status.allowed).toBe(true);
    expect(status.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR);
    expect(status.cooldownSeconds).toBe(0);
    expect(status.retryAfterSeconds).toBe(0);
  });

  it('blocks a second request inside the 60-second cooldown window', () => {
    // 1. First resend succeeds at baseTime
    recordSuccessfulResend(userA, baseTime);

    // 2. Check 10 seconds later: inside 60-second cooldown
    const insideCooldown = checkResendRateLimit(userA, baseTime + 10000);
    expect(insideCooldown.allowed).toBe(false);
    expect(insideCooldown.reason).toBe('cooldown');
    expect(insideCooldown.cooldownSeconds).toBe(50);
    expect(insideCooldown.remainingAttempts).toBe(4);
  });

  it('allows a request after the 60-second cooldown has elapsed', () => {
    // 1. First resend at baseTime
    recordSuccessfulResend(userA, baseTime);

    // 2. Check after 61 seconds: cooldown expired
    const afterCooldown = checkResendRateLimit(userA, baseTime + 61000);
    expect(afterCooldown.allowed).toBe(true);
    expect(afterCooldown.remainingAttempts).toBe(4);
    expect(afterCooldown.cooldownSeconds).toBe(0);
  });

  it('permits up to 5 requests per hour subject to the 60s cooldown', () => {
    let currentTime = baseTime;

    // Execute 5 requests, each 65 seconds apart
    for (let i = 1; i <= 5; i++) {
      const status = checkResendRateLimit(userA, currentTime);
      expect(status.allowed).toBe(true);
      expect(status.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR - (i - 1));

      recordSuccessfulResend(userA, currentTime);
      currentTime += 65000; // Advance past 60s cooldown
    }

    // After 5 requests, remaining attempts should be 0
    const finalCheck = checkResendRateLimit(userA, currentTime);
    expect(finalCheck.allowed).toBe(false);
    expect(finalCheck.reason).toBe('hourly_limit');
    expect(finalCheck.remainingAttempts).toBe(0);
  });

  it('blocks a sixth request within the hour by application limiter', () => {
    let currentTime = baseTime;

    // Fill all 5 slots
    for (let i = 0; i < 5; i++) {
      recordSuccessfulResend(userA, currentTime);
      currentTime += 70000;
    }

    // Current time is now 350 seconds (< 1 hour) from baseTime
    const sixthAttempt = checkResendRateLimit(userA, currentTime);
    expect(sixthAttempt.allowed).toBe(false);
    expect(sixthAttempt.reason).toBe('hourly_limit');
    expect(sixthAttempt.remainingAttempts).toBe(0);
    expect(sixthAttempt.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('allows a new request after one hour has passed from the oldest attempt', () => {
    let currentTime = baseTime;

    // Fill all 5 slots
    for (let i = 0; i < 5; i++) {
      recordSuccessfulResend(userA, currentTime);
      currentTime += 65000;
    }

    // Fast-forward to 1 hour + 1 second after the FIRST request
    const afterOneHour = baseTime + ONE_HOUR_MS + 1000;
    const status = checkResendRateLimit(userA, afterOneHour);

    // The first attempt has fallen out of the sliding window, freeing 1 slot
    expect(status.allowed).toBe(true);
    expect(status.remainingAttempts).toBe(1);
  });

  it('tracks rate limits per authenticated user independently, not globally', () => {
    // User A uses 5 requests
    let currentTime = baseTime;
    for (let i = 0; i < 5; i++) {
      recordSuccessfulResend(userA, currentTime);
      currentTime += 65000;
    }

    // User A is blocked
    expect(checkResendRateLimit(userA, currentTime).allowed).toBe(false);

    // User B is fresh and NOT affected by User A's limit
    const userBStatus = checkResendRateLimit(userB, currentTime);
    expect(userBStatus.allowed).toBe(true);
    expect(userBStatus.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR);
  });

  it('does not count failed requests towards successful sends', () => {
    // Initial check: 5 attempts remaining
    expect(checkResendRateLimit(userA, baseTime).remainingAttempts).toBe(5);

    // Simulated failed send (recordSuccessfulResend is NOT called)
    // Checking again should still reflect 5 attempts remaining
    const statusAfterFailure = checkResendRateLimit(userA, baseTime + 1000);
    expect(statusAfterFailure.allowed).toBe(true);
    expect(statusAfterFailure.remainingAttempts).toBe(5);
    expect(statusAfterFailure.cooldownSeconds).toBe(0);
  });

  it('preserves quota and activates 60s cooldown when Firebase throttles via recordThrottleCooldown', () => {
    // Initial state: 5 of 5 remaining
    expect(checkResendRateLimit(userA, baseTime).remainingAttempts).toBe(5);

    // Firebase returns auth/too-many-requests -> recordThrottleCooldown is called
    const throttleStatus = recordThrottleCooldown(userA, 60, undefined, baseTime);
    expect(throttleStatus.allowed).toBe(false);
    expect(throttleStatus.reason).toBe('cooldown');
    expect(throttleStatus.cooldownSeconds).toBe(60);
    // Quota is strictly preserved: still 5 attempts remaining
    expect(throttleStatus.remainingAttempts).toBe(5);

    // Check 30 seconds later
    const midCooldown = checkResendRateLimit(userA, baseTime + 30000);
    expect(midCooldown.allowed).toBe(false);
    expect(midCooldown.reason).toBe('cooldown');
    expect(midCooldown.cooldownSeconds).toBe(30);
    expect(midCooldown.remainingAttempts).toBe(5);

    // After 61 seconds: cooldown expired, user still has all 5 attempts
    const afterCooldown = checkResendRateLimit(userA, baseTime + 61000);
    expect(afterCooldown.allowed).toBe(true);
    expect(afterCooldown.cooldownSeconds).toBe(0);
    expect(afterCooldown.remainingAttempts).toBe(5);
  });

  it('shares rate limits and cooldown across primary UID and alternate email identifier', () => {
    const userEmail = 'test.customer@spatial.ai';
    resetResendRateLimit(userA, userEmail);

    // Record send with primary UID and alternate email
    recordSuccessfulResend(userA, baseTime, userEmail);

    // Look up by empty UID but with alternate email: should find the record
    const statusByEmail = checkResendRateLimit('', baseTime + 10000, userEmail);
    expect(statusByEmail.allowed).toBe(false);
    expect(statusByEmail.reason).toBe('cooldown');
    expect(statusByEmail.cooldownSeconds).toBe(50);
    expect(statusByEmail.remainingAttempts).toBe(4);

    resetResendRateLimit(userA, userEmail);
  });
});
