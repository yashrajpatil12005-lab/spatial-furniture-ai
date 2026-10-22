import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthActionPage from '@/app/auth/action/page';
import VerifyEmailPage from '@/app/verify-email/page';
import LoginPage from '@/app/login/page';
import { 
  getAppBaseUrl, 
  getActionCodeSettings, 
  sendVerificationEmail,
  applyVerificationCode,
  getFriendlyAuthErrorMessage 
} from '@/lib/firebase/auth';
import * as firebaseAuth from 'firebase/auth';

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockSearchParams = new Map<string, string>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
    toString: () => Array.from(mockSearchParams.entries()).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
  }),
  usePathname: () => '/auth/action',
}));

// Mock AuthContext
let mockCurrentUser: {
  uid: string;
  email: string;
  emailVerified: boolean;
  reload: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
} | null = null;

const mockReloadUser = vi.fn();

vi.mock('@/lib/firebase/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    userData: mockCurrentUser ? { role: 'customer', name: 'Test Customer' } : null,
    loading: false,
    reloadUser: mockReloadUser,
  }),
}));

// Mock firebase/firestore
let mockRoleData = 'customer';
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockImplementation(async () => ({
    exists: () => true,
    data: () => ({ role: mockRoleData }),
  })),
  setDoc: vi.fn().mockResolvedValue(undefined),
}));

// Mock firebase/auth
vi.mock('@/lib/firebase/config', () => ({
  auth: {
    get currentUser() {
      return mockCurrentUser;
    },
  },
  db: {},
}));

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    applyActionCode: vi.fn(),
    sendEmailVerification: vi.fn(),
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback(mockCurrentUser);
      return () => {};
    }),
  };
});

