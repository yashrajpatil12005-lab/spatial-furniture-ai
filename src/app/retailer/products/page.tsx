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
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product. Please check console.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-neutral-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Products
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Manage your furniture catalog and inventory.</p>
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <Link href="/retailer/products/new" className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
              Add Product
            </Link>
          </div>
        </div>

        <div className="mb-6 max-w-md">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
          />
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <ProductTable products={filteredProducts} onDelete={handleDelete} />
        )}
      </div>
    </ProtectedRoute>
  );
}
