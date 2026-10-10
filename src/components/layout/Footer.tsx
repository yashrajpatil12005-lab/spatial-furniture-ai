'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';

export default function Footer() {
  const { user, userData, loading } = useAuth();
  const role = userData?.role;

  return (
    <footer className="bg-white text-[#64748B] py-12 border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
                Spatial<span className="text-[#10B981]">AI</span>
              </span>
            </Link>
            <span className="text-xs text-[#94A3B8] pl-3 border-l border-[#E2E8F0] hidden sm:inline">
              AI Powered Furniture Visualization &amp; Sales Assistant
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#475569]">
            {loading ? (
              <span className="text-xs text-[#94A3B8]">Loading navigation...</span>
            ) : !user ? (
              <>
                <Link href="/customer/products" className="hover:text-[#059669] transition-colors">Explore Furniture</Link>
                <Link href="/#how-it-works" className="hover:text-[#059669] transition-colors">How It Works</Link>
                <Link href="/#for-retailers" className="hover:text-[#059669] transition-colors">For Retailers</Link>
                <Link href="/contact" className="hover:text-[#059669] transition-colors">Contact</Link>
              </>
            ) : role === 'retailer' ? (
              <>
                <Link href="/retailer" className="hover:text-[#059669] transition-colors">Retailer Overview</Link>
                <Link href="/retailer/products" className="hover:text-[#059669] transition-colors">Manage Products</Link>
                <Link href="/retailer/products/new" className="hover:text-[#059669] transition-colors">Add Product</Link>
                <Link href="/" className="hover:text-[#059669] transition-colors">Storefront</Link>
              </>
            ) : role === 'admin' ? (
              <>
                <Link href="/admin" className="hover:text-[#059669] transition-colors">Admin Overview</Link>
                <Link href="/retailer/products" className="hover:text-[#059669] transition-colors">Manage Products</Link>
                <Link href="/admin#platform-health" className="hover:text-[#059669] transition-colors">Platform Health</Link>
                <Link href="/" className="hover:text-[#059669] transition-colors">Public Site</Link>
              </>
            ) : (
              <>
                <Link href="/customer" className="hover:text-[#059669] transition-colors">Dashboard</Link>
                <Link href="/customer/products" className="hover:text-[#059669] transition-colors">Furniture Catalog</Link>
                <Link href="/customer/products#room-visualizer" className="hover:text-[#059669] transition-colors">Room Visualizer</Link>
                <Link href="/contact" className="hover:text-[#059669] transition-colors">Support</Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#64748B] border-t border-[#E2E8F0] pt-8">
          <p>The future of spatial furniture visualization and retail intelligence.</p>
          <p className="mt-2 md:mt-0">&copy; {new Date().getFullYear()} SpatialAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
