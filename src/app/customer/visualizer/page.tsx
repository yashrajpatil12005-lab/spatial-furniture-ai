'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product, FurnitureCustomization } from '@/lib/types';
import { getProducts } from '@/lib/products';
import { formatPrice } from '@/lib/utils/currency';
import FurnitureCustomizer from '@/components/products/FurnitureCustomizer';
import VisualizationPanel from '@/components/ai/VisualizationPanel';

function VisualizerContent() {
  const searchParams = useSearchParams();
  const requestedProductId = searchParams.get('productId');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customization, setCustomization] = useState<FurnitureCustomization | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        const data = await getProducts();
        if (isMounted) {
          const loadedProducts = data || [];
          setProducts(loadedProducts);

          // Select product from URL query or default to the first available product
          if (loadedProducts.length > 0) {
            const match = requestedProductId
              ? loadedProducts.find((p) => p.id === requestedProductId)
              : null;
            const initialProduct = match || loadedProducts[0];
            setSelectedProductId(initialProduct.id!);
          }
        }
      } catch (err) {
        console.error('Error loading products for visualizer:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [requestedProductId]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <Link
            href="/customer/products"
            className="inline-flex items-center text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors gap-1.5"
          >
            <span>&larr;</span>
            <span>Browse Full Catalog</span>
          </Link>

          <nav className="flex items-center text-xs text-[#64748B] space-x-2 font-medium">
            <Link href="/" className="hover:text-[#111827] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/customer/products" className="hover:text-[#111827] transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">Room Visualizer</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  Gemini 2.5 Flash Spatial Intelligence
                </span>
                <span className="text-xs font-medium text-[#64748B] hidden sm:inline">
                  Multimodal Room Reasoning
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                AI <span className="text-[#10B981]">Room Visualizer</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
                Upload a photograph of your physical room to analyze architectural scale, natural daylight angles, and walkway clearance with real furniture models.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <Link
                href="/customer#recommendations"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#111827] transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Recommendations</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center card-shadow">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981] mx-auto mb-4"></div>
            <p className="text-xs font-semibold text-[#111827]">Loading Furniture Catalog &amp; Spatial Models...</p>
            <p className="text-[11px] text-[#64748B] mt-1">Preparing items for room compatibility testing</p>
          </div>
        )}

        {/* Empty Catalog Fallback */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#111827]">No Catalog Items Available</h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4">Please seed or add products to test room layout compatibility.</p>
            <Link
              href="/customer/products"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        )}

        {/* Active Product Selection & Interactive Customizer Bar */}
        {!loading && selectedProduct && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857] block mb-0.5">
                  Target Furniture Model
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[#111827]">
                  Select Piece to Place in Room
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] hover:border-[#10B981] text-xs font-semibold text-[#334155] hover:text-[#047857] bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>{showCustomizer ? 'Hide Customizer' : 'Customize Finishes & Dimensions'}</span>
                </button>
              </div>
            </div>

            {/* Product Selector Dropdown & Mini Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5">
                <label htmlFor="target-furniture-select" className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Choose Catalog Item
                </label>
                <select
                  id="target-furniture-select"
                  value={selectedProduct.id}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.category} ({formatPrice(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Item Quick Specs Banner */}
              <div className="md:col-span-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#E2E8F0] overflow-hidden flex-shrink-0">
                    {selectedProduct.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#94A3B8]">
                        3D
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#111827] truncate">{selectedProduct.name}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {selectedProduct.category} &bull; {selectedProduct.width}&times;{selectedProduct.height}&times;{selectedProduct.depth} cm
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-extrabold text-[#111827] block">{formatPrice(selectedProduct.price)}</span>
                  <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                    {selectedProduct.style || 'Modern'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Furniture Customizer Panel */}
            {showCustomizer && (
              <div className="pt-4 border-t border-[#E2E8F0] animate-fadeIn">
                <FurnitureCustomizer
                  product={selectedProduct}
                  onCustomizationChange={setCustomization}
                />
              </div>
            )}
          </div>
        )}

        {/* Distinct Room Visualization & Analysis Interface */}
        {!loading && selectedProduct && (
          <VisualizationPanel
            product={selectedProduct}
            customization={
              customization || {
                productId: selectedProduct.id!,
                color: selectedProduct.color || 'Beige',
                material: selectedProduct.material || 'Fabric',
                finish: 'Matte',
                width: selectedProduct.width,
                height: selectedProduct.height,
                depth: selectedProduct.depth,
              }
            }
          />
        )}
      </div>
    </div>
  );
}

export default function CustomerVisualizerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981]"></div>
        </div>
      }
    >
      <VisualizerContent />
    </Suspense>
  );
}
