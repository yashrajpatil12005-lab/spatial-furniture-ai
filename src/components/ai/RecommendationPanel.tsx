'use client';

import { useState } from 'react';
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
  
  const [preferences, setPreferences] = useState<RecommendationPreferences>(() => {
    let initialAnalysis = roomAnalysis;
    if (!initialAnalysis && typeof window !== 'undefined') {
      try {
        initialAnalysis = localStorage.getItem('spatialai-room-analysis') || undefined;
      } catch {
        // ignore
      }
    }
    return {
      roomType: 'Any',
      style: 'Any',
      color: 'Any',
      material: 'Any',
      minPrice: 0,
      maxPrice: 100000,
      additionalNotes: '',
      roomAnalysis: initialAnalysis,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [aiFailed, setAiFailed] = useState(false);
  const [error, setError] = useState('');

  const [hasStoredAnalysis, setHasStoredAnalysis] = useState<boolean>(() => {
    if (roomAnalysis) return true;
    if (typeof window !== 'undefined') {
      try {
        return Boolean(localStorage.getItem('spatialai-room-analysis'));
      } catch {
        return false;
      }
    }
    return false;
  });

  // Sync state if roomAnalysis prop updates dynamically
  const [prevRoomAnalysis, setPrevRoomAnalysis] = useState(roomAnalysis);
  if (prevRoomAnalysis !== roomAnalysis) {
    setPrevRoomAnalysis(roomAnalysis);
    if (roomAnalysis) {
      setPreferences(prev => ({ ...prev, roomAnalysis }));
      setHasStoredAnalysis(true);
    }
  }

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('Please sign in to access personalized AI recommendations.');
      return;
    }

    if (user.emailVerified === false) {
      setError('Email verification required. Please verify your email to get personalized recommendations.');
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

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during AI recommendation generation.';
      setError(msg);
      setAiFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return fallbackProducts.find(p => p.id === id);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mb-10">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">AI Furniture Recommendations</h2>
            <p className="text-sm text-[#475569]">Personalized furniture suggestions based on your room and preferences.</p>
          </div>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
          Personalized
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preference Form */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-xs text-[#64748B]">Configure your room parameters to get tailored AI styling suggestions.</p>
          
          <div>
            <label htmlFor="rec-room-type-select" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Room Type
            </label>
            <select 
              id="rec-room-type-select"
              value={preferences.roomType}
              onChange={(e) => setPreferences({...preferences, roomType: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
            >
              <option>Any</option>
              <option>Living Room</option>
              <option>Bedroom</option>
              <option>Dining Room</option>
              <option>Office</option>
            </select>
          </div>

          <div>
            <label htmlFor="rec-style-select" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Style Preference
            </label>
            <select 
              id="rec-style-select"
              value={preferences.style}
              onChange={(e) => setPreferences({...preferences, style: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
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
              <label htmlFor="rec-min-price-input" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Min Budget (₹)
              </label>
              <input 
                id="rec-min-price-input"
                type="number"
                value={preferences.minPrice}
                onChange={(e) => setPreferences({...preferences, minPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
            <div>
              <label htmlFor="rec-max-price-input" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Max Budget (₹)
              </label>
              <input 
                id="rec-max-price-input"
                type="number"
                value={preferences.maxPrice}
                onChange={(e) => setPreferences({...preferences, maxPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rec-additional-notes-input" className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Additional Notes
            </label>
            <textarea 
              id="rec-additional-notes-input"
              value={preferences.additionalNotes}
              onChange={(e) => setPreferences({...preferences, additionalNotes: e.target.value})}
              placeholder="e.g. Spacious seating for family, neutral tones..."
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-sm
              ${isLoading ? 'bg-[#10B981]/60 cursor-wait' : 'bg-[#10B981] hover:bg-[#059669]'}`}
          >
            {isLoading ? 'Synthesizing recommendations...' : 'Get AI Recommendations'}
          </button>

          {hasStoredAnalysis && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#047857] flex items-start gap-2">
              <span className="font-bold">●</span>
              <span>Contextually factoring in your previously generated AI Room Analysis.</span>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {!hasSearched ? (
            <div className="h-full min-h-[300px] border border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center bg-[#F8FAFC] text-[#64748B] text-sm p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#10B981] mb-3 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="font-semibold text-[#111827] text-base mb-1">Set your preferences to receive personalized recommendations</p>
              <p className="text-xs text-[#64748B]">Choose your room type and aesthetic to trigger Gemini generative reasoning.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-[#FEF2F2] border border-red-200 text-xs text-[#EF4444] rounded-xl font-medium">
                  {error}
                </div>
              )}
              
              {aiFailed && !error && (
                <div className="p-4 bg-[#FFFBEB] border border-amber-200 text-xs text-[#B45309] rounded-xl font-medium">
                  AI service is temporarily using fallback catalog products matching your criteria.
                </div>
              )}

              {/* Loading State Skeleton */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2].map((i) => (
                    <div key={`rec-skeleton-${i}`} className="border border-[#E2E8F0] rounded-2xl bg-white p-5 space-y-4 animate-pulse">
                      <div className="h-44 bg-slate-100 rounded-xl"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      <div className="h-16 bg-slate-50 rounded-xl"></div>
                      <div className="h-9 bg-slate-100 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Validated Recommendations */}
              {!isLoading && !aiFailed && recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {recommendations.map(rec => {
                    const product = getProductById(rec.productId);
                    if (!product) return null;
                    return (
                      <div 
                        key={rec.productId} 
                        className="group border border-[#E2E8F0] hover:border-[#10B981] rounded-2xl bg-white overflow-hidden card-shadow card-shadow-hover flex flex-col h-full transition-all duration-200"
                      >
                        {/* Image & Match Header */}
                        <div className="h-44 bg-[#F1F5F9] relative overflow-hidden">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">No Image</div>
                          )}
                          
                          {/* Top Match Badge */}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#047857] border border-[#A7F3D0] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                            <span>{rec.score}% Compatibility</span>
                          </div>

                          {/* Category Pill */}
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {product.category}
                          </div>
                        </div>

                        {/* Details & Room Fit Insights */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
                                {product.brand || 'Spatial Collection'}
                              </span>
                              <span className="text-[11px] text-[#64748B]">
                                {product.style || 'Contemporary'}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#047857] transition-colors line-clamp-1">
                              {product.name}
                            </h3>

                            <div className="flex items-baseline justify-between mt-1.5">
                              <span className="text-base font-extrabold text-[#111827]">{formatPrice(product.price)}</span>
                              <span className="text-[11px] text-[#64748B]">{product.width}&times;{product.height}&times;{product.depth} cm</span>
                            </div>

                            {/* WHY IT SUITS THE ROOM */}
                            <div className="mt-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex items-start gap-1.5">
                                <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                                <p className="text-[#334155] leading-relaxed font-medium">
                                  {rec.reason}
                                </p>
                              </div>

                              {rec.roomFitReason && (
                                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#475569]">
                                  <span className="font-semibold text-[#047857] block mb-0.5">Room Geometry & Scale:</span>
                                  <p className="leading-relaxed">{rec.roomFitReason}</p>
                                </div>
                              )}

                              {rec.harmonyHighlight && (
                                <div className="text-[11px] text-[#475569]">
                                  <span className="font-semibold text-[#047857] block mb-0.5">Palette & Lighting Synergy:</span>
                                  <p className="leading-relaxed">{rec.harmonyHighlight}</p>
                                </div>
                              )}

                              {rec.placementTip && (
                                <div className="text-[11px] text-[#0369A1] bg-[#F0F9FF] border border-[#BAE6FD] p-2 rounded-lg flex items-start gap-1.5">
                                  <span className="font-bold shrink-0 mt-0.5">→</span>
                                  <span className="leading-relaxed">{rec.placementTip}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Link 
                            href={`/customer/products/${product.id}`}
                            className="w-full text-center py-2.5 px-3 bg-[#ECFDF5] hover:bg-[#10B981] text-[#047857] hover:text-white border border-[#A7F3D0] hover:border-transparent text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span>View &amp; Customize in 3D</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback Products */}
              {!isLoading && (aiFailed || recommendations.length === 0) && fallbackProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {fallbackProducts.map(product => (
                    <div key={product.id} className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden card-shadow flex flex-col h-full">
                      <div className="h-44 bg-[#F1F5F9] relative overflow-hidden">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 bg-slate-100 text-[#475569] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                          Catalog Match
                        </div>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                            <span>{product.category}</span>
                            <span>{product.style || 'Contemporary'}</span>
                          </div>
                          <h3 className="text-sm font-bold text-[#111827] line-clamp-1">{product.name}</h3>
                          <p className="text-base font-extrabold text-[#111827] mt-1">{formatPrice(product.price)}</p>
                          <div className="mt-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#475569]">
                            Suggested based on your style criteria and category preferences.
                          </div>
                        </div>
                        
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="w-full text-center py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-xs font-semibold text-[#111827] rounded-xl transition-colors shadow-sm"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State when no matches */}
              {!isLoading && recommendations.length === 0 && fallbackProducts.length === 0 && (
                <div className="border border-dashed border-[#CBD5E1] rounded-2xl p-8 text-center bg-[#F8FAFC] text-[#64748B] text-xs">
                  No matching products found. Try adjusting your style filters or budget.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
