'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';
import { seedDemoProducts } from '@/lib/products/seed';
import { useState, useEffect } from 'react';
import { getRetailerProducts } from '@/lib/products';
import { Product } from '@/lib/types';

export default function RetailerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      getRetailerProducts(user.uid).then(setProducts).catch(console.error);
    }
  }, [authLoading, user]);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) <= 5).length;

  const handleSeed = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await seedDemoProducts(user.uid);
      const data = await getRetailerProducts(user.uid);
      setProducts(data);
      alert('Demo products seeded successfully!');
    } catch (error) {
      alert('Error seeding products.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
                Retailer <span className="text-[#10B981]">Dashboard</span>
              </h1>
              <p className="mt-2 text-sm text-[#475569]">
                Manage catalog inventory, monitor stock thresholds, and prepare 3D spatial models.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/retailer/products/new" 
                className="inline-flex items-center rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition-all"
              >
                + Add Product
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Total Products
                </span>
                <span className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight text-[#111827]">{totalProducts}</div>
              <p className="mt-1 text-xs text-[#64748B]">Active catalog entries</p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Total Stock Items
                </span>
                <span className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight text-[#111827]">{totalStock}</div>
              <p className="mt-1 text-xs text-[#64748B]">Units across all variations</p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Low Stock Alerts
                </span>
                <span className={`p-2.5 rounded-xl border ${lowStock > 0 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <div className={`mt-4 text-3xl font-extrabold tracking-tight ${lowStock > 0 ? 'text-[#B45309]' : 'text-[#111827]'}`}>
                {lowStock}
              </div>
              <p className="mt-1 text-xs text-[#64748B]">Items with stock &le; 5 units</p>
            </div>
          </div>

          {/* Quick Nav / Actions */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/retailer/products" 
              className="inline-flex items-center rounded-xl bg-[#10B981] px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition-all"
            >
              Manage Catalog Products &rarr;
            </Link>
            <button 
              onClick={handleSeed}
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] px-5 py-3 text-xs font-semibold text-[#111827] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Seeding demo catalog...' : 'Seed Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
