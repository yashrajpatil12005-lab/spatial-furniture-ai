'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Customer Portal', href: '/customer' },
    { label: 'Retailer Dashboard', href: '/retailer' },
    { label: 'Admin', href: '/admin' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#111827] hover:opacity-90 transition-opacity flex items-center gap-1">
              <span>Spatial</span>
              <span className="text-[#10B981]">AI</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-[#047857] bg-[#ECFDF5] font-semibold'
                      : 'text-[#475569] hover:text-[#059669] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action / Auth State */}
          <div className="hidden md:flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                      Role: {userData?.role || '...'}
                    </span>
                    <button
                      onClick={() => logoutUser()}
                      className="text-xs font-medium text-[#475569] hover:text-red-600 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-[#475569] hover:text-[#111827] px-3.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-[#475569] hover:text-[#111827] hover:bg-[#F1F5F9] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-5 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#047857] bg-[#ECFDF5] font-semibold'
                    : 'text-[#475569] hover:text-[#059669] hover:bg-[#F8FAFC]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#E2E8F0] mt-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-mono font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                      Role: {userData?.role || '...'}
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutUser();
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-sm font-medium text-[#475569] hover:text-[#111827]"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-sm font-semibold rounded-lg bg-[#10B981] text-white"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
