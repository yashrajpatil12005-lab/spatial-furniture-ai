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
        <span className="text-[11px] font-semibold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#FECACA]">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#FDE68A]">
          Only {stock} left
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
        In Stock
      </span>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] card-shadow space-y-6">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Search Products
            </label>
            <input 
              type="text" 
              placeholder="Sofa, wood, Scandinavian..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
            />
          </div>

          {/* Category Pill Filters */}
          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2.5">
              Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => setCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === 'All' 
                    ? 'bg-[#10B981] text-white font-semibold shadow-sm' 
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                All
              </button>
              {PRODUCT_CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    categoryFilter === cat 
                      ? 'bg-[#10B981] text-white font-semibold shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Price Range (₹)
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <span className="text-[#94A3B8] font-medium">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2.5">
              Stock Availability
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#475569] hover:text-[#111827]">
                <input 
                  type="radio" 
                  name="availability"
                  checked={availability === 'all'}
                  onChange={() => setAvailability('all')}
                  className="h-4 w-4 text-[#10B981] focus:ring-[#10B981] border-[#CBD5E1]"
                />
                <span>All Catalog Items</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#475569] hover:text-[#111827]">
                <input 
                  type="radio" 
                  name="availability"
                  checked={availability === 'instock'}
                  onChange={() => setAvailability('instock')}
                  className="h-4 w-4 text-[#10B981] focus:ring-[#10B981] border-[#CBD5E1]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Reset Filters */}
          <button 
            onClick={clearFilters}
            className="w-full py-2.5 px-3 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#475569] hover:text-[#111827] bg-[#F8FAFC] hover:bg-slate-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <p className="text-sm text-[#475569]">
            Showing <strong className="text-[#111827] font-semibold">{filteredProducts.length}</strong> product{filteredProducts.length === 1 ? '' : 's'}
          </p>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-xs font-semibold text-[#475569] whitespace-nowrap">Sort by:</label>
            <select 
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl bg-white border border-[#CBD5E1] py-1.5 pl-3 pr-8 text-xs font-medium text-[#111827] focus:outline-none focus:border-[#10B981] shadow-sm"
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
          <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl p-8 card-shadow">
            <svg className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-[#111827] font-semibold text-base mb-1">No products match your criteria</p>
            <p className="text-[#64748B] text-xs mb-5">Try relaxing your price filters or searching for different terms.</p>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669] transition-colors"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white border border-[#E2E8F0] hover:border-[#10B981] rounded-2xl overflow-hidden transition-all duration-200 flex flex-col card-shadow card-shadow-hover"
              >
                {/* Product Image Container */}
                <div className="w-full bg-[#F1F5F9] h-56 relative overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="text-[#94A3B8] text-xs font-medium">
                      No Image Available
                    </div>
                  )}
                  
                  {/* Stock Tag on Top-Right */}
                  <div className="absolute top-3 right-3">
                    {getStockBadge(product.stock)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
                        {product.brand || 'Designer Brand'}
                      </span>
                      <span className="text-[11px] bg-[#F1F5F9] text-[#475569] px-2.5 py-0.5 rounded-full font-medium">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#111827] group-hover:text-[#047857] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {product.width} &times; {product.height} &times; {product.depth} cm &bull; {product.material}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Price</span>
                      <span className="text-xl font-extrabold text-[#111827]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/customer/products/${product.id}`}
                      className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#10B981] hover:text-white text-[#111827] border border-[#E2E8F0] hover:border-transparent text-xs font-semibold transition-all shadow-sm"
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
