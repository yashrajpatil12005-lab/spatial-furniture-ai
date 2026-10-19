'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { logoutUser, sendVerificationEmail, getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const { user, userData, loading: authLoading, reloadUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const displayEmail = user?.email || queryEmail || 'your email address';

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
    if (!user) {
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
          text: 'Email verified successfully! Preparing your spatial workspace...',
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

    if (!user) {
      setStatusMessage({
        type: 'info',
        text: 'Session expired. Please sign in to request another verification email.',
      });
      router.push('/login');
      return;
    }

    if (user.emailVerified) {
      setIsManuallyVerified(true);
      setStatusMessage({
        type: 'success',
        text: 'Your email is already verified!',
      });
      handleRedirectAfterVerification();
      return;
    }

    setIsResending(true);
    setStatusMessage(null);

    try {
      await sendVerificationEmail(user);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStatusMessage({
        type: 'success',
        text: `Verification email dispatched! Please check ${displayEmail} (including Spam/Junk folder).`,
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
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-[#F8FAFC] py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] card-shadow">
        
        {/* Header Icon & Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] mb-4 shadow-xs">
            {isVerified ? (
              <svg className="w-7 h-7 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              id="verification-status-badge"
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isVerified
                  ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                  : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
              }`}
            >
              {isVerified ? 'Email Verified' : 'Verification Pending'}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            {isVerified ? 'Account Verified!' : 'Verify Your Email Address'}
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            {isVerified
              ? 'Thank you for verifying your email. You can now access all protected features.'
              : 'To secure your account and access spatial room visualization, please verify your email address.'}
          </p>
        </div>

        {/* Registered Email Callout */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Verification link sent to
          </p>
          <p id="registered-email-address" className="text-sm font-bold text-[#111827] font-mono break-all">
            {displayEmail}
          </p>
        </div>

        {/* Status Alert Banner */}
        {effectiveStatusMessage && (
          <div
            id="verification-status-alert"
            role="status"
            className={`p-4 rounded-xl border text-xs font-medium ${
              effectiveStatusMessage.type === 'success'
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]'
                : effectiveStatusMessage.type === 'error'
                ? 'bg-[#FEF2F2] border-red-200 text-[#EF4444]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {effectiveStatusMessage.type === 'success' && (
                <svg className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {effectiveStatusMessage.type === 'error' && (
                <svg className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {effectiveStatusMessage.type === 'info' && (
                <svg className="w-4 h-4 shrink-0 text-[#3B82F6] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h2 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Verification Steps:
            </h2>
            <ol className="space-y-2 text-xs text-[#475569]">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857] font-bold text-[11px] flex items-center justify-center border border-[#A7F3D0]">
                  1
                </span>
                <span>Open your email inbox and locate the message from <strong>Spatial Furniture AI</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857] font-bold text-[11px] flex items-center justify-center border border-[#A7F3D0]">
                  2
                </span>
                <span>Click the official verification link provided in the email.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857] font-bold text-[11px] flex items-center justify-center border border-[#A7F3D0]">
                  3
                </span>
                <span>Return to this window and click <strong>&quot;I&apos;ve Verified My Email&quot;</strong> below.</span>
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-[#D1FAE5] focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#047857] border-t-transparent"></div>
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 transition-all shadow-sm"
            >
              <span>Continue to Workspace &rarr;</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
            <Link
              href="/customer/products"
              className="text-[#64748B] hover:text-[#111827] transition-colors"
            >
              &larr; Browse Public Catalog
            </Link>

            <button
              id="verification-signout-btn"
              type="button"
              onClick={handleSignOut}
              className="text-[#EF4444] hover:underline font-medium"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>

        {/* Troubleshooting Accordion / Help */}
        <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
          <p className="font-semibold text-[#475569]">Didn&apos;t receive the email?</p>
          <ul className="list-disc pl-4 space-y-0.5">
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
        <div className="min-h-[75vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
