'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { getProducts, getRetailerProducts, deleteProduct } from '@/lib/products';
import ProductTable from '@/components/products/ProductTable';
import Link from 'next/link';

export default function RetailerProductsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!user) return;
      try {
        setLoading(true);
        // Administrators can view all platform products; retailers view only their own inventory
        const data = isAdmin
          ? await getProducts()
          : await getRetailerProducts(user.uid);
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (isMounted) {
          setFeedback({ type: 'error', message: 'Failed to load products. Please refresh the page.' });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading && user) {
      loadProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, isAdmin]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setFeedback({ type: 'success', message: 'Product successfully removed from catalog.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      console.error('Failed to delete product', error);
      setFeedback({ type: 'error', message: 'Failed to delete product. Please verify permissions.' });
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={isAdmin ? '/admin' : '/retailer'}
                  className="text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors"
                >
                  &larr; {isAdmin ? 'Admin Overview' : 'Dashboard'}
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] mt-1 sm:text-4xl">
                {isAdmin ? 'All Platform' : 'Catalog'} <span className="text-[#10B981]">Products</span>
              </h1>
              <p className="mt-1 text-sm text-[#475569]">
                {isAdmin
                  ? 'Administrator overview of all inventory across all registered retailers.'
                  : 'Manage inventory counts, pricing, and 3D asset metadata.'}
              </p>
            </div>

            <div>
              <Link 
                href="/retailer/products/new" 
                className="inline-flex items-center rounded-xl bg-[#10B981] hover:bg-[#059669] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
              >
                + Add Product
              </Link>
            </div>
          </div>

          {/* Accessible Feedback Notice */}
          {feedback && (
            <div
              role="alert"
              className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-[#F0FDF4] border border-[#A7F3D0] text-[#065F46]'
                  : 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
              }`}
            >
              <span>{feedback.message}</span>
              <button
                onClick={() => setFeedback(null)}
                className="ml-4 font-bold text-sm"
                aria-label="Dismiss message"
              >
                &times;
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="max-w-md">
            <input 
              type="text" 
              placeholder="Search by product name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] shadow-sm transition-colors"
            />
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
            </div>
          ) : (
            <ProductTable products={filteredProducts} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
