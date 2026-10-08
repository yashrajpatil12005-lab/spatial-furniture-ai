'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';

export default function CustomerPage() {
  const { userData } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['customer', 'admin']}>
      <div className="min-h-[82vh] bg-[#F8FAFC] flex flex-col items-center justify-center px-5 py-12">
        <div className="max-w-3xl w-full mx-auto p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E2E8F0] card-shadow">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] mb-6">
            <svg className="w-7 h-7 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Customer Portal
          </h1>
          <p className="mt-3 text-base text-[#475569] max-w-xl mx-auto">
            Welcome back, <span className="text-[#111827] font-semibold">{userData?.name || 'Customer'}</span>. Discover designer furniture, run AI room analyses, and customize finishes for your space.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/customer/products"
              className="inline-flex items-center rounded-xl bg-[#10B981] hover:bg-[#059669] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all"
            >
              Browse Furniture Catalog
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] px-6 py-3.5 text-sm font-semibold text-[#111827] shadow-sm transition-all"
            >
              Platform Overview
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
