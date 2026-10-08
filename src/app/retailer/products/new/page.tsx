'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import ProductForm from '@/components/products/ProductForm';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer', 'admin']}>
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-[#27272A]">
            <Link href="/retailer/products" className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] flex items-center gap-1 mb-2">
              <span>&larr;</span>
              <span>Back to Products</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
              Add New <span className="text-[#10B981]">Product</span>
            </h1>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Create a new furniture product in your catalog with dimensions and spatial parameters.
            </p>
          </div>
          
          <ProductForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
