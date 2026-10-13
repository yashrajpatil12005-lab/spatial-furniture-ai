'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      // Clear, secure error messaging that avoids exposing sensitive implementation details
      let friendlyMessage = 'Failed to sign in. Please check your credentials and try again.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-login-credentials'
        ) {
          friendlyMessage = 'Invalid email or password. Please try again.';
        } else if (code === 'auth/invalid-email') {
          friendlyMessage = 'Please enter a valid email address.';
        } else if (code === 'auth/too-many-requests') {
          friendlyMessage = 'Too many failed login attempts. Please try again later.';
        } else if (code === 'auth/user-disabled') {
          friendlyMessage = 'This account has been disabled. Please contact support.';
        } else if (code === 'auth/network-request-failed') {
          friendlyMessage = 'Network error. Please check your internet connection.';
        }
      } else if (err instanceof Error) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
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
                  maxLength={128}
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
