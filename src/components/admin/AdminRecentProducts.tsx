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
      <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] flex-shrink-0">
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
      className="w-10 h-10 rounded-lg object-cover bg-[#F1F5F9] border border-[#E2E8F0] flex-shrink-0"
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA]">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A]">
          Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0]">
        Healthy ({stock})
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Recent Products</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Latest 5 inventory additions ordered by creation date
          </p>
        </div>
        <Link
          href="/retailer/products"
          className="text-xs font-semibold text-[#047857] hover:text-[#059669] hover:underline transition-colors"
        >
          View all catalog &rarr;
        </Link>
      </div>

      {recentProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-[#64748B]">No products recorded in Firestore.</p>
          <Link
            href="/retailer/products/new"
            className="mt-3 inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669] shadow-sm transition-all"
          >
            + Add First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4 rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="text-[10px] uppercase bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
              <tr>
                <th scope="col" className="px-4 py-3">Product</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Price</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <ProductThumbnail src={p.imageUrl} alt={p.name} />
                    <div>
                      <div className="font-semibold text-[#111827]">{p.name}</div>
                      <div className="text-[11px] text-[#64748B]">{p.brand || 'No Brand'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] font-medium bg-[#F1F5F9] px-2.5 py-0.5 rounded-full border border-[#E2E8F0] text-[#475569]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-[#111827]">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-[#475569]">
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(p.stock)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.id && (
                      <Link
                        href={`/retailer/products/${p.id}/edit`}
                        className="text-xs font-semibold text-[#047857] hover:text-[#059669] hover:underline transition-colors"
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
