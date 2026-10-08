'use client';

import { Product } from '@/lib/types';

interface AdminOverviewProps {
  products: Product[];
}

export default function AdminOverview({ products }: AdminOverviewProps) {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 5).length;
  const uniqueCategoriesCount = new Set(
    products.map((p) => p.category).filter(Boolean)
  ).size;

  const cards = [
    {
      title: 'Total Products',
      value: totalProducts,
      subtitle: `${uniqueCategoriesCount} active categories`,
      accent: 'emerald',
      icon: (
        <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Total Stock',
      value: totalStock,
      subtitle: 'Inventory units recorded',
      accent: 'emerald',
      icon: (
        <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Low Stock Products',
      value: lowStockCount,
      subtitle: 'Items with stock ≤ 5',
      accent: lowStockCount > 0 ? 'amber' : 'emerald',
      icon: (
        <svg className={`w-5 h-5 ${lowStockCount > 0 ? 'text-amber-400' : 'text-[#10B981]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'Product Categories',
      value: uniqueCategoriesCount,
      subtitle: 'Distinct classifications',
      accent: 'emerald',
      icon: (
        <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-xl bg-[#141414] border border-[#27272A] p-6 shadow-sm hover:border-[#10B981]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              {card.title}
            </span>
            <div className="p-2 rounded-lg bg-[#181818] border border-[#27272A]">
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${card.accent === 'amber' ? 'text-amber-400' : 'text-white'}`}>
              {card.value}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#71717A]">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
