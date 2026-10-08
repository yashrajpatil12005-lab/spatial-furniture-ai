'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useAuth } from '@/lib/firebase/AuthContext';
import { RecommendationPreferences, RecommendationResult } from '@/lib/ai/recommendations';
import { formatPrice } from '@/lib/utils/currency';

interface RecommendationPanelProps {
  roomAnalysis?: string;
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
      setError('Please sign in to access personalized AI recommendations.');
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
        throw new Error(data.error || 'Failed to retrieve recommendations.');
      }

      setRecommendations(data.recommendations || []);
      setFallbackProducts(data.fallbackProducts || []);
      setAiFailed(data.aiFailed === true);

    } catch (err: any) {
      setError(err.message || 'An error occurred during AI recommendation generation.');
      setAiFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return fallbackProducts.find(p => p.id === id);
  };

  return (
    <div className="bg-[#141414] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-xl mb-10">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A] mb-6">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">AI Furniture Recommendations</h2>
            <p className="text-xs text-[#71717A] mt-0.5">Gemini 2.5 generative reasoning tailored to your floorplan aesthetic</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/30 hidden sm:inline-block">
          Personalized
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Preference Form */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-xs text-[#A1A1AA]">Define your room criteria to receive curated suggestions.</p>
          
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Room Type</label>
            <select 
              value={preferences.roomType}
              onChange={(e) => setPreferences({...preferences, roomType: e.target.value})}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] transition-colors"
            >
              <option>Any</option>
              <option>Living Room</option>
              <option>Bedroom</option>
              <option>Dining Room</option>
              <option>Office</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Style</label>
            <select 
              value={preferences.style}
              onChange={(e) => setPreferences({...preferences, style: e.target.value})}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] transition-colors"
            >
              <option>Any</option>
              <option>Modern</option>
              <option>Minimalist</option>
              <option>Industrial</option>
              <option>Classic</option>
              <option>Scandinavian</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Min Budget (₹)</label>
              <input 
                type="number"
                value={preferences.minPrice}
                onChange={(e) => setPreferences({...preferences, minPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Max Budget (₹)</label>
              <input 
                type="number"
                value={preferences.maxPrice}
                onChange={(e) => setPreferences({...preferences, maxPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Additional Notes</label>
            <textarea 
              value={preferences.additionalNotes}
              onChange={(e) => setPreferences({...preferences, additionalNotes: e.target.value})}
              placeholder="e.g. Need comfortable seating for 4, soft textures..."
              rows={2}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] rounded-lg text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white transition-all mt-3
              ${isLoading ? 'bg-[#10B981]/50 cursor-wait' : 'bg-[#10B981] hover:bg-[#059669]'}`}
          >
            {isLoading ? 'Synthesizing with Gemini...' : 'Get AI Recommendations'}
          </button>

          {hasStoredAnalysis && (
            <div className="mt-3 p-3 bg-[#0A0A0A] border border-[#10B981]/30 rounded-lg text-[11px] text-[#A1A1AA] flex items-start gap-2">
              <span className="text-[#10B981] text-xs">●</span>
              <span>Leveraging your prior AI Room Analysis for context-aware scoring.</span>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {!hasSearched ? (
            <div className="h-full min-h-[260px] border border-dashed border-[#27272A] rounded-xl flex flex-col items-center justify-center bg-[#0A0A0A] text-[#71717A] text-xs p-6 text-center">
              <svg className="w-8 h-8 text-[#71717A] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Set your style preferences and click &quot;Get AI Recommendations&quot;.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              
              {aiFailed && !error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 rounded-lg">
                  AI reasoning service is currently using deterministic fallback results matching your criteria.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Validated Recommendations */}
                {!aiFailed && recommendations.length > 0 && recommendations.map(rec => {
                  const product = getProductById(rec.productId);
                  if (!product) return null;
                  return (
                    <div key={rec.productId} className="border border-[#10B981]/40 rounded-xl bg-[#181818] overflow-hidden shadow-sm flex flex-col h-full hover:border-[#10B981] transition-colors">
                      <div className="h-36 bg-[#0A0A0A] relative border-b border-[#27272A]">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#71717A] text-[10px]">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {rec.score}% Match
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-xs font-bold text-[#F5F5F5] line-clamp-1">{product.name}</h3>
                          <p className="text-xs font-bold text-[#10B981] mt-1">{formatPrice(product.price)}</p>
                          <div className="mt-2 bg-[#0A0A0A] p-2.5 rounded-lg border border-[#27272A] text-[11px] text-[#A1A1AA] italic">
                            &ldquo;{rec.reason}&rdquo;
                          </div>
                        </div>
                        
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="w-full text-center py-2 px-3 bg-[#10B981]/10 hover:bg-[#10B981] text-[#10B981] hover:text-white border border-[#10B981]/30 hover:border-transparent text-xs font-semibold rounded-lg transition-colors"
                        >
                          View &amp; Customize &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Fallback Products */}
                {(aiFailed || recommendations.length === 0) && fallbackProducts.length > 0 && fallbackProducts.map(product => (
                  <div key={product.id} className="border border-[#27272A] rounded-xl bg-[#181818] overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="h-36 bg-[#0A0A0A] relative border-b border-[#27272A]">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#71717A] text-[10px]">No Image</div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-xs font-bold text-[#F5F5F5] line-clamp-1">{product.name}</h3>
                        <p className="text-[11px] text-[#71717A] mt-0.5">{product.category} &bull; {product.style}</p>
                        <p className="text-xs font-bold text-[#F5F5F5] mt-1">{formatPrice(product.price)}</p>
                      </div>
                      
                      <Link 
                        href={`/customer/products/${product.id}`}
                        className="w-full text-center py-2 px-3 bg-[#141414] hover:bg-[#202020] border border-[#27272A] text-xs font-semibold text-[#F5F5F5] rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {recommendations.length === 0 && fallbackProducts.length === 0 && !isLoading && (
                  <div className="col-span-full border border-dashed border-[#27272A] rounded-xl p-8 text-center bg-[#0A0A0A] text-[#71717A] text-xs">
                    No matching products found. Try adjusting your style filters or budget.
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
