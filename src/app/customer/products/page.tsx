'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import CustomerProductDiscovery from '@/components/products/CustomerProductDiscovery';
import RecommendationPanel from '@/components/ai/RecommendationPanel';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all products ONCE on mount for performance requirement
    // Filtering will be handled locally in CustomerProductDiscovery
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'retailer', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Explore Furniture</h1>
          <p className="mt-2 text-sm text-neutral-500">Discover premium furniture for your space.</p>
        </div>

        <RecommendationPanel />

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <CustomerProductDiscovery initialProducts={products} />
        )}
      </div>
    </ProtectedRoute>
  );
}
