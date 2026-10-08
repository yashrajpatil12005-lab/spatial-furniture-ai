'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useAuth } from '@/lib/firebase/AuthContext';
import { RecommendationPreferences, RecommendationResult } from '@/lib/ai/recommendations';

interface RecommendationPanelProps {
  roomAnalysis?: string; // Optional context from Phase 4.4
}

export default function RecommendationPanel({ roomAnalysis }: RecommendationPanelProps) {
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState<RecommendationPreferences>({
    roomType: 'Any',
    style: 'Any',
    color: 'Any',
    material: 'Any',
    minPrice: 0,
    maxPrice: 100000,
    additionalNotes: '',
    roomAnalysis: roomAnalysis
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [aiFailed, setAiFailed] = useState(false);
  const [error, setError] = useState('');
  const [hasStoredAnalysis, setHasStoredAnalysis] = useState(false);

  useEffect(() => {
    if (!roomAnalysis && typeof window !== 'undefined') {
      const stored = localStorage.getItem('spatialai-room-analysis');
      if (stored) {
        setPreferences(prev => ({ ...prev, roomAnalysis: stored }));
        setHasStoredAnalysis(true);
      }
    }
  }, [roomAnalysis]);

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('You must be logged in to use AI recommendations.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAiFailed(false);
    setHasSearched(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get recommendations.');
      }

      setRecommendations(data.recommendations || []);
      setFallbackProducts(data.fallbackProducts || []);
      setAiFailed(data.aiFailed === true);

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setAiFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return fallbackProducts.find(p => p.id === id);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-10">
      <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
        <span className="bg-emerald-100 text-emerald-700 p-1 rounded-md mr-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        AI Furniture Recommendations
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Preference Form */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-sm text-neutral-600 mb-2">Tell us what you're looking for to get personalized suggestions.</p>
          
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">Room Type</label>
            <select 
              value={preferences.roomType}
              onChange={(e) => setPreferences({...preferences, roomType: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-neutral-900"
            >
              <option>Any</option>
              <option>Living Room</option>
              <option>Bedroom</option>
              <option>Dining Room</option>
              <option>Office</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">Style</label>
            <select 
              value={preferences.style}
              onChange={(e) => setPreferences({...preferences, style: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-neutral-900"
            >
              <option>Any</option>
              <option>Modern</option>
              <option>Minimalist</option>
              <option>Industrial</option>
              <option>Classic</option>
              <option>Scandinavian</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">Min Budget</label>
              <input 
                type="number"
                value={preferences.minPrice}
                onChange={(e) => setPreferences({...preferences, minPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-neutral-900 [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">Max Budget</label>
              <input 
                type="number"
                value={preferences.maxPrice}
                onChange={(e) => setPreferences({...preferences, maxPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-neutral-900 [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">Additional Notes</label>
            <textarea 
              value={preferences.additionalNotes}
              onChange={(e) => setPreferences({...preferences, additionalNotes: e.target.value})}
              placeholder="E.g. Need a comfortable sofa for 3 people..."
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-neutral-900"
            />
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors mt-4
              ${isLoading ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'}`}
          >
            {isLoading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
          </button>

          {hasStoredAnalysis && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Using your existing AI Room Analysis for better recommendations.</span>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {!hasSearched ? (
            <div className="h-full min-h-[300px] border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm">
              Set your preferences and click "Get AI Recommendations".
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                 <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 mb-4">
                   {error}
                 </div>
              )}
              
              {aiFailed && !error && (
                 <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200 mb-4">
                   AI reasoning is temporarily unavailable. Showing fallback products matching your criteria instead.
                 </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Validated Recommendations */}
                {!aiFailed && recommendations.length > 0 && recommendations.map(rec => {
                  const product = getProductById(rec.productId);
                  if (!product) return null;
                  return (
                    <div key={rec.productId} className="border border-emerald-200 rounded-xl bg-emerald-50/30 overflow-hidden shadow-sm flex flex-col h-full">
                      <div className="h-40 bg-neutral-200 relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs uppercase">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                          {rec.score}% Match
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-bold text-neutral-900 leading-tight">{product.name}</h3>
                        </div>
                        <p className="text-sm font-semibold text-emerald-700 mb-3">₹{product.price.toLocaleString()}</p>
                        
                        <div className="bg-white p-3 rounded-lg border border-emerald-100 text-sm text-neutral-600 italic mb-4 flex-grow">
                          "{rec.reason}"
                        </div>
                        
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="w-full text-center px-4 py-2 bg-white border border-emerald-600 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-50 transition-colors"
                        >
                          View & Customize
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Fallback Products when AI fails or no AI recommendations were returned */}
                {(aiFailed || recommendations.length === 0) && fallbackProducts.length > 0 && fallbackProducts.map(product => (
                  <div key={product.id} className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="h-40 bg-neutral-200 relative">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs uppercase">No Image</div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="text-base font-bold text-neutral-900 mb-1 leading-tight">{product.name}</h3>
                      <p className="text-sm text-neutral-500 mb-2">{product.category} • {product.style}</p>
                      <p className="text-sm font-semibold text-emerald-700 mb-4">₹{product.price.toLocaleString()}</p>
                      
                      <div className="mt-auto">
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="w-full text-center block px-4 py-2 bg-neutral-100 border border-transparent text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {recommendations.length === 0 && fallbackProducts.length === 0 && !isLoading && (
                  <div className="col-span-full border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center bg-neutral-50 text-neutral-500 text-sm">
                    No matching products found for your criteria. Try expanding your search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
