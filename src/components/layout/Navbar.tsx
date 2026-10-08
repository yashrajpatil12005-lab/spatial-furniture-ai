'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';

export default function Navbar() {
  const { user, userData, loading } = useAuth();

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-neutral-900">
              Spatial<span className="text-emerald-600">AI</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/customer" className="text-sm font-semibold text-neutral-700 hover:text-emerald-600 transition-colors">
              Customer Portal
            </Link>
            <Link href="/retailer" className="text-sm font-semibold text-neutral-700 hover:text-emerald-600 transition-colors">
              Retailer Dashboard
            </Link>
            <Link href="/admin" className="text-sm font-semibold text-neutral-700 hover:text-emerald-600 transition-colors">
              Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      Role: {userData?.role || '...'}
                    </span>
                    <button 
                      onClick={() => logoutUser()}
                      className="text-sm font-semibold text-neutral-700 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-semibold text-neutral-700 hover:text-emerald-600 transition-colors">
                      Log in
                    </Link>
                    <Link href="/register" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors">
                      Sign up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
