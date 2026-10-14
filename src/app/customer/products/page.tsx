'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import CustomerProductDiscovery from '@/components/products/CustomerProductDiscovery';
import RecommendationPanel from '@/components/ai/RecommendationPanel';

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-10 px-5 sm:px-8 lg:px-10">
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-[#E2E8F0]">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Explore <span className="text-[#10B981]">Furniture</span>
          </h1>
          <p className="mt-2 text-base text-[#475569]">
            Discover premium spatial furniture designed for real-world environments.
          </p>
        </div>

        {/* AI Recommendation Engine / Room Visualizer Guide */}
        <div id="room-visualizer" className="scroll-mt-20">
          <RecommendationPanel />
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
