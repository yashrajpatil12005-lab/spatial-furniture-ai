'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { getRetailerProducts, deleteProduct } from '@/lib/products';
import ProductTable from '@/components/products/ProductTable';
import Link from 'next/link';

export default function RetailerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

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
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/retailer" className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5]">&larr; Dashboard</Link>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] mt-1 sm:text-4xl">
                Catalog <span className="text-[#10B981]">Products</span>
              </h1>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Manage inventory counts, pricing, and 3D asset metadata.
              </p>
            </div>

            <div>
              <Link 
                href="/retailer/products/new" 
                className="inline-flex items-center rounded-lg bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
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
              className="block w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
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
