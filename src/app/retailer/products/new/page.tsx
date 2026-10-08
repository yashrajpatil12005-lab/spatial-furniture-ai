'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import ProductForm from '@/components/products/ProductForm';
import Link from 'next/link';

export default function NewProductPage() {
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
              Add New <span className="text-[#10B981]">Product</span>
            </h1>
            <p className="mt-1 text-xs text-[#64748B]">
              Create a new furniture product in your catalog with dimensions and spatial parameters.
            </p>
          </div>
          
          <ProductForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
