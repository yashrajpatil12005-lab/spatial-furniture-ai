'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/currency';
import { useState } from 'react';

interface AdminRecentProductsProps {
  products: Product[];
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[#27272A] flex items-center justify-center text-[#71717A] flex-shrink-0">
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
      className="w-10 h-10 rounded-lg object-cover bg-[#0A0A0A] border border-[#27272A] flex-shrink-0"
    />
  );
}

export default function AdminRecentProducts({ products }: AdminRecentProductsProps) {
  // Sort by createdAt descending, slice top 5
  const recentProducts = [...products]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusBadge = (stock: number) => {
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
          Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        Healthy ({stock})
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-[#141414] border border-[#27272A] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5]">Recent Products</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Latest 5 inventory additions ordered by creation date
          </p>
        </div>
        <Link
          href="/retailer/products"
          className="text-xs font-semibold text-[#10B981] hover:underline transition-colors"
        >
          View all catalog &rarr;
        </Link>
      </div>

      {recentProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-[#71717A]">No products recorded in Firestore.</p>
          <Link
            href="/retailer/products/new"
            className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669]"
          >
            + Add First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-[#F5F5F5]">
            <thead className="text-[10px] uppercase bg-[#181818] text-[#A1A1AA] border-b border-[#27272A]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#181818]/70 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <ProductThumbnail src={p.imageUrl} alt={p.name} />
                    <div>
                      <div className="font-semibold text-[#F5F5F5]">{p.name}</div>
                      <div className="text-[11px] text-[#71717A]">{p.brand || 'No Brand'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] bg-[#181818] px-2 py-0.5 rounded border border-[#27272A] text-[#A1A1AA]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold text-[#F5F5F5]">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[#A1A1AA]">
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(p.stock)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.id && (
                      <Link
                        href={`/retailer/products/${p.id}/edit`}
                        className="text-xs font-semibold text-[#10B981] hover:underline transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
