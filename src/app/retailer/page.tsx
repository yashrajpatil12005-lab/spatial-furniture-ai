'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import Link from 'next/link';
import { seedDemoProducts } from '@/lib/products/seed';
import { useState, useEffect } from 'react';
import { getRetailerProducts } from '@/lib/products';
import { Product } from '@/lib/types';

export default function RetailerDashboard() {
  const { userData, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getRetailerProducts(user.uid).then(setProducts).catch(console.error);
    }
  }, [user]);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-neutral-100">
            <dt className="truncate text-sm font-medium text-neutral-500">Total Products</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">{totalProducts}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-neutral-100">
            <dt className="truncate text-sm font-medium text-neutral-500">Total Stock Items</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">{totalStock}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-neutral-100">
            <dt className="truncate text-sm font-medium text-neutral-500">Low Stock Alerts</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">{lowStock}</dd>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/retailer/products" className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
            Manage Products
          </Link>
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50"
          >
            {loading ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
