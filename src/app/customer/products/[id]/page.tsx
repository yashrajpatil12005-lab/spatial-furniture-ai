'use client';

import { ProtectedRoute } from '@/lib/firebase/ProtectedRoute';
import { useEffect, useState, use } from 'react';
import { Product, FurnitureCustomization } from '@/lib/types';
import { getProduct } from '@/lib/products';
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
          setError('Product not found.');
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
    alert(`${featureName} will be available in a future phase.`);
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'retailer', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <Link href="/customer/products" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
            &larr; Back to Products
          </Link>
          <nav className="flex text-sm text-neutral-500 space-x-2">
            <span>Customer</span>
            <span>&rarr;</span>
            <Link href="/customer/products" className="hover:text-neutral-900">Products</Link>
            <span>&rarr;</span>
            <span className="text-neutral-900 font-medium truncate max-w-[200px]">{product?.name || 'Loading...'}</span>
          </nav>
        </div>

        {/* State Handling */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-24 bg-white border border-neutral-200 rounded-xl">
            <p className="text-red-500 font-bold mb-2">Error</p>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Link href="/customer/products" className="text-emerald-600 hover:text-emerald-700 font-medium">Return to Catalog</Link>
          </div>
        )}

        {/* Product Details */}
        {!loading && !error && product && (
          <div className="flex flex-col lg:flex-row gap-12 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-100 shadow-sm">
            
            {/* Image Area */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-6">
              <div className="relative aspect-h-4 aspect-w-5 sm:aspect-h-3 sm:aspect-w-4 w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200">
                {product.imageUrl && !imageError ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover object-center" 
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-neutral-400">
                    <svg className="w-16 h-16 mb-2 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Image Unavailable</span>
                  </div>
                )}

                {/* Configuration Visual Preview Overlay */}
                {customization && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-lg p-3 shadow-lg pointer-events-none">
                    <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">Preview</div>
                    <div className="flex gap-4 text-sm font-medium text-neutral-700">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: customization.color.toLowerCase() === 'white' ? '#fff' : customization.color.toLowerCase() === 'black' ? '#000' : customization.color.toLowerCase() === 'grey' ? '#888' : customization.color.toLowerCase() === 'brown' ? '#8b4513' : customization.color.toLowerCase() === 'blue' ? '#4169e1' : '#f5f5dc' }}></div>
                        {customization.color}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">•</span> {customization.material}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">•</span> {customization.finish}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => handleFutureFeature('AR visualization')}
                  className="w-full py-3 px-4 border border-emerald-600 text-emerald-700 rounded-lg shadow-sm text-sm font-bold bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  View in AR
                </button>
                <button 
                  onClick={() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    });
                  }}
                  className="w-full py-3 px-4 border border-emerald-600 text-emerald-700 rounded-lg shadow-sm text-sm font-bold bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  AI Visualize
                </button>
              </div>
            </div>

            {/* Information Area & Customizer */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-8">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">{product.brand}</span>
                  <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                    {product.category}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">{product.name}</h1>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100">
                  <p className="text-3xl font-bold text-neutral-900">${product.price.toFixed(2)}</p>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock > 0 ? 'Available' : 'Out of Stock'}
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-base text-neutral-600 leading-relaxed whitespace-pre-line">
                    {product.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Customizer Component */}
              <FurnitureCustomizer 
                product={product} 
                onCustomizationChange={setCustomization} 
              />
            </div>
          </div>
        )}
        
        {/* AI Room Visualization Section */}
        {!loading && !error && product && customization && (
          <VisualizationPanel product={product} customization={customization} />
        )}
      </div>
    </ProtectedRoute>
  );
}
