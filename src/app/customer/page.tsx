'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';

export default function CustomerPage() {
  const { userData } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['customer', 'admin']}>
      <div className="min-h-[82vh] bg-[#0F0F0F] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full mx-auto p-8 sm:p-12 text-center bg-[#141414] rounded-2xl border border-[#27272A] shadow-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 mb-6">
            <svg className="w-7 h-7 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] sm:text-4xl">
            Customer Portal
          </h1>
          <p className="mt-3 text-base text-[#A1A1AA] max-w-xl mx-auto">
            Welcome back, <span className="text-[#F5F5F5] font-semibold">{userData?.name || 'Customer'}</span>. Discover designer furniture, run AI room analyses, and customize finishes for your space.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/customer/products"
              className="inline-flex items-center rounded-lg bg-[#10B981] hover:bg-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all"
            >
              Browse Furniture Catalog
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#27272A] px-6 py-3 text-sm font-semibold text-[#F5F5F5] transition-all"
            >
              Platform Overview
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
