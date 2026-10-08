'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles) {
        if (!userData) {
          router.push('/');
        } else if (!allowedRoles.includes(userData.role)) {
          router.push('/');
        }
      }
    }
  }, [user, userData, loading, router, allowedRoles]);

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
