'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';
import { seedDemoProducts } from '@/lib/products/seed';
import { useState, useEffect } from 'react';
import { getRetailerProducts } from '@/lib/products';
import { Product } from '@/lib/types';

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getRetailerProducts(user.uid).then(setProducts).catch(console.error);
    }
  }, [user]);

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
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] sm:text-4xl">
                Retailer <span className="text-[#10B981]">Dashboard</span>
              </h1>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Manage catalog inventory, monitor stock thresholds, and prepare 3D spatial models.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/retailer/products/new" 
                className="inline-flex items-center rounded-lg bg-[#10B981] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition-colors"
              >
                + Add Product
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-[#141414] p-6 border border-[#27272A] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Total Products
                </span>
                <span className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold tracking-tight text-white">{totalProducts}</div>
              <p className="mt-1 text-xs text-[#71717A]">Active catalog entries</p>
            </div>

            <div className="rounded-xl bg-[#141414] p-6 border border-[#27272A] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Total Stock Items
                </span>
                <span className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold tracking-tight text-white">{totalStock}</div>
              <p className="mt-1 text-xs text-[#71717A]">Units across all variations</p>
            </div>

            <div className="rounded-xl bg-[#141414] p-6 border border-[#27272A] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Low Stock Alerts
                </span>
                <span className={`p-1.5 rounded-lg ${lowStock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-[#10B981]/10 text-[#10B981]'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <div className={`mt-4 text-3xl font-bold tracking-tight ${lowStock > 0 ? 'text-amber-400' : 'text-white'}`}>
                {lowStock}
              </div>
              <p className="mt-1 text-xs text-[#71717A]">Items with stock &le; 5 units</p>
            </div>
          </div>

          {/* Quick Nav / Actions */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/retailer/products" 
              className="inline-flex items-center rounded-lg bg-[#10B981] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition-colors"
            >
              Manage Catalog Products &rarr;
            </Link>
            <button 
              onClick={handleSeed}
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-[#141414] hover:bg-[#181818] border border-[#27272A] hover:border-slate-600 px-4 py-2.5 text-xs font-semibold text-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              {loading ? 'Seeding demo catalog...' : 'Seed Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
