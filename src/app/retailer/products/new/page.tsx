'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Add New Product</h1>
          <p className="mt-1 text-sm text-neutral-500">Create a new furniture product in your catalog.</p>
        </div>
        <ProductForm />
      </div>
    </ProtectedRoute>
  );
}
