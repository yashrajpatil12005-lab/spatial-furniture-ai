'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/currency';

interface AdminLowStockAlertsProps {
  products: Product[];
}

export default function AdminLowStockAlerts({ products }: AdminLowStockAlertsProps) {
  // Low stock threshold <= 5
  const lowStockItems = products.filter((p) => (p.stock ?? 0) <= 5);

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${lowStockItems.length > 0 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
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
            <h2 className="text-base font-bold text-[#111827]">Low Stock Inventory Alerts</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Automated threshold alerts for replenishment (Stock &le; 5 units)
            </p>
          </div>
        </div>
        {lowStockItems.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            {lowStockItems.length} requiring attention
          </span>
        )}
      </div>

      <div className="mt-4">
        {lowStockItems.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <p className="text-xs font-semibold text-[#047857]">
              All products have healthy stock levels. No replenishments required at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#FFFBEB]/50 border border-[#FDE68A] hover:bg-[#FFFBEB]/80 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono text-xs font-bold ${
                      item.stock === 0
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                        : 'bg-white text-[#B45309] border border-[#FDE68A] shadow-xs'
                    }`}
                  >
                    {item.stock}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#111827]">{item.name}</h3>
                    <p className="text-[11px] text-[#64748B]">
                      {item.category} &bull; Price: {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      item.stock === 0
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                        : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                    }`}
                  >
                    {item.stock === 0 ? 'Out of stock' : `${item.stock} units remaining`}
                  </span>
                  {item.id && (
                    <Link
                      href={`/retailer/products/${item.id}/edit`}
                      className="inline-flex items-center rounded-xl bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#111827] px-3.5 py-1.5 border border-[#E2E8F0] shadow-sm transition-colors"
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
