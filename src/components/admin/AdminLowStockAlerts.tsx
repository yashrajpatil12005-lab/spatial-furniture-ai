'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';

interface AdminLowStockAlertsProps {
  products: Product[];
}

export default function AdminLowStockAlerts({ products }: AdminLowStockAlertsProps) {
  // Low stock threshold <= 5
  const lowStockItems = products.filter((p) => (p.stock ?? 0) <= 5);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {lowStockItems.length > 0 ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Low Stock Inventory Alerts</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated threshold alerts for replenishment (Stock &le; 5 units)
            </p>
          </div>
        </div>
        {lowStockItems.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {lowStockItems.length} requiring attention
          </span>
        )}
      </div>

      <div className="mt-4">
        {lowStockItems.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-sm font-medium text-emerald-400">
              All products have healthy stock levels. No replenishments required at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-mono text-xs font-bold ${
                      item.stock === 0
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.stock}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">
                      Category: {item.category} &bull; Price: ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      item.stock === 0
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.stock === 0 ? 'Out of stock' : `${item.stock} units remaining`}
                  </span>
                  {item.id && (
                    <Link
                      href={`/retailer/products/${item.id}/edit`}
                      className="inline-flex items-center rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white px-3 py-1.5 border border-slate-700 transition-colors"
                    >
                      Update Stock &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
