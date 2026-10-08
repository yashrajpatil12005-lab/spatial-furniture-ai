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
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Product & Catalog Health</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time breakdown of current catalog inventory statuses and category spread
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-400">Total catalog:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            {total} items
          </span>
        </div>
      </div>

      {/* Stock Health Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-medium">
          <span>Inventory Status Ratio</span>
          <span>{inStockPct}% Optimal</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${inStockPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`In Stock: ${inStock} (${inStockPct}%)`}
          />
          <div
            style={{ width: `${lowStockPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Low Stock: ${lowStock} (${lowStockPct}%)`}
          />
          <div
            style={{ width: `${outOfStockPct}%` }}
            className="bg-red-500 transition-all duration-500"
            title={`Out of Stock: ${outOfStock} (${outOfStockPct}%)`}
          />
        </div>
      </div>

      {/* Health Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-slate-300">In Stock (&gt;5)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{inStock}</div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            {inStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-medium text-slate-300">Low Stock (1–5)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{lowStock}</div>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            {lowStockPct}%
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-xs font-medium text-slate-300">Out of Stock (0)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{outOfStock}</div>
          </div>
          <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
            {outOfStockPct}%
          </span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Category Distribution
        </h3>
        {categories.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No category data available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-lg bg-slate-800/30 border border-slate-800 flex justify-between items-center"
              >
                <span className="text-sm font-medium text-slate-300 truncate max-w-[120px]">
                  {c.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">{c.count} items</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {c.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
