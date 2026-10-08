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
        console.log("[ProtectedRoute] No user found, redirecting to /login");
        router.push('/login');
      } else if (allowedRoles) {
        if (!userData) {
          console.warn("[ProtectedRoute] User is logged in but has no userData document. Redirecting to home.");
          router.push('/');
        } else if (!allowedRoles.includes(userData.role)) {
          console.warn(`[ProtectedRoute] User role '${userData.role}' is not in allowed roles: ${allowedRoles.join(', ')}. Redirecting.`);
          router.push('/');
        }
      }
    }
  }, [user, userData, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // If roles are required and user data is missing or role is unauthorized, show error instead of hanging
  if (allowedRoles) {
    if (!userData) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
          <p className="text-red-500 font-bold mb-2">Account Error</p>
          <p className="text-neutral-600">Your profile data could not be found. Please try logging out and registering again.</p>
        </div>
      );
    }
    
    if (!allowedRoles.includes(userData.role)) {
      return null; // Will redirect via useEffect
    }
  }

  return <>{children}</>;
}
