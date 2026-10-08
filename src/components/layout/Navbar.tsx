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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#27272A] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#F5F5F5] hover:opacity-90 transition-opacity flex items-center gap-1.5">
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
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 font-semibold'
                      : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818]'
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
                    <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/30">
                      Role: {userData?.role || '...'}
                    </span>
                    <button
                      onClick={() => logoutUser()}
                      className="text-xs font-medium text-[#A1A1AA] hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-[#181818] border border-transparent hover:border-[#27272A] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F5] px-3 py-1.5 rounded-md hover:bg-[#181818] transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md bg-[#10B981] hover:bg-[#059669] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors"
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
              className="p-2 rounded-md text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818] focus:outline-none"
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
        <div className="md:hidden border-b border-[#27272A] bg-[#141414] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  active
                    ? 'text-[#10B981] bg-[#10B981]/10 font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#27272A] mt-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                      Role: {userData?.role || '...'}
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutUser();
                      }}
                      className="text-xs font-medium text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-sm text-[#A1A1AA] hover:text-white"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-sm font-semibold rounded-md bg-[#10B981] text-white"
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
