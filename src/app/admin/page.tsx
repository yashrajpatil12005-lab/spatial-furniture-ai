'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';

export default function AdminPage() {
  const { userData } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-400 sm:text-5xl">
            System Admin
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Welcome, {userData?.name || 'Admin'}. Configure platform integrations.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
