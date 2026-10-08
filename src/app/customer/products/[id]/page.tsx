'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useEffect, useState, use } from 'react';
import { Product, FurnitureCustomization } from '@/lib/types';
import { getProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils/currency';
import Link from 'next/link';
import FurnitureCustomizer from '@/components/products/FurnitureCustomizer';
import VisualizationPanel from '@/components/ai/VisualizationPanel';

export default function CustomerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
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
    fetchProduct();
  }, [resolvedParams.id]);

  const handleFutureFeature = (featureName: string) => {
    alert(`${featureName} will be available in the upcoming Spatial Computing release.`);
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'retailer', 'admin']}>
      <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Navigation & Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
            <Link 
              href="/customer/products" 
              className="inline-flex items-center text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors gap-1.5"
            >
              <span>&larr;</span>
              <span>Back to Products</span>
            </Link>

            <nav className="flex items-center text-xs text-[#71717A] space-x-2 font-medium">
              <Link href="/customer" className="hover:text-[#F5F5F5] transition-colors">Customer</Link>
              <span>/</span>
              <Link href="/customer/products" className="hover:text-[#F5F5F5] transition-colors">Catalog</Link>
              <span>/</span>
              <span className="text-[#F5F5F5] truncate max-w-[220px]">{product?.name || 'Loading...'}</span>
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
            <div className="text-center py-20 bg-[#141414] border border-[#27272A] rounded-2xl p-8 max-w-xl mx-auto">
              <p className="text-red-400 font-semibold mb-2">Notice</p>
              <p className="text-[#A1A1AA] text-sm mb-6">{error}</p>
              <Link 
                href="/customer/products" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669]"
              >
                Return to Catalog
              </Link>
            </div>
          )}

          {/* Product Details Card */}
          {!loading && !error && product && (
            <div className="bg-[#141414] rounded-2xl border border-[#27272A] p-6 sm:p-10 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-10">
                
                {/* Left: Product Image & Interactive Spatial Previews */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-6">
                  <div className="relative aspect-h-4 aspect-w-5 sm:aspect-h-3 sm:aspect-w-4 w-full overflow-hidden rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                    {product.imageUrl && !imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover object-center" 
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-[#71717A] p-8">
                        <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Image Preview Unavailable</span>
                      </div>
                    )}

                    {/* Active Configuration Preview Pill */}
                    {customization && (
                      <div className="absolute bottom-4 left-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#27272A] rounded-lg p-3 shadow-lg">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] mb-1">
                          Current Customization
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#F5F5F5]">
                          <span>Color: <strong className="text-white">{customization.color}</strong></span>
                          <span>Material: <strong className="text-white">{customization.material}</strong></span>
                          <span>Finish: <strong className="text-white">{customization.finish}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleFutureFeature('AR Visualization')}
                      className="w-full py-3 px-4 rounded-xl border border-[#27272A] hover:border-slate-600 bg-[#181818] hover:bg-[#202020] text-xs font-semibold text-[#F5F5F5] transition-all flex items-center justify-center gap-2"
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
                      <span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">
                        {product.brand || 'Spatial Collection'}
                      </span>
                      <span className="text-xs bg-[#181818] border border-[#27272A] text-[#A1A1AA] px-2.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                      {product.name}
                    </h1>
                    
                    {/* Price & Availability */}
                    <div className="mt-4 pb-4 border-b border-[#27272A] flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-[#71717A] block">Retail Price</span>
                        <span className="text-3xl font-extrabold text-[#F5F5F5]">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        product.stock > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">Description</h3>
                      <p className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                        {product.description || 'No detailed description provided for this furniture model.'}
                      </p>
                    </div>

                    {/* Dimensions & Specifications */}
                    <div className="mt-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#27272A] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[#71717A] block">Width</span>
                        <span className="font-semibold text-[#F5F5F5]">{product.width} cm</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">Height</span>
                        <span className="font-semibold text-[#F5F5F5]">{product.height} cm</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">Depth</span>
                        <span className="font-semibold text-[#F5F5F5]">{product.depth} cm</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block">Style</span>
                        <span className="font-semibold text-[#F5F5F5]">{product.style || 'Modern'}</span>
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
