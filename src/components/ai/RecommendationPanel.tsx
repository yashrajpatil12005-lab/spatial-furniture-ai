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
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Room Type
            </label>
            <select 
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
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Style Preference
            </label>
            <select 
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
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Min Budget (₹)
              </label>
              <input 
                type="number"
                value={preferences.minPrice}
                onChange={(e) => setPreferences({...preferences, minPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Max Budget (₹)
              </label>
              <input 
                type="number"
                value={preferences.maxPrice}
                onChange={(e) => setPreferences({...preferences, maxPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#111827] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
              Additional Notes
            </label>
            <textarea 
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
                  AI service is temporarily using fallback products matching your criteria.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* AI Validated Recommendations */}
                {!aiFailed && recommendations.length > 0 && recommendations.map(rec => {
                  const product = getProductById(rec.productId);
                  if (!product) return null;
                  return (
                    <div key={rec.productId} className="border border-[#E2E8F0] hover:border-[#10B981] rounded-2xl bg-white overflow-hidden card-shadow card-shadow-hover flex flex-col h-full">
                      <div className="h-44 bg-[#F1F5F9] relative overflow-hidden">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#10B981] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {rec.score}% Match
                        </div>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#111827] line-clamp-1">{product.name}</h3>
                          <p className="text-base font-extrabold text-[#111827] mt-1">{formatPrice(product.price)}</p>
                          <div className="mt-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#475569] italic">
                            &ldquo;{rec.reason}&rdquo;
                          </div>
                        </div>
                        
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="w-full text-center py-2.5 px-3 bg-[#ECFDF5] hover:bg-[#10B981] text-[#047857] hover:text-white border border-[#A7F3D0] hover:border-transparent text-xs font-semibold rounded-xl transition-all shadow-sm"
                        >
                          View &amp; Customize &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Fallback Products */}
                {(aiFailed || recommendations.length === 0) && fallbackProducts.length > 0 && fallbackProducts.map(product => (
                  <div key={product.id} className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden card-shadow flex flex-col h-full">
                    <div className="h-44 bg-[#F1F5F9] relative overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">No Image</div>
                      )}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#111827] line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{product.category} &bull; {product.style}</p>
                        <p className="text-base font-extrabold text-[#111827] mt-1">{formatPrice(product.price)}</p>
                      </div>
                      
                      <Link 
                        href={`/customer/products/${product.id}`}
                        className="w-full text-center py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-xs font-semibold text-[#111827] rounded-xl transition-colors shadow-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Empty State when no matches */}
                {recommendations.length === 0 && fallbackProducts.length === 0 && !isLoading && (
                  <div className="col-span-full border border-dashed border-[#CBD5E1] rounded-2xl p-8 text-center bg-[#F8FAFC] text-[#64748B] text-xs">
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
