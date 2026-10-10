'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { getRetailerProducts, deleteProduct } from '@/lib/products';
import ProductTable from '@/components/products/ProductTable';
import Link from 'next/link';

export default function RetailerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [authLoading, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getRetailerProducts(user!.uid);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching retailer products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product. Please check console.');
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
                <Link href="/retailer" className="text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors">&larr; Dashboard</Link>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] mt-1 sm:text-4xl">
                Catalog <span className="text-[#10B981]">Products</span>
              </h1>
              <p className="mt-1 text-sm text-[#475569]">
                Manage inventory counts, pricing, and 3D asset metadata.
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
