import { describe, it, expect } from 'vitest';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  deleteUser 
} from 'firebase/auth';
import { NextRequest } from 'next/server';
import { requireAuth, verifyAuthToken } from '@/lib/firebase/serverAuth';
import { validatePassword } from '@/lib/utils/validation';

const firebaseConfig = {
  apiKey: "AIzaSyCeZ7SObn8PZK7Ckc_VU6yRwaG6qlPVbOw",
  authDomain: "spatial-furniture-ai.firebaseapp.com",
  projectId: "spatial-furniture-ai",
};

describe('Live Firebase Email Verification & Token Security Integration', () => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = firebaseConfig.apiKey;
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = firebaseConfig.projectId;

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  it('strictly validates password boundary lengths 7, 8, 12, and 13 characters', () => {
    // 7 characters: must fail
    const res7 = validatePassword('Pass1!a');
    expect(res7.isValid).toBe(false);
    expect(res7.error).toBe('Password must be between 8 and 12 characters.');

    // 8 characters: boundary minimum, must pass
    const res8 = validatePassword('Pass1!ab');
    expect(res8.isValid).toBe(true);
    expect(res8.error).toBeUndefined();

    // 12 characters: boundary maximum, must pass
    const res12 = validatePassword('Pass123!Safe');
    expect(res12.isValid).toBe(true);
    expect(res12.error).toBeUndefined();

    // 13 characters: must fail
    const res13 = validatePassword('Pass123!Long1');
    expect(res13.isValid).toBe(false);
    expect(res13.error).toBe('Password must be between 8 and 12 characters.');
  });

  it('successfully creates a real user in Firebase Auth with compliant 8-12 char password, dispatches verification email, and verifies server protection', async () => {
    const timestamp = Date.now();
    const testEmail = `spatial.viva.test.${timestamp}@gmail.com`;
    // Compliant 11-character password meeting all 4 complexity rules
    const testPassword = `LivePass12!`;
    expect(testPassword.length).toBeGreaterThanOrEqual(8);
    expect(testPassword.length).toBeLessThanOrEqual(12);

    let userCredential;
    try {
      // 1. Create a real user in Firebase Auth
      userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;

      expect(user.uid).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.emailVerified).toBe(false);

      // 2. Dispatch a real Firebase verification email
      let emailSendSuccess = false;
      try {
        await sendEmailVerification(user);
        emailSendSuccess = true;
      } catch (err) {
        console.error('Live verification email send error:', err);
      }
      expect(emailSendSuccess).toBe(true);

      // 3. Obtain real live Firebase ID token
      const idToken = await user.getIdToken();
      expect(typeof idToken).toBe('string');
      expect(idToken.length).toBeGreaterThan(20);

      // 4. Test server-side token verification against live Google Identity Toolkit API
      const req = new NextRequest('http://localhost:3000/api/ai/visualize', {
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });

      const verifiedUser = await verifyAuthToken(req);
      expect(verifiedUser).not.toBeNull();
      expect(verifiedUser?.uid).toBe(user.uid);
      expect(verifiedUser?.email).toBe(testEmail);
      expect(verifiedUser?.emailVerified).toBe(false);

      // 5. Test that server-side requireAuth denies access to protected routes with HTTP 403
      const authResult = await requireAuth(req);
      expect(authResult.authorized).toBe(false);
      if (!authResult.authorized) {
        expect(authResult.status).toBe(403);
        expect(authResult.code).toBe('EMAIL_NOT_VERIFIED');
        const json = await authResult.response.json();
        expect(json.code).toBe('EMAIL_NOT_VERIFIED');
        expect(json.error).toContain('Email verification required');
      }

      // 6. Test with requireVerified: false to verify identity authentication works independently
      const unverifiedAllowed = await requireAuth(req, { requireVerified: false });
      expect(unverifiedAllowed.authorized).toBe(true);

    } finally {
      // 7. Cleanup the test user from Firebase Auth so no test accounts linger
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (cleanupErr) {
          console.warn('Could not clean up test user:', cleanupErr);
        }
      }
    }
  }, 25000); // 25s timeout for live network call
});
