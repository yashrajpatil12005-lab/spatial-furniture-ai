'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { logoutUser, sendVerificationEmail, getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const { user, userData, loading: authLoading, reloadUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const displayEmail = user?.email || queryEmail || 'your email address';

  // If action code parameters are present, forward to dedicated action handler
  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    if (mode && oobCode) {
      router.replace(`/auth/action?${searchParams.toString()}`);
    }
  }, [searchParams, router]);

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const initialSent = sessionStorage.getItem('initial_verification_sent');
      const initialError = sessionStorage.getItem('initial_verification_error');
      if (initialSent === 'false') {
        sessionStorage.removeItem('initial_verification_sent');
        sessionStorage.removeItem('initial_verification_error');
        return {
          type: 'error',
          text: `We could not automatically dispatch the verification email (${initialError || 'network error'}). Please click "Resend Verification Email" below to receive your link.`,
        };
      } else if (initialSent === 'true') {
        sessionStorage.removeItem('initial_verification_sent');
      }
    } catch {
      // Ignore sessionStorage errors
    }
    return null;
  });
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);

  const isVerified = isManuallyVerified || Boolean(user?.emailVerified);
  const effectiveStatusMessage = statusMessage || (
    !authLoading && user?.emailVerified
      ? { type: 'success' as const, text: 'Your email address is already verified! Redirecting to your dashboard...' }
      : null
  );

  // Countdown timer for resend button cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRedirectAfterVerification = useCallback(() => {
    const role = userData?.role;
    if (role === 'retailer') {
      router.push('/retailer');
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/customer');
    }
  }, [userData?.role, router]);

  // If user is verified, auto redirect
  useEffect(() => {
    if (!authLoading && (user?.emailVerified || isManuallyVerified)) {
      const timeout = setTimeout(() => {
        handleRedirectAfterVerification();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [user?.emailVerified, isManuallyVerified, authLoading, handleRedirectAfterVerification]);

  // Check verification status
  const handleCheckVerification = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setStatusMessage({
        type: 'info',
        text: 'Please sign in to check your verification status.',
      });
      router.push('/login');
      return;
    }

    setIsChecking(true);
    setStatusMessage(null);

    try {
      const refreshedUser = await reloadUser();

      if (refreshedUser?.emailVerified) {
        setIsManuallyVerified(true);
        setStatusMessage({
          type: 'success',
          text: 'Your email has been confirmed! Preparing your spatial workspace...',
        });
        setTimeout(() => {
          handleRedirectAfterVerification();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'info',
          text: "We checked, but your email is not verified yet. Please make sure you clicked the verification link in your email inbox, then check again.",
        });
      }
    } catch (err) {
      const message = getFriendlyAuthErrorMessage(err);
      setStatusMessage({
        type: 'error',
        text: message,
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;

    const currentUser = auth.currentUser || user;

    if (!currentUser) {
      setStatusMessage({
        type: 'info',
        text: 'Session expired. Please sign in to request another verification email.',
      });
      router.push('/login');
      return;
    }

    if (currentUser.emailVerified) {
      setIsManuallyVerified(true);
      setStatusMessage({
        type: 'success',
        text: 'Your email is already verified! Redirecting to your dashboard...',
      });
      handleRedirectAfterVerification();
      return;
    }

    setIsResending(true);
    setStatusMessage(null);

    try {
      await sendVerificationEmail(currentUser);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStatusMessage({
        type: 'success',
        text: `Verification email sent! Please check ${displayEmail} (including Spam/Junk folder).`,
      });
    } catch (err: unknown) {
      const message = getFriendlyAuthErrorMessage(err);
      setStatusMessage({
        type: 'error',
        text: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0B0F19]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

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

      <div className="max-w-lg w-full space-y-6 bg-[#111827]/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative backdrop-blur-xl">
        {/* Top Amber Accent Hairline */}
        <div 
          aria-hidden="true" 
          className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" 
        />

        {/* Header Icon & Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            {isVerified ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              id="verification-status-badge"
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isVerified
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {isVerified ? 'Email Verified' : 'Verification Pending'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isVerified ? 'Email Verified Successfully' : 'Verify Your Email Address'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            {isVerified
              ? 'Thank you for verifying your email. You can now access all protected features.'
              : 'To secure your account and access spatial room visualization, please verify your email address.'}
          </p>
        </div>

        {/* Registered Email Callout */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Verification link sent to
          </p>
          <p id="registered-email-address" className="text-sm font-bold text-white font-mono break-all">
            {displayEmail}
          </p>
        </div>

        {/* Status Alert Banner */}
        {effectiveStatusMessage && (
          <div
            id="verification-status-alert"
            role="status"
            className={`p-4 rounded-2xl border text-xs font-medium ${
              effectiveStatusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : effectiveStatusMessage.type === 'error'
                ? 'bg-red-500/15 border-red-500/30 text-red-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {effectiveStatusMessage.type === 'success' && (
                <svg className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {effectiveStatusMessage.type === 'error' && (
                <svg className="w-4 h-4 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {effectiveStatusMessage.type === 'info' && (
                <svg className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="flex-1">{effectiveStatusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Instructions Steps */}
        {!isVerified && (
          <div className="space-y-3 pt-1">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Verification Steps:
            </h2>
            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center border border-amber-500/30">
                  1
                </span>
                <span>Open your email inbox and locate the message from <strong className="text-white">Spatial Furniture AI</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center border border-amber-500/30">
                  2
                </span>
                <span>Click the amber <strong className="text-amber-400">&quot;Verify Email Address&quot;</strong> button in the email.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center border border-amber-500/30">
                  3
                </span>
                <span>Return to this window and click <strong className="text-white">&quot;I&apos;ve Verified My Email&quot;</strong> below.</span>
              </li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {!isVerified ? (
            <>
              <button
                id="check-verification-btn"
                type="button"
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>I&apos;ve Verified My Email</span>
                  </>
                )}
              </button>

              <button
                id="resend-verification-btn"
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-amber-400 bg-slate-800/80 border border-amber-500/30 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></div>
                    <span>Sending email...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend email in {resendCooldown}s</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              id="continue-to-portal-btn"
              type="button"
              onClick={handleRedirectAfterVerification}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <span>Continue to Workspace &rarr;</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <Link
              href="/customer/products"
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              &larr; Browse Public Catalog
            </Link>

            <button
              id="verification-signout-btn"
              type="button"
              onClick={handleSignOut}
              className="text-red-400 hover:underline font-medium cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>

        {/* Troubleshooting & Email Template Help */}
        <div className="text-[11px] text-slate-400 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-300">Didn&apos;t receive the email?</p>
            <Link 
              href="/auth/email-preview" 
              className="text-amber-400 hover:underline font-medium text-[11px]"
            >
              Preview Email Template &rarr;
            </Link>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
            <li>Verification emails can take up to 1-2 minutes to arrive.</li>
            <li>Verify that your email address was typed correctly.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0B0F19]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
