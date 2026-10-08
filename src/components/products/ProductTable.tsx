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
      <div className="h-10 w-10 rounded-lg bg-[#0A0A0A] border border-[#27272A] flex items-center justify-center text-[#71717A] text-[10px] flex-shrink-0">
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
      className="h-10 w-10 rounded-lg object-cover bg-[#0A0A0A] border border-[#27272A] flex-shrink-0"
    />
  );
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-[#141414] rounded-xl border border-[#27272A] p-6">
        <svg className="w-10 h-10 text-[#71717A] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm font-semibold text-[#F5F5F5]">No products in your catalog yet</p>
        <p className="text-xs text-[#71717A] mt-1">Add your first furniture item to start managing inventory.</p>
        <Link
          href="/retailer/products/new"
          className="mt-4 inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669] transition-colors"
        >
          + Add New Product
        </Link>
      </div>
    );
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20">
          Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        In Stock ({stock})
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#141414] shadow-sm">
      <table className="w-full text-left text-xs text-[#F5F5F5] divide-y divide-[#27272A]">
        <thead className="bg-[#181818] text-[#A1A1AA] uppercase tracking-wider text-[10px]">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6 font-semibold">Product</th>
            <th scope="col" className="px-3 py-3.5 font-semibold">Category</th>
            <th scope="col" className="px-3 py-3.5 font-semibold">Price</th>
            <th scope="col" className="px-3 py-3.5 font-semibold">Stock</th>
            <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-6 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#27272A]">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-[#181818]/70 transition-colors">
              <td className="py-3 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center gap-3">
                  <ProductThumbnail src={product.imageUrl} alt={product.name} />
                  <div>
                    <div className="font-semibold text-[#F5F5F5] text-xs">{product.name}</div>
                    <div className="text-[11px] text-[#71717A]">{product.brand || 'No brand'}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <span className="inline-flex items-center rounded-md bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10B981] border border-[#10B981]/20">
                  {product.category}
                </span>
              </td>
              <td className="px-3 py-3 whitespace-nowrap font-mono font-semibold text-[#F5F5F5]">
                {formatPrice(product.price)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {getStockBadge(product.stock)}
              </td>
              <td className="py-3 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap space-x-3">
                <Link
                  href={`/retailer/products/${product.id}/edit`}
                  className="text-xs font-semibold text-[#10B981] hover:underline"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                      onDelete(product.id!);
                    }
                  }} 
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
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
