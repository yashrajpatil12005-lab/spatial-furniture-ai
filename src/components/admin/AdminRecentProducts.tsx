'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';

interface AdminRecentProductsProps {
  products: Product[];
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        In Stock
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Products</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest 5 inventory additions ordered by creation date
          </p>
        </div>
        <Link
          href="/retailer/products"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {recentProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">No products found in Firestore.</p>
          <Link
            href="/retailer/products/new"
            className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Add first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">Product</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Price</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <ProductThumbnail src={p.imageUrl} alt={p.name} />
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand || 'No Brand'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-white">
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(p.stock)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.id && (
                      <Link
                        href={`/retailer/products/${p.id}/edit`}
                        className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
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
