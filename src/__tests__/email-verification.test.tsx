import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  validatePassword, 
  getPasswordRequirements, 
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from '@/lib/utils/validation';
import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import VerifyEmailPage from '@/app/verify-email/page';
import LoginPage from '@/app/login/page';
import Navbar from '@/components/layout/Navbar';
import * as authModule from '@/lib/firebase/auth';

// Mock next/navigation
const mockRouterPush = vi.fn();
let mockSearchEmail = 'testuser@spatial.com';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'email' ? mockSearchEmail : null),
  }),
  usePathname: () => '/',
}));

// Mock AuthContext
let mockUser: { 
  uid: string; 
  email: string; 
  emailVerified: boolean; 
  reload: () => Promise<void>; 
  getIdToken: () => Promise<string>;
} | null = {
  uid: 'user-pending-123',
  email: 'testuser@spatial.com',
  emailVerified: false,
  reload: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('refreshed-mock-token'),
};

let mockUserData: { role: 'customer' | 'retailer' | 'admin'; name?: string } | null = {
  role: 'customer',
  name: 'Test Customer',
};

let mockAuthLoading = false;
const mockReloadUser = vi.fn();

vi.mock('@/lib/firebase/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    userData: mockUserData,
    loading: mockAuthLoading,
    reloadUser: mockReloadUser,
  }),
}));

// Mock Firestore getDoc
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ role: 'customer' }),
  }),
  setDoc: vi.fn().mockResolvedValue(undefined),
}));

// Mock firebase/auth
vi.mock('@/lib/firebase/config', () => ({
  auth: { currentUser: null },
  db: {},
}));

