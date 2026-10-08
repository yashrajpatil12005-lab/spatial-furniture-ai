'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

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
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.style.toLowerCase().includes(q)
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
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'relevance':
        default:
          return 0; // Maintain natural/default order
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

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Search</h3>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
          />
        </div>

        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Category</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setCategoryFilter('All')}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${categoryFilter === 'All' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              All Categories
            </button>
            {PRODUCT_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${categoryFilter === cat ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Price Range</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <span className="text-neutral-500">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Availability</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                name="availability"
                checked={availability === 'all'}
                onChange={() => setAvailability('all')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">All Products</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                name="availability"
                checked={availability === 'instock'}
                onChange={() => setAvailability('instock')}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">In Stock Only</span>
            </label>
          </div>
        </div>

        <button 
          onClick={clearFilters}
          className="w-full py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <p className="text-sm text-neutral-600 font-medium">
            {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
          </p>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm text-neutral-600 whitespace-nowrap">Sort by:</label>
            <select 
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm focus:border-emerald-500 focus:ring-emerald-500 border shadow-sm"
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
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl">
            <p className="text-neutral-500 mb-4">No products match your current filters.</p>
            <button 
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative border border-neutral-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-neutral-200 lg:aspect-none group-hover:opacity-75 lg:h-64 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover object-center lg:h-full lg:w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-neutral-100">
                      <span className="text-neutral-400">No Image</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm text-neutral-900 font-bold mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-500">{product.brand}</p>
                      <p className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">{product.category}</p>
                    </div>
                    <p className="mt-2 text-xs text-neutral-400">Dim: {product.width}x{product.height}x{product.depth} cm</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <p className="text-lg font-bold text-emerald-600">${product.price.toFixed(2)}</p>
                    <a href={`/customer/products/${product.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View Details</a>
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
