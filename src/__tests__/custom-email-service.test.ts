import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { 
  isMailerConfigured, 
  createMailTransporter, 
  sendCustomVerificationEmail 
} from '@/lib/email/mailer';
import { 
  isFirebaseAdminReady, 
  getFirebaseAdminApp, 
  getAdminAuth 
} from '@/lib/firebase/admin';
import { POST } from '@/app/api/auth/send-verification/route';
import { sendVerificationEmail } from '@/lib/firebase/auth';
import { 
  resetResendRateLimit, 
  recordSuccessfulResend,
  MAX_RESENDS_PER_HOUR 
} from '@/lib/utils/resendRateLimiter';
import nodemailer, { type Transporter } from 'nodemailer';
import * as adminApp from 'firebase-admin/app';
import * as adminAuth from 'firebase-admin/auth';
import * as serverAuth from '@/lib/firebase/serverAuth';
import * as firebaseAuth from 'firebase/auth';

vi.mock('nodemailer');
vi.mock('firebase-admin/app');
vi.mock('firebase-admin/auth');
vi.mock('firebase-admin/firestore');
vi.mock('@/lib/firebase/config', () => ({
  auth: { currentUser: null },
  db: {},
}));
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    sendEmailVerification: vi.fn(),
  };
});

describe('Custom Email Verification System Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Nodemailer SMTP Mailer Service', () => {
    it('detects when SMTP credentials are not configured', () => {
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;

      expect(isMailerConfigured()).toBe(false);
      expect(createMailTransporter()).toBeNull();
    });

    it('detects when SMTP credentials are fully configured', () => {
      process.env.SMTP_USER = 'sender@spatial.ai';
      process.env.SMTP_PASS = 'app-password-1234';

      expect(isMailerConfigured()).toBe(true);
    });

    it('creates transport using custom or default Gmail SMTP options', () => {
      process.env.SMTP_USER = 'spatial@gmail.com';
      process.env.SMTP_PASS = 'app-pass';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';

      const mockCreateTransport = vi.spyOn(nodemailer, 'createTransport').mockReturnValue({} as unknown as Transporter);

      createMailTransporter();

      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'spatial@gmail.com',
            pass: 'app-pass',
          },
        })
      );
    });

    it('rejects sending if recipient email or verification link is missing', async () => {
      process.env.SMTP_USER = 'spatial@gmail.com';
      process.env.SMTP_PASS = 'app-pass';

      const res1 = await sendCustomVerificationEmail({ to: '', actionLink: 'https://spatial.ai/link' });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain('Missing recipient email');

      const res2 = await sendCustomVerificationEmail({ to: 'user@spatial.ai', actionLink: '' });
      expect(res2.success).toBe(false);
      expect(res2.error).toContain('Missing recipient email or verification link');
    });

    it('sends branded HTML email with amber button and returns success', async () => {
      process.env.SMTP_USER = 'spatial@gmail.com';
      process.env.SMTP_PASS = 'app-pass';

      const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-abc-123' });
      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: sendMailMock,
      } as unknown as Transporter);

      const result = await sendCustomVerificationEmail({
        to: 'customer@example.com',
        name: 'Sarah Connor',
        actionLink: 'https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&oobCode=tok123',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-abc-123');
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: 'Verify Your Email Address | Spatial Furniture AI',
          html: expect.stringContaining('Verify Email Address'),
          text: expect.stringContaining('Verify Your Email Address | Spatial Furniture AI'),
        })
      );

      // Verify that the HTML email contains the actionLink in href and the amber brand color
      const sentHtml = sendMailMock.mock.calls[0][0].html;
      expect(sentHtml).toContain('href="https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&amp;oobCode=tok123"');
      expect(sentHtml).toContain('#F59E0B');
    });

    it('handles SMTP dispatch failures gracefully without exposing credentials', async () => {
      process.env.SMTP_USER = 'spatial@gmail.com';
      process.env.SMTP_PASS = 'app-pass';

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: vi.fn().mockRejectedValue(new Error('SMTP connection timeout')),
      } as unknown as Transporter);

      const result = await sendCustomVerificationEmail({
        to: 'customer@example.com',
        actionLink: 'https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&oobCode=tok123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP connection timeout');
    });
  });

  describe('Firebase Admin SDK Initializer', () => {
    it('detects when Firebase Admin credentials are not set', () => {
      delete process.env.FIREBASE_PROJECT_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      delete process.env.FIREBASE_CLIENT_EMAIL;
      delete process.env.FIREBASE_PRIVATE_KEY;

      vi.spyOn(adminApp, 'getApps').mockReturnValue([]);

      expect(isFirebaseAdminReady()).toBe(false);
      expect(getFirebaseAdminApp()).toBeNull();
      expect(getAdminAuth()).toBeNull();
    });

    it('detects when Firebase Admin credentials are set and formats escaped newlines', () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvgI\\n-----END PRIVATE KEY-----';

      expect(isFirebaseAdminReady()).toBe(true);

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([]);
      vi.spyOn(adminApp, 'initializeApp').mockReturnValue(mockApp);
      vi.spyOn(adminApp, 'cert').mockImplementation((config) => config as unknown as adminApp.Credential);

      const app = getFirebaseAdminApp();
      expect(app).not.toBeNull();
      expect(adminApp.cert).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'test-proj',
          clientEmail: 'admin@test-proj.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgI\n-----END PRIVATE KEY-----',
        })
      );
    });
  });

  describe('POST /api/auth/send-verification Endpoint Security', () => {
    function createPostRequest(body: object, headers: Record<string, string> = {}): NextRequest {
      return new NextRequest('http://localhost:3000/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
    }

    it('returns 401 Unauthorized when no authorization Bearer header is provided', async () => {
      const req = createPostRequest({ email: 'attacker@evil.com' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Unauthorized');
    });

    it('returns 401 Unauthorized when token verification fails', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockRejectedValue(new Error('Invalid token signature')),
      } as unknown as adminAuth.Auth);
      vi.spyOn(serverAuth, 'verifyAuthToken').mockResolvedValue(null);

      const req = createPostRequest({}, { Authorization: 'Bearer forged-token' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Unauthorized');
    });

    it('returns 400 when verified user has no associated email address', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'user-no-email',
          email: undefined,
          email_verified: false,
        }),
      } as unknown as adminAuth.Auth);

      const req = createPostRequest({}, { Authorization: 'Bearer token-no-email' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('no associated email');
    });

    it('returns alreadyVerified: true when user is already verified in Firebase', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'user-verified',
          email: 'verified@spatialstudio.com',
          email_verified: true,
        }),
      } as unknown as adminAuth.Auth);

      const req = createPostRequest({}, { Authorization: 'Bearer token-verified' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.alreadyVerified).toBe(true);
    });

    it('returns fallbackToClient: true when server SMTP dependencies are unconfigured', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'user-unconfigured-smtp',
          email: 'newuser@spatial.ai',
          email_verified: false,
        }),
      } as unknown as adminAuth.Auth);

      const req = createPostRequest({}, { Authorization: 'Bearer token-valid' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(false);
      expect(json.fallbackToClient).toBe(true);
      expect(json.error).toContain('not configured on the server');
    });

    it('extracts recipient strictly from verified token and ignores body email parameter (prevents unauthorized sending)', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';
      process.env.SMTP_USER = 'sender@spatial.ai';
      process.env.SMTP_PASS = 'pass123';

      const mockGenerateLink = vi.fn().mockResolvedValue(
        'https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&oobCode=tok789'
      );
      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'legit-uid-100',
          email: 'legit-owner@spatial.ai',
          email_verified: false,
        }),
        generateEmailVerificationLink: mockGenerateLink,
      } as unknown as adminAuth.Auth);

      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'msg-sec-1' });
      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: mockSendMail,
      } as unknown as Transporter);

      // Malicious attempt: body claims email is victim@victim.com
      const req = createPostRequest(
        { email: 'victim@victim.com', name: 'Spoofed' },
        { Authorization: 'Bearer token-legit-user' }
      );

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Email MUST be sent ONLY to legit-owner@spatial.ai, NEVER to victim@victim.com
      expect(mockGenerateLink).toHaveBeenCalledWith(
        'legit-owner@spatial.ai',
        expect.anything()
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'legit-owner@spatial.ai',
        })
      );
    });

    it('generates verification link via Admin SDK, dispatches email, and NEVER exposes the actionLink in response', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';
      process.env.SMTP_USER = 'sender@spatial.ai';
      process.env.SMTP_PASS = 'pass123';

      const mockGenerateLink = vi.fn().mockResolvedValue(
        'https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&oobCode=secret_oob_token_999'
      );

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'user-julia-1',
          email: 'client@spatialstudio.com',
          email_verified: false,
        }),
        generateEmailVerificationLink: mockGenerateLink,
      } as unknown as adminAuth.Auth);

      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'msg-success-777' });
      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: mockSendMail,
      } as unknown as Transporter);

      const req = createPostRequest(
        { name: 'Julia Roberts' },
        { Authorization: 'Bearer valid-auth-token' }
      );

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain('Verification email dispatched successfully');

      // CRITICAL SECURITY ASSERTIONS:
      // Response must NEVER expose the generated link or verification token
      expect(json.actionLink).toBeUndefined();
      expect(json.oobCode).toBeUndefined();
      expect(JSON.stringify(json)).not.toContain('secret_oob_token_999');

      // Firebase Admin generateEmailVerificationLink was called with correct ActionCodeSettings
      expect(mockGenerateLink).toHaveBeenCalledWith(
        'client@spatialstudio.com',
        expect.objectContaining({
          handleCodeInApp: true,
          url: expect.stringContaining('/auth/action'),
        })
      );

      // Nodemailer sent the email with the link embedded in the HTML anchor
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@spatialstudio.com',
          html: expect.stringContaining('secret_oob_token_999'),
        })
      );
    });

    it('enforces server-side rate limits and updates rate limit record on successful send', async () => {
      const testUid = 'user-server-rate-test';
      const testEmail = 'server-rate@spatial.ai';
      resetResendRateLimit(testUid, testEmail);

      process.env.FIREBASE_PROJECT_ID = 'test-proj';
      process.env.FIREBASE_CLIENT_EMAIL = 'admin@test-proj.iam.gserviceaccount.com';
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';
      process.env.SMTP_USER = 'sender@spatial.ai';
      process.env.SMTP_PASS = 'pass123';

      const mockApp = { name: '[DEFAULT]' } as adminApp.App;
      vi.spyOn(adminApp, 'getApps').mockReturnValue([mockApp]);
      vi.spyOn(adminAuth, 'getAuth').mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: testUid,
          email: testEmail,
          email_verified: false,
        }),
        generateEmailVerificationLink: vi.fn().mockResolvedValue('https://spatial.ai/auth/action?oobCode=123'),
      } as unknown as adminAuth.Auth);

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: 'msg-rate-1' }),
      } as unknown as Transporter);

      // 1. First dispatch succeeds and updates rate status
      const req1 = createPostRequest({}, { Authorization: 'Bearer token-rate' });
      const res1 = await POST(req1);
      const json1 = await res1.json();

      expect(res1.status).toBe(200);
      expect(json1.success).toBe(true);
      expect(json1.rateStatus).toBeDefined();
      expect(json1.rateStatus.remainingAttempts).toBe(MAX_RESENDS_PER_HOUR - 1);

      // 2. Immediate second dispatch is blocked on server by 60s cooldown (429)
      const req2 = createPostRequest({}, { Authorization: 'Bearer token-rate' });
      const res2 = await POST(req2);
      const json2 = await res2.json();

      expect(res2.status).toBe(429);
      expect(json2.success).toBe(false);
      expect(json2.rateStatus.allowed).toBe(false);
      expect(json2.rateStatus.reason).toBe('cooldown');

      // Cleanup
      resetResendRateLimit(testUid, testEmail);
    });
  });

  describe('Native Sender Fallback Rate Limit Protection', () => {
    it('blocks fallback to native email sender when rate limit is exceeded on client', async () => {
      const testUid = 'user-fallback-test';
      const testEmail = 'fallback@spatial.ai';
      resetResendRateLimit(testUid, testEmail);

      // Exhaust user's hourly quota
      for (let i = 0; i < MAX_RESENDS_PER_HOUR; i++) {
        recordSuccessfulResend(testUid, Date.now() - (MAX_RESENDS_PER_HOUR - i) * 1000, testEmail);
      }

      const mockUser = {
        uid: testUid,
        email: testEmail,
        emailVerified: false,
        getIdToken: vi.fn().mockResolvedValue('sample-token'),
      } as unknown as firebaseAuth.User;

      const nativeSenderSpy = vi.spyOn(firebaseAuth, 'sendEmailVerification');

      await expect(sendVerificationEmail(mockUser)).rejects.toMatchObject({
        code: 'auth/too-many-requests',
      });

      // Crucial: native sendEmailVerification must NOT have been called!
      expect(nativeSenderSpy).not.toHaveBeenCalled();

      // Cleanup
      resetResendRateLimit(testUid, testEmail);
    });

    it('blocks fallback to native email sender when /api/auth/send-verification responds with 429', async () => {
      const testUid = 'user-server-429-fallback-test';
      const testEmail = 'server429@spatial.ai';
      resetResendRateLimit(testUid, testEmail);

      const mockUser = {
        uid: testUid,
        email: testEmail,
        emailVerified: false,
        getIdToken: vi.fn().mockResolvedValue('sample-token'),
      } as unknown as firebaseAuth.User;

      // Mock fetch to simulate 429 Too Many Requests from the server API
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: 'Please wait 45 seconds before requesting another email.',
          rateStatus: { allowed: false, reason: 'cooldown', cooldownSeconds: 45 },
        }),
      } as unknown as Response);

      const nativeSenderSpy = vi.spyOn(firebaseAuth, 'sendEmailVerification');

      try {
        await expect(sendVerificationEmail(mockUser)).rejects.toMatchObject({
          code: 'auth/too-many-requests',
        });

        // Crucial: Fallback to native sendEmailVerification must NOT have been executed!
        expect(nativeSenderSpy).not.toHaveBeenCalled();
      } finally {
        global.fetch = originalFetch;
        resetResendRateLimit(testUid, testEmail);
      }
    });
  });
});
