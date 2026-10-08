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
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching customer products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'retailer', 'admin']}>
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-[#27272A]">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] sm:text-4xl">
              Explore <span className="text-[#10B981]">Furniture</span>
            </h1>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Discover premium spatial furniture designed for real-world environments.
            </p>
          </div>

          {/* AI Recommendation Engine */}
          <RecommendationPanel />

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
    </ProtectedRoute>
  );
}
