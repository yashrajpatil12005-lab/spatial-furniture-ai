'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import ProductForm from '@/components/products/ProductForm';
import { useEffect, useState, use } from 'react';
import { getProduct } from '@/lib/products';
import { Product } from '@/lib/types';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(resolvedParams.id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [resolvedParams.id]);

  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-[#E2E8F0]">
            <Link href="/retailer/products" className="text-xs font-semibold text-[#047857] hover:text-[#059669] flex items-center gap-1 mb-2 transition-colors">
              <span>&larr;</span>
              <span>Back to Products</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Edit <span className="text-[#10B981]">Product</span>
            </h1>
            <p className="mt-1 text-xs text-[#64748B]">
              Modify inventory quantity, physical dimensions, or media attributes.
            </p>
          </div>
          
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] font-medium">
              {error}
            </div>
          )}
          {!loading && !error && product && <ProductForm initialData={product} />}
        </div>
      </div>
    </ProtectedRoute>
  );
}
