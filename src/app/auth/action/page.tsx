'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { applyActionCode, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';
import { useAuth } from '@/lib/firebase/AuthContext';

type ActionStatus = 
  | 'verifying'
  | 'success'
  | 'expired'
  | 'invalid'
  | 'disabled'
  | 'user_not_found'
  | 'resetPassword'
  | 'missing_code'
  | 'unsupported_mode'
  | 'error';

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { reloadUser } = useAuth();

  const mode = searchParams.get('mode') || '';
  const oobCode = searchParams.get('oobCode') || '';
  const continueUrl = searchParams.get('continueUrl') || '';

  const isEmailVerificationMode = mode === 'verifyEmail' || mode === 'verifyAndChangeEmail';
  const isSamplePreviewCode = oobCode === 'sample_oob_verification_code_spatial_ai';

  const [status, setStatus] = useState<ActionStatus>(() => {
    if (mode === 'resetPassword') return 'resetPassword';
    if (!oobCode) return 'missing_code';
    if (isSamplePreviewCode) return 'invalid';
    if (!isEmailVerificationMode) return 'unsupported_mode';
    return 'verifying';
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined' && auth.currentUser?.email) {
      return auth.currentUser.email;
    }
    return '';
  });
  const [userRole, setUserRole] = useState<'customer' | 'retailer' | 'admin'>('customer');
  const [isAlreadySignedIn, setIsAlreadySignedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && Boolean(auth.currentUser?.emailVerified)) {
      return true;
    }
    return false;
  });
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(() => {
    if (typeof window !== 'undefined' && Boolean(auth.currentUser?.emailVerified)) {
      return 4;
    }
    return null;
  });

  const verificationExecutedRef = useRef(false);

  // Helper to determine destination dashboard by role
  const getDashboardPath = useCallback((role: 'customer' | 'retailer' | 'admin') => {
    switch (role) {
      case 'retailer':
        return '/retailer';
      case 'admin':
        return '/admin';
      case 'customer':
      default:
        return '/customer';
    }
  }, []);

  const handleRedirectToDashboard = useCallback(() => {
    const target = continueUrl && continueUrl.startsWith('/') && !continueUrl.startsWith('/auth')
      ? continueUrl
      : getDashboardPath(userRole);
    router.push(target);
  }, [continueUrl, getDashboardPath, userRole, router]);

  // Execute verification flow
  useEffect(() => {
    if (verificationExecutedRef.current || status !== 'verifying') return;
    if (!isEmailVerificationMode || !oobCode || isSamplePreviewCode) return;
    verificationExecutedRef.current = true;

    async function handleVerify() {
      setStatus('verifying');

      try {
        // 1. Apply Firebase out-of-band action code
        await applyActionCode(auth, oobCode);

        // 2. Refresh current user token and session if user is logged in on this browser
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            await currentUser.reload();
            if (currentUser.emailVerified) {
              await currentUser.getIdToken(true);
            }
            await reloadUser();
            setIsAlreadySignedIn(true);
            setUserEmail(currentUser.email || '');
            setAutoRedirectCountdown(4);

            // Fetch user role from Firestore
            const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDocSnap.exists()) {
              const role = userDocSnap.data()?.role;
              if (role === 'retailer' || role === 'admin') {
                setUserRole(role);
              }
            }
          } catch {
            console.warn(`[authAction] Session refresh warning: operation=reloadUser, timestamp=${new Date().toISOString()}`);
          }
        }

        setStatus('success');
      } catch (err: unknown) {
        const errorCode = (err && typeof err === 'object' && 'code' in err)
          ? (err as { code: string }).code
          : 'unknown';
        console.error(`[authAction] applyActionCode failed: operation=applyActionCode, timestamp=${new Date().toISOString()}, code=${errorCode}`);

        // If action code is invalid or already used, check if currentUser is already verified
        if (errorCode === 'auth/invalid-action-code') {
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              await currentUser.reload();
              if (currentUser.emailVerified) {
                await currentUser.getIdToken(true);
                await reloadUser();
                setIsAlreadySignedIn(true);
                setUserEmail(currentUser.email || '');
                setAutoRedirectCountdown(4);

                const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDocSnap.exists()) {
                  const role = userDocSnap.data()?.role;
                  if (role === 'retailer' || role === 'admin') {
                    setUserRole(role);
                  }
                }
                setStatus('success');
                return;
              }
            } catch {
              // Proceed to invalid status
            }
          }
          setStatus('invalid');
          return;
        }

        if (errorCode === 'auth/expired-action-code') {
          setStatus('expired');
          return;
        }

        if (errorCode === 'auth/user-disabled') {
          setStatus('disabled');
          return;
        }

        if (errorCode === 'auth/user-not-found') {
          setStatus('user_not_found');
          return;
        }

        setStatus('error');
        setErrorMessage(getFriendlyAuthErrorMessage(err));
      }
    }

    handleVerify();
  }, [oobCode, reloadUser, status, isEmailVerificationMode, isSamplePreviewCode]);

  // Listen for late auth state hydration in case user was signed in but auth hadn't loaded
  useEffect(() => {
    if (status !== 'success') return;

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && !isAlreadySignedIn) {
        try {
          await user.reload();
          if (user.emailVerified) {
            await user.getIdToken(true);
            await reloadUser();
            setIsAlreadySignedIn(true);
            setUserEmail(user.email || '');
            setAutoRedirectCountdown(4);

            const userDocSnap = await getDoc(doc(db, 'users', user.uid));
            if (userDocSnap.exists()) {
              const role = userDocSnap.data()?.role;
              if (role === 'retailer' || role === 'admin') {
                setUserRole(role);
              }
            }
          }
        } catch (e) {
          console.warn('[authAction] Auth listener hydration error:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [status, isAlreadySignedIn, reloadUser]);

  useEffect(() => {
    if (autoRedirectCountdown === null || autoRedirectCountdown <= 0) {
      if (autoRedirectCountdown === 0 && isAlreadySignedIn) {
        handleRedirectToDashboard();
      }
      return;
    }

    const timer = setInterval(() => {
      setAutoRedirectCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirectCountdown, isAlreadySignedIn, handleRedirectToDashboard]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow & Lighting */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-md w-full bg-[#111827]/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative backdrop-blur-xl transition-all">
        {/* Top Amber Accent Hairline */}
        <div 
          aria-hidden="true" 
          className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" 
        />

        {/* 1. VERIFYING STATE */}
        {status === 'verifying' && (
          <div className="text-center space-y-4 py-4" data-testid="verification-loading">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 mb-2 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Verifying Credentials
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Verifying Your Email...
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Please wait while we validate your one-time verification token with Spatial Furniture AI servers.
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE (Requirement 5 & 6) */}
        {status === 'success' && (
          <div className="text-center space-y-5" data-testid="verification-success">
            {/* Verification Success Icon with Amber/Emerald Dual Tone */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg text-slate-950">
                <svg 
                  className="w-8 h-8 text-slate-950" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Amber Status Badge */}
            <div className="flex justify-center">
              <span 
                id="verification-status-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Email Verified
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Email Verified Successfully!
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Thank you for verifying your email address. Your Spatial Furniture AI account is now fully active.
              </p>
            </div>

            {/* If user is signed in: show refreshed status banner & dashboard access */}
            {isAlreadySignedIn ? (
              <div 
                id="verified-signedin-banner"
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Session
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Token Refreshed
                  </span>
                </div>
                <p id="verified-user-email" className="text-sm font-bold text-white font-mono truncate">
                  {userEmail}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Email verified &mdash; full spatial tools unlocked</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400">
                You can now sign in with your verified credentials to access your spatial workspace.
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isAlreadySignedIn ? (
                <>
                  <button
                    id="continue-to-dashboard-btn"
                    type="button"
                    onClick={handleRedirectToDashboard}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>
                      Continue to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
                    </span>
                    {autoRedirectCountdown !== null && autoRedirectCountdown > 0 && (
                      <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-md font-mono">
                        ({autoRedirectCountdown}s)
                      </span>
                    )}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <Link
                    id="continue-to-signin-btn"
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
                  >
                    <span>Continue to Sign In / Switch Account</span>
                  </Link>
                </>
              ) : (
                <Link
                  id="continue-to-signin-btn"
                  href="/login?verified=true"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all duration-200"
                >
                  <span>Continue to Sign In</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <Link
                  href="/customer/products"
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                >
                  &larr; Browse Furniture Catalog
                </Link>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. EXPIRED LINK STATE (Requirement 7) */}
        {status === 'expired' && (
          <div className="text-center space-y-5" data-testid="verification-expired">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Link Expired
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Verification Link Expired
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                For security reasons, email verification links expire after a limited period. Please request a fresh verification link below.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                id="request-new-link-btn"
                href="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Request New Verification Email</span>
              </Link>

              <Link
                id="back-to-login-btn"
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. INVALID OR ALREADY USED STATE (Requirement 7) */}
        {status === 'invalid' && (
          <div className="text-center space-y-5" data-testid="verification-invalid">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Link Inactive or Already Used
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Invalid or Already Used Link
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                This verification code is no longer valid or has already been consumed. If your email is already verified, you can proceed directly to sign in.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left space-y-1.5 text-xs text-slate-300">
              <p className="font-semibold text-amber-400">Why am I seeing this?</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li><strong>Already Verified:</strong> If you already clicked this verification link earlier, your email has been confirmed. You can proceed to sign in.</li>
                <li><strong>Multiple Requests:</strong> If you requested multiple verification emails, make sure you use the button in the most recent email.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                id="continue-to-signin-btn"
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Continue to Sign In</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>Check Verification Status / Resend</span>
              </Link>
            </div>
          </div>
        )}

        {/* 5. ACCOUNT DISABLED OR NOT FOUND STATE */}
        {(status === 'disabled' || status === 'user_not_found') && (
          <div className="text-center space-y-5" data-testid="verification-account-issue">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                {status === 'disabled' ? 'Account Disabled' : 'Account Not Found'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {status === 'disabled' ? 'Account Has Been Disabled' : 'Account Could Not Be Found'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                {status === 'disabled'
                  ? 'This account has been disabled. Please contact Spatial Furniture AI support for assistance.'
                  : 'We could not find an account associated with this verification link.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/contact"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm"
              >
                <span>Contact Support</span>
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* 6. PASSWORD RESET MODE */}
        {status === 'resetPassword' && (
          <div className="text-center space-y-5" data-testid="verification-reset-password">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Password Reset Request
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
              Please sign in with your account or follow the instructions sent to your email to complete your password update.
            </p>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Continue to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* 7. MISSING CODE OR PARAMETERS */}
        {status === 'missing_code' && (
          <div className="text-center space-y-5" data-testid="verification-missing-code">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              No Action Code Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              This link is missing required verification parameters. Please click the full verification link sent to your email address.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Go to Email Verification Page</span>
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* 8. UNSUPPORTED MODE STATE (e.g. mode=action or invalid mode) */}
        {status === 'unsupported_mode' && (
          <div className="text-center space-y-5" data-testid="verification-unsupported-mode">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Unsupported Verification Mode
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Unsupported Verification Mode
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                {mode === 'action'
                  ? 'This link uses "mode=action", which is not a supported Firebase verification mode. Firebase email verification links generated with %LINK% use "mode=verifyEmail".'
                  : `The verification action mode "${mode || 'unknown'}" is not supported. Please click the full dynamic link sent to your email address.`}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Go to Email Verification Page</span>
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* 9. GENERAL ERROR STATE */}
        {status === 'error' && (
          <div className="text-center space-y-5" data-testid="verification-general-error">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                Verification Failed
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Verification Unsuccessful
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                {errorMessage || 'An error occurred while attempting to verify your email address. Please try again.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/verify-email"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all text-sm"
              >
                <span>Check Verification Status</span>
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0B0F19]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
