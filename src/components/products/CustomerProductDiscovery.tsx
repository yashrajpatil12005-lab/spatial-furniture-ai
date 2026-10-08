'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils/currency';

interface CustomerProductDiscoveryProps {
  initialProducts: Product[];
}

export default function CustomerProductDiscovery({ initialProducts }: CustomerProductDiscoveryProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [availability, setAvailability] = useState<'all' | 'instock'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('relevance');

  // Derived filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Search (Name, Brand, Category, Material, Color, Style)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.color || '').toLowerCase().includes(q) ||
        (p.style || '').toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 3. Price Range
    if (minPrice !== '') {
      result = result.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    // 4. Availability
    if (availability === 'instock') {
      result = result.filter(p => p.stock > 0);
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'relevance':
        default:
          return 0;
      }
    });

    return result;
  }, [initialProducts, searchTerm, categoryFilter, minPrice, maxPrice, availability, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSortBy('relevance');
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Only {stock} left
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
        In Stock
      </span>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-[#141414] p-5 rounded-xl border border-[#27272A] space-y-5">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
              Search
            </label>
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3 py-2 text-sm text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1">
              <button 
                onClick={() => setCategoryFilter('All')}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  categoryFilter === 'All' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-semibold' 
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818]'
                }`}
              >
                All Categories
              </button>
              {PRODUCT_CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    categoryFilter === cat 
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-semibold' 
                      : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
              Price Range (₹)
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-2.5 py-1.5 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <span className="text-[#71717A]">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-2.5 py-1.5 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
              Availability
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-[#A1A1AA] hover:text-[#F5F5F5]">
                <input 
                  type="radio" 
                  name="availability"
                  checked={availability === 'all'}
                  onChange={() => setAvailability('all')}
                  className="h-3.5 w-3.5 text-[#10B981] focus:ring-[#10B981] bg-[#0A0A0A] border-[#27272A]"
                />
                <span>All Products</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-[#A1A1AA] hover:text-[#F5F5F5]">
                <input 
                  type="radio" 
                  name="availability"
                  checked={availability === 'instock'}
                  onChange={() => setAvailability('instock')}
                  className="h-3.5 w-3.5 text-[#10B981] focus:ring-[#10B981] bg-[#0A0A0A] border-[#27272A]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <button 
            onClick={clearFilters}
            className="w-full py-2 px-3 border border-[#27272A] rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#181818] hover:bg-[#202020] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <p className="text-xs text-[#A1A1AA]">
            Showing <span className="font-semibold text-[#F5F5F5]">{filteredProducts.length}</span> product{filteredProducts.length === 1 ? '' : 's'}
          </p>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-xs text-[#A1A1AA] whitespace-nowrap">Sort by:</label>
            <select 
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg bg-[#141414] border border-[#27272A] py-1.5 pl-3 pr-8 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981]"
            >
              <option value="relevance">Relevance / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] border border-[#27272A] rounded-xl p-8">
            <svg className="w-12 h-12 text-[#71717A] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-[#A1A1AA] text-sm mb-4">No products match your selected filters.</p>
            <button 
              onClick={clearFilters}
              className="text-[#10B981] hover:underline font-semibold text-xs"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-[#141414] border border-[#27272A] hover:border-[#10B981]/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Image Banner */}
                <div className="aspect-h-3 aspect-w-4 w-full overflow-hidden bg-[#0A0A0A] h-52 relative border-b border-[#27272A]">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#71717A] text-xs">
                      No Image Available
                    </div>
                  )}
                  
                  {/* Stock Tag on Top-Right */}
                  <div className="absolute top-2.5 right-2.5">
                    {getStockBadge(product.stock)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#10B981]">
                        {product.brand || 'Designer Brand'}
                      </span>
                      <span className="text-[10px] bg-[#181818] border border-[#27272A] text-[#A1A1AA] px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F5F5F5] group-hover:text-[#10B981] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#71717A]">
                      {product.width} &times; {product.height} &times; {product.depth} cm &bull; {product.material}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#71717A] block">Price</span>
                      <span className="text-base font-bold text-[#F5F5F5]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/customer/products/${product.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#10B981] hover:text-white text-[#10B981] border border-[#27272A] hover:border-transparent text-xs font-semibold transition-all"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
