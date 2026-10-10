'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Product, FurnitureCustomization } from '@/lib/types';
import { getProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils/currency';
import Link from 'next/link';
import FurnitureCustomizer from '@/components/products/FurnitureCustomizer';
import VisualizationPanel from '@/components/ai/VisualizationPanel';

export default function CustomerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [customization, setCustomization] = useState<FurnitureCustomization | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(resolvedParams.id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found in catalog.');
        }
      } catch (err: any) {
        setError('Error loading product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProduct();
    }
  }, [resolvedParams.id, authLoading, user]);

  const handleFutureFeature = (featureName: string) => {
    alert(`${featureName} will be available in the upcoming Spatial Computing release.`);
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'retailer', 'admin']}>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] py-8 sm:py-12 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] mx-auto space-y-8">
          
          {/* Navigation & Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <Link 
              href="/customer/products" 
              className="inline-flex items-center text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors gap-1.5"
            >
              <span>&larr;</span>
              <span>Back to Products</span>
            </Link>

            <nav className="flex items-center text-xs text-[#64748B] space-x-2 font-medium">
              <Link href="/customer" className="hover:text-[#111827] transition-colors">Customer</Link>
              <span>/</span>
              <Link href="/customer/products" className="hover:text-[#111827] transition-colors">Catalog</Link>
              <span>/</span>
              <span className="text-[#111827] font-semibold truncate max-w-[220px]">{product?.name || 'Loading...'}</span>
            </nav>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-28">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981]"></div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-xl mx-auto card-shadow">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold mb-1">Product Notice</p>
              <p className="text-[#64748B] text-sm mb-6">{error}</p>
              <Link 
                href="/customer/products" 
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-all"
              >
                Return to Catalog
              </Link>
            </div>
          )}

          {/* Product Details Card */}
          {!loading && !error && product && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-10 card-shadow">
              <div className="flex flex-col lg:flex-row gap-10">
                
                {/* Left: Product Image & Interactive Spatial Previews */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-6">
                  <div className="relative aspect-h-4 aspect-w-5 sm:aspect-h-3 sm:aspect-w-4 w-full overflow-hidden rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                    {product.imageUrl && !imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover object-center" 
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-[#94A3B8] p-8">
                        <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">Image Preview Unavailable</span>
                      </div>
                    )}

                    {/* Active Configuration Preview Pill */}
                    {customization && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-3 shadow-md">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#047857] mb-1">
                          Current Customization
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#475569]">
                          <span>Color: <strong className="text-[#111827]">{customization.color}</strong></span>
                          <span>Material: <strong className="text-[#111827]">{customization.material}</strong></span>
                          <span>Finish: <strong className="text-[#111827]">{customization.finish}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleFutureFeature('AR Visualization')}
                      className="w-full py-3 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#111827] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      View in AR (Mobile)
                    </button>
                    <button 
                      onClick={() => {
                        window.scrollTo({
                          top: document.body.scrollHeight,
                          behavior: 'smooth'
                        });
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Room Visualize
                    </button>
                  </div>
                </div>

                {/* Right: Product Info & Customizer */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                        {product.brand || 'Spatial Collection'}
                      </span>
                      <span className="text-xs bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] font-medium px-2.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                      {product.name}
                    </h1>
                    
                    {/* Price & Availability */}
                    <div className="mt-4 pb-4 border-b border-[#E2E8F0] flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-[#64748B] block font-medium">Price</span>
                        <span className="text-3xl font-extrabold text-[#111827]">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      
                      <div>
                        {product.stock > 5 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                            ● In Stock ({product.stock} units)
                          </span>
                        ) : product.stock > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                            ● Low Stock ({product.stock} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                            ● Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Description</h3>
                      <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                        {product.description || 'No detailed description provided for this furniture model.'}
                      </p>
                    </div>

                    {/* Dimensions & Specifications */}
                    <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[#64748B] block font-medium">Width</span>
                        <span className="font-bold text-[#111827]">{product.width} cm</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block font-medium">Height</span>
                        <span className="font-bold text-[#111827]">{product.height} cm</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block font-medium">Depth</span>
                        <span className="font-bold text-[#111827]">{product.depth} cm</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block font-medium">Style</span>
                        <span className="font-bold text-[#111827]">{product.style || 'Modern'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customizer Component */}
                  <FurnitureCustomizer 
                    product={product} 
                    onCustomizationChange={setCustomization} 
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* AI Room Visualization Section */}
          {!loading && !error && product && customization && (
            <VisualizationPanel product={product} customization={customization} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