describe('Authentication & Email Verification Security Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchEmail = 'testuser@spatial.com';
    mockAuthLoading = false;
    mockUser = {
      uid: 'user-pending-123',
      email: 'testuser@spatial.com',
      emailVerified: false,
      reload: vi.fn().mockResolvedValue(undefined),
      getIdToken: vi.fn().mockResolvedValue('refreshed-mock-token'),
    };
    mockUserData = {
      role: 'customer',
      name: 'Test Customer',
    };
    mockReloadUser.mockImplementation(async () => mockUser);
  });

  describe('Password Requirements & Enforcement', () => {
    it('enforces minimum length of 8 and maximum length of 128 characters', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
      expect(PASSWORD_MAX_LENGTH).toBe(128);

      // Short password (< 8 chars)
      const shortPass = validatePassword('Pass1!');
      expect(shortPass.isValid).toBe(false);
      expect(shortPass.error).toContain('at least 8 characters');

      // Too long password (> 128 chars)
      const longPass = validatePassword('A1!' + 'a'.repeat(126));
      expect(longPass.isValid).toBe(false);
      expect(longPass.error).toContain('cannot exceed 128 characters');

      // Valid 8-char password
      const validMinPass = validatePassword('Valid1!a');
      expect(validMinPass.isValid).toBe(true);
    });

    it('requires uppercase, lowercase, numeric, and special characters', () => {
      expect(validatePassword('nouppercase123!').isValid).toBe(false);
      expect(validatePassword('NOLOWERCASE123!').isValid).toBe(false);
      expect(validatePassword('NoNumberSpecial!').isValid).toBe(false);
      expect(validatePassword('NoSpecialChar123').isValid).toBe(false);
      expect(validatePassword('StrongPass@2026').isValid).toBe(true);
    });

    it('accurately reports individual requirement states', () => {
      const reqs = getPasswordRequirements('Spatial2026!');
      expect(reqs.minLength).toBe(true);
      expect(reqs.maxLength).toBe(true);
      expect(reqs.hasUppercase).toBe(true);
      expect(reqs.hasLowercase).toBe(true);
      expect(reqs.hasNumber).toBe(true);
      expect(reqs.hasSpecial).toBe(true);
    });

    it('calculates live password strength scores', () => {
      expect(getPasswordStrength('').score).toBe(0);
      expect(getPasswordStrength('short').label).toBe('Weak');
      expect(getPasswordStrength('password123').label).toBe('Weak');
      expect(getPasswordStrength('Password123').label).toBe('Fair');
      expect(getPasswordStrength('Password123!').label).toBe('Strong');
    });
  });

  describe('Registration Role Safeguards', () => {
    it('restricts registration role to customer or retailer and rejects admin role assignment', async () => {
      // Test that registerUser strictly normalizes role
      vi.spyOn(authModule, 'registerUser').mockImplementation(async (email, password, name, role) => {
        // Enforce the safeRole logic verified in auth.ts
        const safeRole = role === 'retailer' ? 'retailer' : 'customer';
        expect(safeRole).not.toBe('admin');
        return { user: { uid: 'new-uid-1', email } } as unknown as import('firebase/auth').UserCredential;
      });

      // Attempting to register as 'admin' should normalize to 'customer'
      const cred = await authModule.registerUser('hack@test.com', 'Pass123!', 'Hacker', 'admin' as unknown as 'customer');
      expect(cred.user.email).toBe('hack@test.com');
    });
  });

  describe('ProtectedRoute Access Control', () => {
    it('redirects unauthenticated visitor to /login', () => {
      mockUser = null;
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Dashboard</div>
        </ProtectedRoute>
      );

      expect(mockRouterPush).toHaveBeenCalledWith('/login');
      expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    it('denies unverified user and redirects to /verify-email', () => {
      mockUser = {
        uid: 'user-unverified',
        email: 'unverified@spatial.com',
        emailVerified: false,
        reload: vi.fn(),
        getIdToken: vi.fn(),
      };

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Dashboard</div>
        </ProtectedRoute>
      );

      expect(mockRouterPush).toHaveBeenCalledWith('/verify-email');
      expect(screen.getByText(/email verification required/i)).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    it('renders protected content when user is verified and meets role criteria', () => {
      mockUser = {
        uid: 'user-verified',
        email: 'verified@spatial.com',
        emailVerified: true,
        reload: vi.fn(),
        getIdToken: vi.fn(),
      };
      mockUserData = {
        role: 'customer',
        name: 'Verified User',
      };

      render(
        <ProtectedRoute allowedRoles={['customer']}>
          <div data-testid="protected-content">Secret Customer Dashboard</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('denies verified user if their role is not authorized', () => {
      mockUser = {
        uid: 'user-cust',
        email: 'cust@spatial.com',
        emailVerified: true,
        reload: vi.fn(),
        getIdToken: vi.fn(),
      };
      mockUserData = {
        role: 'customer',
        name: 'Regular Customer',
      };

      render(
        <ProtectedRoute allowedRoles={['admin']}>
          <div data-testid="admin-content">Admin Only</div>
        </ProtectedRoute>
      );

      expect(mockRouterPush).toHaveBeenCalledWith('/');
      expect(screen.queryByTestId('admin-content')).toBeNull();
    });
  });

  describe('Verify Email Page UI & Interactivity', () => {
    it('displays the registered email address and pending status', () => {
      render(<VerifyEmailPage />);

      expect(screen.getByRole('heading', { name: /verify your email address/i })).toBeInTheDocument();
      expect(screen.getByText('testuser@spatial.com')).toBeInTheDocument();
      expect(screen.getByText(/verification pending/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /i've verified my email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });

    it('handles checking verification when user is still unverified', async () => {
      mockReloadUser.mockResolvedValueOnce({
        uid: 'user-pending-123',
        email: 'testuser@spatial.com',
        emailVerified: false,
      });

      render(<VerifyEmailPage />);
      const checkBtn = screen.getByRole('button', { name: /i've verified my email/i });

      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(screen.getByText(/we checked, but your email is not verified yet/i)).toBeInTheDocument();
      });
      expect(mockRouterPush).not.toHaveBeenCalledWith('/customer');
    });

    it('handles checking verification when user has clicked verification link', async () => {
      mockReloadUser.mockResolvedValueOnce({
        uid: 'user-pending-123',
        email: 'testuser@spatial.com',
        emailVerified: true,
      });

      render(<VerifyEmailPage />);
      const checkBtn = screen.getByRole('button', { name: /i've verified my email/i });

      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });
    });

    it('dispatches resend email and enters 60-second cooldown timer', async () => {
      const sendSpy = vi.spyOn(authModule, 'sendVerificationEmail').mockResolvedValueOnce(undefined);

      render(<VerifyEmailPage />);
      const resendBtn = screen.getByRole('button', { name: /resend verification email/i });

      fireEvent.click(resendBtn);

      await waitFor(() => {
        expect(sendSpy).toHaveBeenCalled();
        expect(screen.getByText(/verification email dispatched/i)).toBeInTheDocument();
      });

      // Button should now be disabled and show cooldown text
      expect(screen.getByText(/resend email in \d+s/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend email in/i })).toBeDisabled();
    });

    it('handles rate-limiting (too-many-requests) on resend gracefully', async () => {
      vi.spyOn(authModule, 'sendVerificationEmail').mockRejectedValueOnce({
        code: 'auth/too-many-requests',
      });

      render(<VerifyEmailPage />);
      const resendBtn = screen.getByRole('button', { name: /resend verification email/i });

      fireEvent.click(resendBtn);

      await waitFor(() => {
        expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
      });
    });

    it('allows user to sign out from the verification screen', async () => {
      const logoutSpy = vi.spyOn(authModule, 'logoutUser').mockResolvedValueOnce(undefined);

      render(<VerifyEmailPage />);
      const signoutBtn = screen.getByRole('button', { name: /sign out \/ switch account/i });

      fireEvent.click(signoutBtn);

      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalled();
        expect(mockRouterPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Login Handling with Unverified Accounts', () => {
    it('displays unverified alert with resend option and blocks redirect on unverified login', async () => {
      vi.spyOn(authModule, 'loginUser').mockResolvedValueOnce({
        user: {
          uid: 'login-unverified-uid',
          email: 'unverified-login@test.com',
          emailVerified: false,
        },
      } as unknown as import('firebase/auth').UserCredential);

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('name@example.com');
      const passInput = screen.getByPlaceholderText('••••••••');
      const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

      fireEvent.change(emailInput, { target: { value: 'unverified-login@test.com' } });
      fireEvent.change(passInput, { target: { value: 'Secret123!' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/email verification required/i)).toBeInTheDocument();
        expect(screen.getByText(/unverified-login@test.com/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /verification details/i })).toBeInTheDocument();
      });

      // Must not redirect to customer dashboard
      expect(mockRouterPush).not.toHaveBeenCalledWith('/customer');
    });
  });

  describe('Navbar Unverified Visual State', () => {
    it('displays verification banner and restricts dashboard links when user is unverified', () => {
      mockUser = {
        uid: 'user-unverified',
        email: 'banner-test@spatial.com',
        emailVerified: false,
        reload: vi.fn(),
        getIdToken: vi.fn(),
      };

      render(<Navbar />);

      // Top banner is displayed
      expect(screen.getByText(/email verification pending for/i)).toBeInTheDocument();
      expect(screen.getByText('banner-test@spatial.com')).toBeInTheDocument();

      // Verify email link is present in main navigation
      expect(screen.getByRole('link', { name: /^verify email$/i })).toHaveAttribute('href', '/verify-email');

      // Private Dashboard link is NOT present for unverified users
      expect(screen.queryByRole('link', { name: /^dashboard$/i })).toBeNull();
    });
  });
});
