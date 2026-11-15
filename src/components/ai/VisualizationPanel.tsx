
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

export default function VisualizationPanel({
  product,
  customization,
}: VisualizationPanelProps) {
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<VisualizationResponse | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [hasSharingConsent, setHasSharingConsent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select and validate room image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, WebP).');
        return;
      }

      if (file.size === 0 || file.size > 4.5 * 1024 * 1024) {
        setError('Image file must be larger than 0 and no bigger than 4.5MB.');
        return;
      }

      setError('');
      setAnalysisResult(null);
      setGeneratedImage(null);
      setSelectedImage(file);
      setHasSharingConsent(false);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image and related state
  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError('');
    setAnalysisResult(null);
    setGeneratedImage(null);
    setHasSharingConsent(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze room using authenticated Gemini API
  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select a room photo first.');
      return;
    }

    if (!user) {
      setError('Please sign in to analyze your room layout.');
      return;
    }

    if (!user.emailVerified) {
      setError('Please verify your email before analyzing your room.');
      return;
    }

    if (!hasSharingConsent) {
      setError('Please provide consent before sharing your room photo.');
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

      // IMPORTANT: Send consent to the API.
      formData.append('sharingConsent', 'true');

      const res = await fetch('/api/ai/visualize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data: VisualizationResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || 'Spatial analysis failed.'
        );
      }

      setAnalysisResult(data);

      if (data.analysis) {
        localStorage.setItem('spatialai-room-analysis', data.analysis);
      }

      setTimeout(() => {
        const el = document.getElementById('spatial-room-analysis-report');

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error occurred communicating with AI service.';

      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolve structured analysis safely
  const structuredData =
    analysisResult?.structuredAnalysis ||
    (analysisResult?.analysis
      ? validateAndNormalizeRoomAnalysis(analysisResult.analysis)
      : null);

  // Generated image view
  if (generatedImage) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              AI Spatial Visualization Result
            </h2>
            <p className="text-xs text-[#64748B]">
              Synthesized concept for {product.name}
            </p>
          </div>

          <button
            onClick={() => setGeneratedImage(null)}
            className="text-xs font-medium text-[#475569] hover:text-[#111827]"
          >
            Back to Layout View
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold mb-2">
              Original Room Photo
            </h3>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Original Room"
                className="rounded-xl w-full object-cover"
              />
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2">
              Synthesized Placement Concept
            </h3>
            <img
              src={generatedImage}
              alt="Generated Visualization"
              className="rounded-xl w-full object-cover"
            />
          </div>
        </div>

        {structuredData && (
          <RoomAnalysisDashboard
            data={structuredData}
            product={product}
            customization={customization}
            onReanalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        <button
          onClick={handleClearImage}
          className="mt-6 px-5 py-3 bg-[#10B981] text-white rounded-xl text-xs font-semibold"
        >
          Upload Another Photo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">
            Visualize & Analyze in My Room
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Upload a room photo for AI-powered spatial analysis.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
          Gemini 2.5 Flash Vision
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#B91C1C]">
          {error}
        </div>
      )}

      {/* Upload and Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Image Upload */}
        <div className="space-y-4">
          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#10B981] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] min-h-[240px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-xs font-semibold text-[#111827] mb-2">
                Click to upload your room photo
              </p>

              <p className="text-[11px] text-[#64748B]">
                JPEG, PNG, WebP (Maximum 4.5MB)
              </p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0]">
              <img
                src={previewUrl}
                alt="Room Preview"
                className="object-cover w-full max-h-[350px]"
              />

              {!isAnalyzing && (
                <button
                  onClick={handleClearImage}
                  className="absolute top-3 right-3 bg-white text-red-600 px-3 py-2 rounded-lg text-xs shadow"
                >
                  Remove Photo
                </button>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            disabled={isAnalyzing}
          />
        </div>

        {/* Product Information */}
        <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#047857] uppercase">
            Target Furniture Piece
          </span>

          <h3 className="text-base font-extrabold text-[#111827] mt-2 mb-4">
            {product.name}
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl">
              <span className="text-[#94A3B8] block">Color</span>
              <strong>{customization.color}</strong>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <span className="text-[#94A3B8] block">Material</span>
              <strong>{customization.material}</strong>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <span className="text-[#94A3B8] block">Finish</span>
              <strong>{customization.finish}</strong>
            </div>

            <div className="bg-white p-3 rounded-xl">
              <span className="text-[#94A3B8] block">Dimensions</span>
              <strong>
                {customization.width} × {customization.height} × {customization.depth} cm
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Consent */}
      <div className="mt-6 p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasSharingConsent}
            onChange={(e) => setHasSharingConsent(e.target.checked)}
            disabled={isAnalyzing}
            className="mt-1 h-4 w-4 accent-[#10B981] shrink-0"
          />

          <span className="text-xs leading-5 text-[#475569]">
            <strong className="text-[#111827]">
              Room Photo Privacy & Sharing Consent
            </strong>
            <br />
            I understand that my uploaded room photo and AI analysis
            will be stored privately and can be viewed by Spatial
            Furniture AI administrators and registered retailers.
            I agree to this sharing for furniture visualization
            and assistance.
          </span>
        </label>
      </div>

      {/* Analyze Button */}
      <div className="mt-5 space-y-3">
        {!user && (
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF]">
            Please sign in to analyze your room.
            <Link href="/login" className="font-bold underline ml-2">
              Sign In
            </Link>
          </div>
        )}

        {user && !user.emailVerified && (
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
            Please verify your email before analyzing your room.
            <Link href="/verify-email" className="font-bold underline ml-2">
              Verify Email
            </Link>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={
            !selectedImage ||
            !hasSharingConsent ||
            !user ||
            !user.emailVerified ||
            isAnalyzing
          }
          className="w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed bg-[#10B981] hover:bg-[#059669] text-white"
        >
          {isAnalyzing
            ? 'Evaluating Room Layout...'
            : analysisResult
              ? 'Re-Analyze Room Layout'
              : 'Analyze Room Layout with Gemini'}
        </button>

        <p className="text-[11px] text-center text-[#64748B]">
          Your photo is shared with registered retailers only after you provide consent.
        </p>
      </div>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <div className="mt-8 p-6 bg-[#F0FDF4] border border-[#A7F3D0] rounded-2xl animate-pulse">
          <h3 className="text-sm font-bold text-[#111827]">
            Gemini Spatial Analysis in Progress
          </h3>

          <p className="text-xs text-[#047857] mt-2">
            Evaluating room geometry, lighting, scale fit, and spatial compatibility...
          </p>
        </div>
      )}

      {/* Analysis Report */}
      {structuredData && !isAnalyzing && (
        <div className="mt-8" id="spatial-room-analysis-report">
          <RoomAnalysisDashboard
            data={structuredData}
            product={product}
            customization={customization}
            onReanalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}
    </div>
  );
}
