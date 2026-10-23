'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { loginUser, sendVerificationEmail, logoutUser, getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';
import { checkResendRateLimit, recordSuccessfulResend, recordThrottleCooldown, MAX_RESENDS_PER_HOUR } from '@/lib/utils/resendRateLimiter';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const resendingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerifiedQuery = searchParams.get('verified') === 'true';

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedUser(null);
    setResendSuccess('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await loginUser(email, password);
      
      // Check verification status before allowing access to protected features
      if (!userCredential.user.emailVerified) {
        setUnverifiedUser(userCredential.user);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', userCredential.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === 'retailer') {
            router.push('/retailer');
          } else if (role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/customer');
          }
        } else {
          router.push('/customer');
        }
      } catch {
        router.push('/customer');
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendFromLogin = async () => {
    if (!unverifiedUser || resendingRef.current || resending || resendCooldown > 0) return;

    const rateStatus = checkResendRateLimit(unverifiedUser.uid, Date.now(), unverifiedUser.email || undefined);
    if (!rateStatus.allowed) {
      if (rateStatus.reason === 'hourly_limit') {
        const mins = Math.ceil(rateStatus.retryAfterSeconds / 60);
        setError(`You have reached the limit of ${MAX_RESENDS_PER_HOUR} verification emails per hour. Please wait ${mins} minute(s) before trying again.`);
      } else {
        setError(`Please wait ${rateStatus.cooldownSeconds} seconds before requesting another verification email.`);
      }
      return;
    }

    resendingRef.current = true;
    setResending(true);
    setResendSuccess('');
    setError('');
    try {
      await sendVerificationEmail(unverifiedUser);
      recordSuccessfulResend(unverifiedUser.uid, Date.now(), unverifiedUser.email || undefined);
      setResendCooldown(60);
      setResendSuccess(`Verification email sent to ${unverifiedUser.email}! Check your inbox.`);
    } catch (err: unknown) {
      const errorCode = (err && typeof err === 'object' && 'code' in err) ? (err as { code: string }).code : '';
      if (errorCode === 'auth/too-many-requests') {
        recordThrottleCooldown(unverifiedUser.uid, 60, unverifiedUser.email || undefined);
        setResendCooldown(60);
      }
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setResending(false);
      resendingRef.current = false;
    }
  };

  const handleSignOutFromLogin = async () => {
    try {
      await logoutUser();
      setUnverifiedUser(null);
      setResendSuccess('');
      setError('');
    } catch (err) {
      console.error('Logout error:', err);
      setUnverifiedUser(null);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-[#F8FAFC] py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] card-shadow">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] mb-4">
            <span className="text-xl font-bold text-[#047857]">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Sign in to access your SpatialAI portal
          </p>
        </div>

        {/* Verification Success Notice if redirected from verification handler */}
        {isVerifiedQuery && !unverifiedUser && (
          <div
            id="verified-login-banner"
            role="status"
            className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] flex items-center gap-2.5 font-medium"
          >
            <svg className="w-5 h-5 text-[#10B981] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Email verified successfully! You can now sign in with your credentials to access your workspace.</span>
          </div>
        )}

        {/* Unverified Account Notice & Actions */}
        {unverifiedUser && (
          <div
            id="unverified-account-notice"
            role="alert"
            className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-[#92400E]">Email Verification Required</p>
                <p className="text-[#B45309] mt-0.5">
                  Your email address (<strong>{unverifiedUser.email}</strong>) has not been verified yet. Please verify your email to access protected dashboards.
                </p>
              </div>
            </div>

            {resendSuccess && (
              <p className="text-[#047857] font-medium bg-[#ECFDF5] p-2 rounded-lg border border-[#A7F3D0]">
                {resendSuccess}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="login-resend-btn"
                type="button"
                onClick={handleResendFromLogin}
                disabled={resendCooldown > 0 || resending}
                className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-medium hover:bg-[#065F46] disabled:opacity-50 transition-colors shadow-xs"
              >
                {resending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Verification Email'}
              </button>

              <Link
                href={`/verify-email?email=${encodeURIComponent(unverifiedUser.email || '')}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:text-[#111827] font-medium transition-colors"
              >
                Verification Details &rarr;
              </Link>

              <button
                id="login-signout-btn"
                type="button"
                onClick={handleSignOutFromLogin}
                className="px-2 py-1.5 text-[#EF4444] hover:underline font-medium ml-auto"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleLogin} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-4 pr-11 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-red-200 text-xs text-[#EF4444] text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#64748B]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-[#047857] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[82vh] flex items-center justify-center bg-[#F8FAFC]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
