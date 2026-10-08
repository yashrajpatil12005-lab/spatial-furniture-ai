'use client';

import { Product } from '@/lib/types';

interface AdminCatalogHealthProps {
  products: Product[];
}

export default function AdminCatalogHealth({ products }: AdminCatalogHealthProps) {
  const total = products.length;
  const inStock = products.filter((p) => (p.stock ?? 0) > 5).length;
  const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;

  const inStockPct = total > 0 ? Math.round((inStock / total) * 100) : 0;
  const lowStockPct = total > 0 ? Math.round((lowStock / total) * 100) : 0;
  const outOfStockPct = total > 0 ? Math.round((outOfStock / total) * 100) : 0;

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Product &amp; Catalog Health</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Inventory stock status distribution and category balance
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs text-[#64748B]">Catalog:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#111827] border border-[#E2E8F0]">
            {total} items
          </span>
        </div>
      </div>

      {/* Stock Health Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs text-[#475569] mb-2 font-medium">
          <span>Inventory Ratio Breakdown</span>
          <span className="text-[#047857] font-bold">{inStockPct}% Optimal</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 border border-[#E2E8F0] flex overflow-hidden">
          <div
            style={{ width: `${inStockPct}%` }}
            className="bg-[#10B981] transition-all duration-500"
            title={`In Stock: ${inStock} (${inStockPct}%)`}
          />
          <div
            style={{ width: `${lowStockPct}%` }}
            className="bg-[#F59E0B] transition-all duration-500"
            title={`Low Stock: ${lowStock} (${lowStockPct}%)`}
          />
          <div
            style={{ width: `${outOfStockPct}%` }}
            className="bg-[#EF4444] transition-all duration-500"
            title={`Out of Stock: ${outOfStock} (${outOfStockPct}%)`}
          />
        </div>
      </div>

      {/* Health Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
              <span className="text-xs font-semibold text-[#475569]">Optimal (&gt;5)</span>
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-2">{inStock}</div>
          </div>
          <span className="text-xs font-mono font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
            {inStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span className="text-xs font-semibold text-[#475569]">Low Stock (1–5)</span>
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-2">{lowStock}</div>
          </div>
          <span className="text-xs font-mono font-bold text-[#B45309] bg-[#FFFBEB] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
            {lowStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
              <span className="text-xs font-semibold text-[#475569]">Out of Stock (0)</span>
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-2">{outOfStock}</div>
          </div>
          <span className="text-xs font-mono font-bold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1 rounded-lg border border-[#FECACA]">
            {outOfStockPct}%
          </span>
        </div>
      </div>

      {/* Category Distribution with Visual Progress Indicators */}
      <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-4">
          Category Distribution
        </h3>
        {categories.length === 0 ? (
          <p className="text-xs text-[#64748B] italic">No category data recorded</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div
                key={c.name}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827] truncate max-w-[120px]">
                    {c.name}
                  </span>
                  <span className="font-bold text-[#047857]">{c.count} items</span>
                </div>
                {/* Visual Progress Indicator */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    style={{ width: `${Math.max(c.pct, 4)}%` }} 
                    className="h-full bg-[#10B981] rounded-full" 
                  />
                </div>
                <div className="text-[10px] text-[#64748B] text-right font-medium">
                  {c.pct}% of catalog
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
