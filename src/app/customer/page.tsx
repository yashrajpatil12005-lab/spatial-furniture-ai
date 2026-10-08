'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';

export default function CustomerPage() {
  const { userData } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['customer', 'admin']}>
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Customer Portal
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Welcome back, {userData?.name || 'Customer'}. Future home of AI-powered furniture visualization and AR try-ons.
          </p>
          <div className="mt-8">
            <a href="/customer/products" className="inline-flex items-center rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors">
              Browse Furniture Catalog
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
