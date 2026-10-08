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
    <div className="rounded-xl bg-[#141414] border border-[#27272A] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5]">Product &amp; Catalog Health</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Inventory stock status distribution and category balance
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs text-[#71717A]">Catalog:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#181818] text-[#F5F5F5] border border-[#27272A]">
            {total} items
          </span>
        </div>
      </div>

      {/* Stock Health Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs text-[#A1A1AA] mb-2 font-medium">
          <span>Inventory Ratio Breakdown</span>
          <span className="text-[#10B981] font-semibold">{inStockPct}% Optimal</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[#0A0A0A] border border-[#27272A] flex overflow-hidden">
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
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#27272A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="text-xs font-medium text-[#A1A1AA]">Optimal (&gt;5)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{inStock}</div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20">
            {inStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#27272A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span className="text-xs font-medium text-[#A1A1AA]">Low Stock (1–5)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{lowStock}</div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded border border-[#F59E0B]/20">
            {lowStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#27272A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span className="text-xs font-medium text-[#A1A1AA]">Out of Stock (0)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{outOfStock}</div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#EF4444] bg-[#EF4444]/10 px-2 py-1 rounded border border-[#EF4444]/20">
            {outOfStockPct}%
          </span>
        </div>
      </div>

      {/* Category Distribution with Visual Progress Indicators */}
      <div className="mt-6 pt-5 border-t border-[#27272A]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-4">
          Category Distribution
        </h3>
        {categories.length === 0 ? (
          <p className="text-xs text-[#71717A] italic">No category data recorded</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div
                key={c.name}
                className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#27272A] flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F5F5F5] truncate max-w-[120px]">
                    {c.name}
                  </span>
                  <span className="font-mono text-[#10B981] font-semibold">{c.count} items</span>
                </div>
                {/* Visual Progress Indicator */}
                <div className="w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
                  <div 
                    style={{ width: `${Math.max(c.pct, 4)}%` }} 
                    className="h-full bg-[#10B981] rounded-full" 
                  />
                </div>
                <div className="text-[10px] text-[#71717A] text-right font-mono">
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
