'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Product, FurnitureCustomization } from '@/lib/types';
import { VisualizationResponse } from '@/lib/ai/types';
import { validateAndNormalizeRoomAnalysis } from '@/lib/ai/gemini';
import RoomAnalysisDashboard from './RoomAnalysisDashboard';

interface VisualizationPanelProps {
  product: Product;
  customization: FurnitureCustomization;
}

export default function VisualizationPanel({ product, customization }: VisualizationPanelProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisualizationResponse | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, WebP).');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (maximum size is 5MB).');
        return;
      }

      setError('');
      setAnalysisResult(null);
      setGeneratedImage(null);
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = ev => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError('');
    setAnalysisResult(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    if (!user) {
      setError('Please sign in to analyze your room layout.');
      return;
    }

    if (user.emailVerified === false) {
      setError('Email verification required. Please verify your email before analyzing room layout.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('product', JSON.stringify(product));
      formData.append('customization', JSON.stringify(customization));

      const res = await fetch('/api/ai/visualize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data: VisualizationResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Spatial analysis failed.');
      }

      setAnalysisResult(data);
      if (data.analysis) {
        localStorage.setItem('spatialai-room-analysis', data.analysis);
      }

      // Smooth scroll to the analysis report once ready
      setTimeout(() => {
        const el = document.getElementById('spatial-room-analysis-report');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred communicating with AI service.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolve typed structured analysis with safe fallback normalization
  const structuredData =
    analysisResult?.structuredAnalysis ||
    (analysisResult?.analysis ? validateAndNormalizeRoomAnalysis(analysisResult.analysis) : null);

  // STATE 1: Generated Image Exists (Image Synthesis View)
  if (generatedImage) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">AI Spatial Visualization Result</h2>
              <p className="text-xs text-[#64748B]">Synthesized concept for {product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
              Synthesized Concept
            </span>
            <button
              onClick={() => setGeneratedImage(null)}
              className="text-xs font-medium text-[#475569] hover:text-[#111827] px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] transition-colors"
            >
              &larr; Back to Layout View
            </button>
          </div>
        </div>

        {/* Side-by-side visual comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Original Room Photo
              </h3>
              <span className="text-[10px] text-[#94A3B8]">Uploaded space</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0] aspect-h-3 aspect-w-4 bg-[#F1F5F9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previewUrl && <img src={previewUrl} alt="Original Room" className="object-cover w-full h-full" />}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#047857] uppercase tracking-wider">
                Synthesized Placement Concept
              </h3>
              <span className="text-[10px] text-[#047857] font-medium bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                AI Simulated
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-[#10B981] aspect-h-3 aspect-w-4 bg-[#F1F5F9] shadow-md relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImage} alt="Generated Visualization" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>

        {/* Image Generation Honest Advisory */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2.5 mb-6">
          <svg className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            <strong className="text-[#334155]">Note on AI Image Synthesis:</strong> This rendering is an experimental visual concept. Perspective and scale are synthesized approximations. Please refer to the room analysis below and measure physical dimensions before purchasing.
          </p>
        </div>

        {/* Structured Room Analysis Dashboard in Generated View */}
        {structuredData && (
          <RoomAnalysisDashboard
            data={structuredData}
            product={product}
            customization={customization}
            onReanalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        <div className="border-t border-[#E2E8F0] pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              setGeneratedImage(null);
              setAnalysisResult(null);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#111827] rounded-xl shadow-sm transition-colors"
          >
            Upload Another Photo &rarr;
          </button>
          <button
            onClick={() => setGeneratedImage(null)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white rounded-xl shadow-sm transition-colors"
          >
            View Room Analysis Dashboard
          </button>
        </div>
      </div>
    );
  }

  // STATE 2: Form, Upload & Structured Room Analysis View
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Visualize & Analyze in My Room</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Upload a photo of your space for architectural scale evaluation, lighting interaction, and style compatibility.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0] hidden sm:inline-block">
          Gemini 2.5 Flash Vision
        </span>
      </div>

      {/* Primary Error State with Retry Action */}
      {error && !isAnalyzing && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-xs font-bold text-[#991B1B]">Spatial Analysis Notice</h4>
              <p className="text-xs text-[#B91C1C] mt-0.5">{error}</p>
            </div>
          </div>
          {selectedImage && (
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-white hover:bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry Analysis</span>
            </button>
          )}
        </div>
      )}

      {/* Top 2-Column Grid: Photo Upload & Target Furniture Specification Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Room Photo Upload / Preview */}
        <div className="space-y-4">
          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#10B981] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] hover:bg-white transition-all min-h-[240px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] mb-3 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#111827] mb-1">Click to upload your room photo</p>
              <p className="text-[11px] text-[#64748B]">Supports JPEG, PNG, WebP (Max 5MB)</p>
              <span className="mt-3 text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                Clear view of floor & walls recommended
              </span>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9] group aspect-h-3 aspect-w-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Room Preview" className="object-cover w-full h-full" />
              {!isAnalyzing && (
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/95 hover:bg-white text-[#111827] text-xs font-medium px-2.5 py-1.5 rounded-xl shadow-md border border-[#E2E8F0] transition-colors flex items-center gap-1"
                    title="Change photo"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Change</span>
                  </button>
                  <button
                    onClick={handleClearImage}
                    className="bg-white/95 hover:bg-white text-[#111827] rounded-xl p-1.5 shadow-md border border-[#E2E8F0] transition-colors"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4 text-[#64748B] hover:text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleImageSelect}
            disabled={isAnalyzing}
          />
        </div>

        {/* Right Column: Target Furniture Specification Card & Actions */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#047857]">
                Target Furniture Piece
              </span>
              <span className="text-[11px] font-semibold text-[#64748B] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
                {product.category}
              </span>
            </div>

            <p className="text-base font-extrabold text-[#111827] mb-3">{product.name}</p>

            <h4 className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-2">
              Configured Specifications
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Color</span>
                <span className="text-[#111827] font-semibold">{customization.color}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Material</span>
                <span className="text-[#111827] font-semibold">{customization.material}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Finish</span>
                <span className="text-[#111827] font-semibold">{customization.finish}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] block font-medium">Dimensions (W&times;H&times;D)</span>
                <span className="text-[#111827] font-semibold">
                  {customization.width}&times;{customization.height}&times;{customization.depth} cm
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Status Indicators */}
          <div className="space-y-3">
            {/* Status indicator when analysis is ready */}
            {analysisResult && !isAnalyzing && (
              <div className="bg-[#ECFDF5] p-3 rounded-xl border border-[#A7F3D0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#047857] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span>Spatial Analysis Report Generated</span>
                </div>
                <a
                  href="#spatial-room-analysis-report"
                  className="text-[11px] font-bold text-[#047857] underline hover:text-[#065F46]"
                >
                  View Report &darr;
                </a>
              </div>
            )}

            {!user && (
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF] flex items-center justify-between">
                <span>Sign in required to run AI room analysis on your photo.</span>
                <Link href="/login" className="font-bold underline hover:text-[#1D4ED8] ml-2 shrink-0">
                  Sign In
                </Link>
              </div>
            )}

            {user && !user.emailVerified && (
              <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-center justify-between">
                <span>Email verification required to run AI room analysis on your space.</span>
                <Link href="/verify-email" className="font-bold underline hover:text-[#78350F] ml-2 shrink-0">
                  Verify Email
                </Link>
              </div>
            )}

            {/* Action 1: Analyze Room Layout (Primary Action) */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                !selectedImage
                  ? 'bg-slate-200 text-slate-400 border border-transparent cursor-not-allowed'
                  : isAnalyzing
                  ? 'bg-[#10B981]/80 text-white cursor-wait'
                  : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/20 shadow-md'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Evaluating Room Layout &amp; Compatibility...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{analysisResult ? 'Re-Analyze Room Layout' : 'Analyze Room Layout with Gemini'}</span>
                </>
              )}
            </button>

            {/* Action 2: Gracefully Disabled Image Inpainting (Coming Soon) */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#F1F5F9] text-[#64748B]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="text-xs font-semibold text-[#475569]">AI Spatial Image Synthesis</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Coming Soon
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Photorealistic furniture inpainting is currently in preview development. Architectural layout, scale evaluation, and color compatibility above are fully operational.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED LOADING STATE WHILE ANALYZING */}
      {isAnalyzing && (
        <div className="mt-8 p-6 sm:p-8 bg-[#F0FDF4] border border-[#A7F3D0] rounded-2xl animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#A7F3D0] flex items-center justify-center text-[#047857] shadow-sm">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Gemini Spatial Analysis in Progress</h3>
              <p className="text-xs text-[#047857] font-medium">Evaluating room geometry, lighting, scale fit, and spatial compatibility...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#166534]">
            <div className="p-3 bg-white/80 rounded-xl border border-[#BBF7D0]">
              <span className="font-bold block mb-1">1. Architectural Boundaries</span>
              <p className="text-[11px] text-[#475569]">Inspecting floor plan, openings, and visible landmarks</p>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-[#BBF7D0]">
              <span className="font-bold block mb-1">2. Lighting & Palette</span>
              <p className="text-[11px] text-[#475569]">Checking natural illumination and finish reflections</p>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-[#BBF7D0]">
              <span className="font-bold block mb-1">3. Clearance & Placement</span>
              <p className="text-[11px] text-[#475569]">Evaluating 90cm walkways and functional positioning</p>
            </div>
          </div>
        </div>
      )}

      {/* USEFUL EMPTY STATE BEFORE ANALYSIS */}
      {!analysisResult && !isAnalyzing && (
        <div className="mt-8 p-6 sm:p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-white text-[#047857] border border-[#E2E8F0] shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-[#111827]">
                {selectedImage ? 'Ready to Evaluate Your Room' : 'What AI Room Analysis Provides'}
              </h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed mb-5">
              {selectedImage
                ? `Photo uploaded successfully. Click "Analyze Room Layout" to receive a tailored interior compatibility report evaluating your customized ${customization.color} ${product.name}.`
                : 'Upload a clear photograph of your room to receive an objective, architectural spatial evaluation with Gemini 2.5 Flash before ordering:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[#047857] font-bold block mb-1 text-[11px] uppercase tracking-wider">
                1. Architectural Fit
              </span>
              <p className="text-[#475569] leading-relaxed text-[11px]">
                Evaluates visible floor perimeters, window heights, and structural sightlines.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[#047857] font-bold block mb-1 text-[11px] uppercase tracking-wider">
                2. Lighting & Finish
              </span>
              <p className="text-[#475569] leading-relaxed text-[11px]">
                Assesses how ambient natural light interacts with the {customization.finish} finish.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[#047857] font-bold block mb-1 text-[11px] uppercase tracking-wider">
                3. Walkway Clearances
              </span>
              <p className="text-[#475569] leading-relaxed text-[11px]">
                Checks circulation flow for standard 90cm walkways without physical obstruction.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[#047857] font-bold block mb-1 text-[11px] uppercase tracking-wider">
                4. Action Checklist
              </span>
              <p className="text-[#475569] leading-relaxed text-[11px]">
                Generates a step-by-step physical tape measurement checklist before purchasing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FULL STRUCTURED ROOM ANALYSIS DASHBOARD */}
      {structuredData && !isAnalyzing && (
        <RoomAnalysisDashboard
          data={structuredData}
          product={product}
          customization={customization}
          onReanalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}
