'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import { getProducts } from '@/lib/products';
import { Product } from '@/lib/types';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminCatalogHealth from '@/components/admin/AdminCatalogHealth';
import AdminIntegrationStatus from '@/components/admin/AdminIntegrationStatus';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import AdminRecentProducts from '@/components/admin/AdminRecentProducts';
import AdminLowStockAlerts from '@/components/admin/AdminLowStockAlerts';
import AdminProfile from '@/components/admin/AdminProfile';

interface IntegrationsState {
  firebase: string;
  firestore: string;
  gemini: string;
  spatialComputing: string;
}

export default function AdminPage() {
  const { userData, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // 1. Fetch real product data from Firestore
      const productsData = await getProducts();
      setProducts(productsData || []);

      // 2. Fetch server-side integration configuration status
      try {
        const res = await fetch('/api/admin/integrations');
        if (res.ok) {
          const intData = await res.json();
          setIntegrations(intData);
        } else {
          setIntegrations({
            firebase: 'Configured',
            firestore: 'Connected',
            gemini: 'Not configured',
            spatialComputing: 'In Development',
          });
        }
      } catch (intErr) {
        console.warn('Could not fetch integration indicators:', intErr);
        setIntegrations({
          firebase: 'Configured',
          firestore: 'Connected',
          gemini: 'Not configured',
          spatialComputing: 'In Development',
        });
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err?.message || 'Failed to load platform data from Firestore.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
                  System <span className="text-[#10B981]">Admin</span>
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] uppercase tracking-wide">
                  {userData?.role || 'admin'}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#475569]">
                Monitor and manage the Spatial Furniture AI platform.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-medium text-[#64748B]">Logged in as</p>
                <p className="text-xs font-semibold text-[#111827]">
                  {userData?.name || user?.displayName || 'Admin'}
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#111827] px-4 py-2.5 border border-[#E2E8F0] shadow-sm transition-all disabled:opacity-50"
                title="Refresh platform data"
              >
                <svg
                  className={`w-3.5 h-3.5 text-[#10B981] ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">{error}</span>
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs font-semibold underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white border border-[#E2E8F0] animate-pulse card-shadow" />
                ))}
              </div>
              <div className="h-64 rounded-2xl bg-white border border-[#E2E8F0] animate-pulse card-shadow" />
              <div className="h-64 rounded-2xl bg-white border border-[#E2E8F0] animate-pulse card-shadow" />
            </div>
          ) : (
            <>
              {/* PLATFORM OVERVIEW CARDS */}
              <AdminOverview products={products} />

              {/* QUICK ACTIONS */}
              <AdminQuickActions />

              {/* LOW STOCK WARNING ALERTS */}
              <AdminLowStockAlerts products={products} />

              {/* PRODUCT / CATALOG HEALTH & CATEGORY DISTRIBUTION */}
              <AdminCatalogHealth products={products} />

              {/* RECENT PRODUCTS (LATEST 5) */}
              <AdminRecentProducts products={products} />

              {/* SYSTEM INTEGRATIONS STATUS */}
              <AdminIntegrationStatus status={integrations} loading={loading} />

              {/* ADMIN PROFILE & CREDENTIALS */}
              <AdminProfile />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
