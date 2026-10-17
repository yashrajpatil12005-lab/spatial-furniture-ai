'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireVerified?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireVerified = true,
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireVerified && !user.emailVerified) {
        router.push('/verify-email');
      } else if (allowedRoles) {
        if (!userData) {
          router.push('/');
        } else if (!allowedRoles.includes(userData.role)) {
          router.push('/');
        }
      }
    }
  }, [user, userData, loading, router, allowedRoles, requireVerified]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (requireVerified && !user.emailVerified) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
        <div className="bg-white border border-[#E2E8F0] p-8 rounded-2xl max-w-md card-shadow space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#111827]">Email Verification Required</h2>
          <p className="text-xs text-[#64748B]">
            Please verify your email address to access this feature. Redirecting you to the verification page...
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles) {
    if (!userData) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl max-w-md card-shadow">
            <p className="text-red-600 font-bold mb-2 text-sm">Account Verification</p>
            <p className="text-xs text-[#64748B]">
              Your profile data is loading or could not be found. Please try refreshing or signing in again.
            </p>
          </div>
        </div>
      );
    }
    
    if (!allowedRoles.includes(userData.role)) {
      return null; // Will redirect via useEffect
    }
  }

  return <>{children}</>;
}
