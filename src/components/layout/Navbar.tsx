'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Track hash changes for active anchor navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close menus on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
    }
  }, [pathname]);

  // Click outside to close account dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard accessibility: Close open menus on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !currentHash;
    }
    if (href.startsWith('/#')) {
      const targetHash = href.substring(1);
      return pathname === '/' && currentHash === targetHash;
    }
    return pathname.startsWith(href);
  };

  // Determine current role navigation configuration
  const role = userData?.role; // 'customer' | 'retailer' | 'admin' | undefined

  // 1. Logged-out / Public Links
  const publicLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Furniture', href: '/customer/products' },
    { label: 'AI Room Visualizer', href: '/customer/products#room-visualizer' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'For Retailers', href: '/#for-retailers' },
    { label: 'Contact', href: '/contact' },
  ];

  // 2. Authenticated Customer Links
  const customerLinks = [
    { label: 'Dashboard', href: '/customer' },
    { label: 'Furniture Catalog', href: '/customer/products' },
    { label: 'Room Visualizer', href: '/customer/products#room-visualizer' },
  ];

  // 3. Retailer Partner Links
  const retailerLinks = [
    { label: 'Overview', href: '/retailer' },
    { label: 'Manage Products', href: '/retailer/products' },
    { label: 'Add Product', href: '/retailer/products/new' },
    { label: 'Public Site', href: '/' },
  ];

  // 4. Admin Links
  const adminLinks = [
    { label: 'Overview', href: '/admin' },
    { label: 'Product Management', href: '/retailer/products' },
    { label: 'Platform Health', href: '/admin#platform-health' },
    { label: 'Customer View', href: '/customer/products' },
    { label: 'Public Site', href: '/' },
  ];

  // Pick links according to role state
  let currentNavLinks = publicLinks;
  let roleDisplayName = '';
  let roleBadgeClass = '';

  if (user) {
    if (role === 'retailer') {
      currentNavLinks = retailerLinks;
      roleDisplayName = 'Retail Partner';
      roleBadgeClass = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    } else if (role === 'admin') {
      currentNavLinks = adminLinks;
      roleDisplayName = 'Platform Administrator';
      roleBadgeClass = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
    } else {
      currentNavLinks = customerLinks;
      roleDisplayName = 'Customer';
      roleBadgeClass = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    }
  }

  // User initials or fallback
  const userName = userData?.name || user?.displayName || (role === 'admin' ? 'Admin' : 'User');
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <nav
      id="main-navigation"
      aria-label="Main Navigation"
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs transition-all"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 h-full">
        <div className="flex justify-between h-full items-center">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              id="brand-logo-link"
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
              aria-label="Spatial AI Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-tighter">
                <span>S</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-[#111827]">Spatial</span>
                <span className="text-xl font-bold tracking-tight text-[#10B981]">AI</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-1 items-center">
            {loading ? (
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={`desktop-skeleton-${i}`} className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              currentNavLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={`desktop-nav-${link.label}-${link.href}`}
                    href={link.href}
                    id={`nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'text-[#047857] bg-[#ECFDF5] font-semibold border border-[#A7F3D0]/70 shadow-2xs'
                        : 'text-[#475569] hover:text-[#059669] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            )}
          </div>

          {/* Right Actions / Auth State */}
          <div className="hidden lg:flex items-center space-x-3">
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              /* Authenticated User Account Menu Dropdown */
              <div className="relative" ref={accountMenuRef}>
                <button
                  id="user-account-menu-button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
                >
                  <span className="text-xs font-semibold text-[#111827] max-w-[130px] truncate">
                    {userName}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                    {userInitials}
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                      accountMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Card */}
                {accountMenuOpen && (
                  <div
                    id="user-account-dropdown"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-account-menu-button"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {/* User Identity Header */}
                    <div className="p-3 border-b border-[#F1F5F9] mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {userInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#111827] truncate">{userName}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeClass}`}
                        >
                          {roleDisplayName}
                        </span>
                      </div>
                    </div>

                    {/* Role-Specific Contextual Links */}
                    <div className="py-1 space-y-0.5 text-xs text-[#334155]">
                      {role === 'customer' && (
                        <>
                          <Link
                            href="/customer"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Customer Dashboard</span>
                          </Link>
                          <Link
                            href="/customer/products"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span>Explore Catalog</span>
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Contact &amp; Support</span>
                          </Link>
                        </>
                      )}

                      {role === 'retailer' && (
                        <>
                          <Link
                            href="/retailer"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Retailer Dashboard</span>
                          </Link>
                          <Link
                            href="/retailer/products/new"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add New Product</span>
                          </Link>
                          <Link
                            href="/"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Customer Storefront</span>
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Platform Admin</span>
                          </Link>
                          <Link
                            href="/retailer/products"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <span>Manage All Products</span>
                          </Link>
                          <Link
                            href="/customer/products"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8FAFC] hover:text-[#047857] transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Customer View</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-1 mt-1 border-t border-[#F1F5F9]">
                      <button
                        id="dropdown-logout-button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-[#FEF2F2] transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Visitor / Logged-out Call to Actions */
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  id="nav-signin-link"
                  className="text-sm font-semibold text-[#475569] hover:text-[#111827] px-3.5 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  id="nav-getstarted-link"
                  className="rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-[#475569] hover:text-[#111827] hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          ref={mobileMenuRef}
          className="lg:hidden border-b border-[#E2E8F0] bg-white px-5 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Card for Authenticated Users on Mobile */}
          {user && !loading && (
            <div className="p-3 mb-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111827] truncate">{userName}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeClass}`}>
                {roleDisplayName}
              </span>
            </div>
          )}

          {/* Navigation Links List */}
          <div className="space-y-1">
            {currentNavLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={`mobile-nav-${link.label}-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#047857] bg-[#ECFDF5] font-semibold border border-[#A7F3D0]/70'
                      : 'text-[#475569] hover:text-[#059669] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] mt-4">
            {!loading && (
              <>
                {user ? (
                  <button
                    id="mobile-logout-button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/login"
                      id="mobile-signin-link"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2.5 text-sm font-semibold rounded-xl text-[#475569] hover:text-[#111827] border border-[#CBD5E1] bg-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      id="mobile-getstarted-link"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2.5 text-sm font-semibold rounded-xl bg-[#10B981] hover:bg-[#059669] text-white shadow-sm transition-colors"
                    >
                      Get Started
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
