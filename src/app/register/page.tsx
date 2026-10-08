'use client';

import { useState } from 'react';
import { registerUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await registerUser(email, password, name);
      router.push('/customer');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
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
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Create Account</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Start visualizing spatial furniture with AI
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="block w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#64748B]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#047857] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
