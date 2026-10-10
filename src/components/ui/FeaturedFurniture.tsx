'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import { formatPrice } from '@/lib/utils/currency';
import { useAuth } from '@/lib/firebase/AuthContext';
import { DEMO_PRODUCTS } from '@/lib/products/seed';

function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);

  const getStockBadge = (stock?: number) => {
    const qty = typeof stock === 'number' ? stock : 0;
    if (qty === 0) {
      return (
        <span className="text-[11px] font-semibold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#FECACA]">
          Out of Stock
        </span>
      );
    }
    if (qty <= 5) {
      return (
        <span className="text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#FDE68A]">
          Only {qty} left
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
    <div className="group bg-white border border-[#E2E8F0] hover:border-[#10B981] rounded-2xl overflow-hidden card-shadow card-shadow-hover flex flex-col h-full transition-all duration-200">
      {/* Product Image Container */}
      <div className="w-full bg-[#F1F5F9] aspect-[4/3] relative overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#94A3B8]">
            <svg className="w-10 h-10 mb-2 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-[#64748B]">{product.category || 'Furniture'}</span>
            <span className="text-[11px] text-[#94A3B8] mt-0.5">Image preview unavailable</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {getStockBadge(product.stock)}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
              {product.brand || 'Signature Series'}
            </span>
            <span className="text-[11px] bg-[#F1F5F9] text-[#475569] px-2.5 py-0.5 rounded-full font-medium">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-[#111827] group-hover:text-[#047857] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Dimensions / Material snippet */}
          {(product.width || product.height || product.depth) ? (
            <p className="mt-1 text-xs text-[#64748B]">
              {product.width} &times; {product.height} &times; {product.depth} cm
              {product.material ? ` • ${product.material}` : ''}
            </p>
          ) : product.material ? (
            <p className="mt-1 text-xs text-[#64748B]">{product.material}</p>
          ) : null}
        </div>

        {/* Bottom Price & Link */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#64748B] block">Price</span>
            <span className="text-lg font-extrabold text-[#111827]">
              {formatPrice(product.price)}
            </span>
          </div>

          <Link
            href={`/customer/products/${product.id}`}
            className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#10B981] hover:text-white text-[#111827] border border-[#E2E8F0] hover:border-transparent text-xs font-semibold transition-all shadow-sm"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedFurniture() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Wait for Firebase Authentication initialization to complete
    if (authLoading) {
      return;
    }

    // 2. Unauthenticated visitors: render showcase catalog safely without invoking protected Firestore APIs
    if (!user) {
      if (isMounted) {
        setProducts(DEMO_PRODUCTS.slice(0, 4));
        setLoading(false);
      }
      return;
    }

    // 3. Authenticated users: fetch live products from Firestore
    async function loadFeatured() {
      try {
        setLoading(true);
        setFetchError(false);
        const data = await getProducts();
        if (isMounted) {
          if (data && data.length > 0) {
            setProducts(data.slice(0, 4));
          } else {
            setProducts(DEMO_PRODUCTS.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        if (isMounted) {
          // Fall back to demo showcase items if Firestore error occurs
          setProducts(DEMO_PRODUCTS.slice(0, 4));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest uppercase text-[#047857]">
              Live Catalog
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Find furniture for your space
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#475569] max-w-2xl">
              Designer pieces engineered for true physical scale, custom finishes, and spatial visualization.
            </p>
          </div>

          <div>
            <Link
              href="/customer/products"
              className="inline-flex items-center text-sm font-semibold text-[#047857] hover:text-[#059669] transition-colors gap-1.5"
            >
              <span>View All Furniture</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden card-shadow p-4 space-y-4 animate-pulse">
                  <div className="w-full aspect-[4/3] bg-[#E2E8F0] rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3 bg-[#E2E8F0] rounded w-1/3" />
                    <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
                    <div className="h-3 bg-[#E2E8F0] rounded w-1/2" />
                  </div>
                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
                    <div className="h-5 bg-[#E2E8F0] rounded w-1/3" />
                    <div className="h-8 bg-[#E2E8F0] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && fetchError && (
            <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center max-w-xl mx-auto card-shadow">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Catalog Connection Notice</h3>
              <p className="mt-1 text-xs text-[#64748B]">
                Live catalog is currently synchronizing with the database. You can still explore the full catalog directly.
              </p>
              <div className="mt-5">
                <Link
                  href="/customer/products"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  Explore Customer Catalog &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !fetchError && products.length === 0 && (
            <div className="p-8 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl text-center max-w-xl mx-auto">
              <svg className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-sm font-bold text-[#111827]">Catalog is being populated</h3>
              <p className="mt-1 text-xs text-[#64748B]">
                New furniture models and finishes are currently being added to the catalog.
              </p>
              <div className="mt-5">
                <Link
                  href="/customer/products"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  Go to Catalog &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Real Products Grid */}
          {!loading && !fetchError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id || product.name} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA on mobile/tablet */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/customer/products"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-white border border-[#E2E8F0] text-sm font-semibold text-[#111827] shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span>View All Furniture in Catalog</span>
            <span aria-hidden="true" className="ml-1 text-[#10B981]">&rarr;</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
