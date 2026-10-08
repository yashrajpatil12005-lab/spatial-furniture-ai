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
      // NOTE: role is strictly assigned as "customer" inside registerUser to prevent privilege escalation
      await registerUser(email, password, name);
      router.push('/customer');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-[#0F0F0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#141414] p-8 sm:p-10 rounded-2xl border border-[#27272A] shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 mb-4">
            <span className="text-lg font-bold text-[#10B981]">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">Create Account</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Start visualizing spatial furniture with AI
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#27272A] text-[#F5F5F5] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#27272A] text-[#F5F5F5] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="block w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#27272A] text-[#F5F5F5] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#141414] disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#A1A1AA]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#10B981] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
