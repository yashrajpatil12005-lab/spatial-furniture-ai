'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import CustomerProductDiscovery from '@/components/products/CustomerProductDiscovery';

export default function CustomerProductsPage() {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching customer products:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors gap-1.5"
          >
            <span>&larr;</span>
            <span>Back to Home</span>
          </Link>

          <nav className="flex items-center text-xs text-[#64748B] space-x-2 font-medium">
            <Link href="/" className="hover:text-[#111827] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">Furniture Catalog</span>
          </nav>
        </div>

        {/* Catalog Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Catalog Collection
              </span>
              <span className="text-xs font-medium text-[#64748B] hidden sm:inline">
                Real-world Dimensions &amp; Finishes
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Furniture <span className="text-[#10B981]">Catalog</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
              Explore designer furniture with multi-attribute search, dimension filtering, finish customization, and spatial compatibility analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <Link
              href="/customer/visualizer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-2.5 text-xs font-bold text-[#047857] transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Launch Room Visualizer</span>
            </Link>
          </div>
        </div>

        {/* Product Discovery & Catalog */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981]"></div>
          </div>
        ) : (
          <CustomerProductDiscovery initialProducts={products} />
        )}
      </div>
    </div>
  );
}
