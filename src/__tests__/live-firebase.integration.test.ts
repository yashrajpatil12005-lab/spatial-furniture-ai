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

  it('successfully creates a real user in Firebase Auth, dispatches a real verification email, and verifies token protection', async () => {
    const timestamp = Date.now();
    const testEmail = `spatial.viva.test.${timestamp}@gmail.com`;
    const testPassword = `LiveSecurePass@${timestamp}!`;

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