describe('Firebase Email Verification Return Flow & Action Handler Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    mockCurrentUser = null;
    mockRoleData = 'customer';
    mockReloadUser.mockResolvedValue(null);
  });

  afterEach(() => {
    // Clean up DOM between test runs
  });

  describe('ActionCodeSettings & Environment URL Resolution', () => {
    it('resolves localhost origin during local development', () => {
      // In jsdom environment, window.location.origin is typically http://localhost:3000
      const baseUrl = getAppBaseUrl();
      expect(baseUrl).toContain('localhost');
    });

    it('generates compliant ActionCodeSettings targeting /auth/action with handleCodeInApp: true', () => {
      const settings = getActionCodeSettings();
      expect(settings.handleCodeInApp).toBe(true);
      expect(settings.url).toContain('/auth/action');
    });

    it('supports custom continue paths in ActionCodeSettings', () => {
      const settings = getActionCodeSettings('/customer');
      expect(settings.url).toContain('/customer');
      expect(settings.handleCodeInApp).toBe(true);
    });

    it('calls sendEmailVerification with configured ActionCodeSettings', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@spatial.com',
        emailVerified: false,
      } as unknown as firebaseAuth.User;

      const spy = vi.spyOn(firebaseAuth, 'sendEmailVerification').mockResolvedValueOnce(undefined);

      await sendVerificationEmail(mockUser);

      expect(spy).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          handleCodeInApp: true,
          url: expect.stringContaining('/auth/action'),
        })
      );
    });

    it('falls back to sending without ActionCodeSettings if domain is unauthorized in Firebase Console', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@spatial.com',
      } as unknown as firebaseAuth.User;

      const spy = vi.spyOn(firebaseAuth, 'sendEmailVerification')
        .mockRejectedValueOnce({ code: 'auth/unauthorized-continue-uri' })
        .mockResolvedValueOnce(undefined);

      await sendVerificationEmail(mockUser);

      // Should have been called twice: first with settings, then fallback without settings
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(mockUser);
    });

    it('maps action code error codes to friendly messages', () => {
      expect(getFriendlyAuthErrorMessage({ code: 'auth/expired-action-code' }))
        .toBe('This verification link has expired. Please request a new verification email.');
      expect(getFriendlyAuthErrorMessage({ code: 'auth/invalid-action-code' }))
        .toBe('This verification link is invalid or has already been used. Please check if your email is already verified, or request a new verification link.');
      expect(getFriendlyAuthErrorMessage({ code: 'auth/unauthorized-continue-uri' }))
        .toBe('The verification continue URL domain is not authorized in Firebase Console settings.');
    });

    it('applyVerificationCode calls firebase applyActionCode', async () => {
      const applySpy = vi.spyOn(firebaseAuth, 'applyActionCode').mockResolvedValueOnce(undefined);
      await applyVerificationCode('test-code-123');
      expect(applySpy).toHaveBeenCalledWith(expect.anything(), 'test-code-123');
    });
  });

  describe('Custom Verification Action Handler Page (/auth/action)', () => {
    it('successfully verifies email for unauthenticated user and renders dark theme success page with Continue to Sign In', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'valid-code-xyz');

      const applySpy = vi.spyOn(firebaseAuth, 'applyActionCode').mockResolvedValueOnce(undefined);

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(applySpy).toHaveBeenCalledWith(expect.anything(), 'valid-code-xyz');
        expect(screen.getByRole('heading', { name: /email verified successfully!/i })).toBeInTheDocument();
      });

      // Verification success badge & dark theme elements
      expect(screen.getByText('Email Verified')).toBeInTheDocument();
      expect(screen.getByText(/Your Spatial Furniture AI account is now fully active/i)).toBeInTheDocument();

      // "Continue to Sign In" button linking to /login?verified=true (Requirement 5)
      const signinBtn = screen.getByRole('link', { name: /continue to sign in/i });
      expect(signinBtn).toBeInTheDocument();
      expect(signinBtn).toHaveAttribute('href', '/login?verified=true');
    });

    it('successfully refreshes user and token when user returns already signed in, and allows dashboard access', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'valid-code-auth-user');

      const mockReload = vi.fn().mockImplementation(async () => {
        if (mockCurrentUser) mockCurrentUser.emailVerified = true;
      });
      const mockGetIdToken = vi.fn().mockResolvedValue('new-verified-token');

      mockCurrentUser = {
        uid: 'user-already-signed-in',
        email: 'signedin@spatial.com',
        emailVerified: false,
        reload: mockReload,
        getIdToken: mockGetIdToken,
      };
      mockRoleData = 'retailer';

      vi.spyOn(firebaseAuth, 'applyActionCode').mockResolvedValueOnce(undefined);

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /email verified successfully!/i })).toBeInTheDocument();
        expect(screen.getByText('signedin@spatial.com')).toBeInTheDocument();
        expect(screen.getByText(/token refreshed/i)).toBeInTheDocument();
      });

      // Reload and getIdToken(true) were called (Requirement 6)
      expect(mockReload).toHaveBeenCalled();
      expect(mockGetIdToken).toHaveBeenCalledWith(true);

      // Shows button to the appropriate Retailer Dashboard
      expect(screen.getByRole('button', { name: /continue to retailer dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /continue to sign in \/ switch account/i })).toBeInTheDocument();
    });

    it('handles expired verification link with clear error state and resend option', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'expired-code');

      vi.spyOn(firebaseAuth, 'applyActionCode').mockRejectedValueOnce({
        code: 'auth/expired-action-code',
      });

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verification link expired/i })).toBeInTheDocument();
        expect(screen.getByText('Link Expired')).toBeInTheDocument();
      });

      const resendLink = screen.getByRole('link', { name: /request new verification email/i });
      expect(resendLink).toHaveAttribute('href', '/verify-email');

      const signinLink = screen.getByRole('link', { name: /back to sign in/i });
      expect(signinLink).toHaveAttribute('href', '/login');
    });

    it('handles invalid or already-used link with clear explanation and sign in action', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'already-used-code');

      vi.spyOn(firebaseAuth, 'applyActionCode').mockRejectedValueOnce({
        code: 'auth/invalid-action-code',
      });

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /invalid or already used link/i })).toBeInTheDocument();
      });

      const signinBtn = screen.getByRole('link', { name: /continue to sign in/i });
      expect(signinBtn).toHaveAttribute('href', '/login');
    });

    it('gracefully treats invalid-action-code as success if the current user is already verified', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'already-used-code');

      mockCurrentUser = {
        uid: 'user-already-verified',
        email: 'already@spatial.com',
        emailVerified: true,
        reload: vi.fn().mockResolvedValue(undefined),
        getIdToken: vi.fn().mockResolvedValue('token'),
      };

      vi.spyOn(firebaseAuth, 'applyActionCode').mockRejectedValueOnce({
        code: 'auth/invalid-action-code',
      });

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /email verified successfully!/i })).toBeInTheDocument();
      });
    });

    it('handles disabled account status with support link', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'disabled-user-code');

      vi.spyOn(firebaseAuth, 'applyActionCode').mockRejectedValueOnce({
        code: 'auth/user-disabled',
      });

      render(<AuthActionPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /account has been disabled/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /contact support/i })).toHaveAttribute('href', '/contact');
      });
    });

    it('displays missing action code message when visited without parameters', () => {
      render(<AuthActionPage />);

      expect(screen.getByRole('heading', { name: /no action code found/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go to email verification page/i })).toHaveAttribute('href', '/verify-email');
    });

    it('displays password reset guidance when mode is resetPassword', () => {
      mockSearchParams.set('mode', 'resetPassword');
      mockSearchParams.set('oobCode', 'reset-code');

      render(<AuthActionPage />);

      expect(screen.getByRole('heading', { name: /password reset request/i })).toBeInTheDocument();
    });
  });

  describe('Verify Email Page Routing & Login Page Verified Banner Integration', () => {
    it('forwards action code parameters from /verify-email to /auth/action', async () => {
      mockSearchParams.set('mode', 'verifyEmail');
      mockSearchParams.set('oobCode', 'incoming-oob-code');

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith(
          expect.stringContaining('/auth/action?mode=verifyEmail&oobCode=incoming-oob-code')
        );
      });
    });

    it('renders verified success banner on /login when arriving from verification success link', () => {
      mockSearchParams.set('verified', 'true');

      render(<LoginPage />);

      expect(screen.getByText(/email verified successfully! you can now sign in/i)).toBeInTheDocument();
    });
  });
});
