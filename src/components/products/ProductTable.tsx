'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/currency';
import { useState } from 'react';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="h-10 w-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] text-[10px] flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-10 w-10 rounded-lg object-cover bg-[#F1F5F9] border border-[#E2E8F0] flex-shrink-0"
    />
  );
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0] p-8 card-shadow">
        <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm font-bold text-[#111827]">No products in your catalog yet</p>
        <p className="text-xs text-[#64748B] mt-1">Add your first furniture item to start managing inventory.</p>
        <Link
          href="/retailer/products/new"
          className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669] shadow-sm transition-all"
        >
          + Add New Product
        </Link>
      </div>
    );
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA]">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A]">
          Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0]">
        In Stock ({stock})
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white card-shadow">
      <table className="w-full text-left text-xs text-[#111827] divide-y divide-[#E2E8F0]">
        <thead className="bg-[#F8FAFC] text-[#475569] uppercase tracking-wider text-[10px] font-bold">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">Product</th>
            <th scope="col" className="px-3 py-3.5">Category</th>
            <th scope="col" className="px-3 py-3.5">Price</th>
            <th scope="col" className="px-3 py-3.5">Stock</th>
            <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
              <td className="py-3.5 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center gap-3">
                  <ProductThumbnail src={product.imageUrl} alt={product.name} />
                  <div>
                    <div className="font-semibold text-[#111827] text-xs">{product.name}</div>
                    <div className="text-[11px] text-[#64748B]">{product.brand || 'No brand'}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3.5 whitespace-nowrap">
                <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-medium text-[#047857] border border-[#A7F3D0]">
                  {product.category}
                </span>
              </td>
              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-[#111827]">
                {formatPrice(product.price)}
              </td>
              <td className="px-3 py-3.5 whitespace-nowrap">
                {getStockBadge(product.stock)}
              </td>
              <td className="py-3.5 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap space-x-3">
                <Link
                  href={`/retailer/products/${product.id}/edit`}
                  className="text-xs font-semibold text-[#047857] hover:text-[#059669] hover:underline"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                      onDelete(product.id!);
                    }
                  }} 
                  className="text-xs font-semibold text-[#EF4444] hover:text-[#DC2626] transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
