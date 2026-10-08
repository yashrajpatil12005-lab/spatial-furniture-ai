'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import ProductForm from '@/components/products/ProductForm';
import { useEffect, useState, use } from 'react';
import { getProduct } from '@/lib/products';
import { Product } from '@/lib/types';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
          <p className="mt-1 text-sm text-neutral-500">Modify your existing furniture product.</p>
        </div>
        
        {loading && <p>Loading product...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && product && <ProductForm initialData={product} />}
      </div>
    </ProtectedRoute>
  );
}
