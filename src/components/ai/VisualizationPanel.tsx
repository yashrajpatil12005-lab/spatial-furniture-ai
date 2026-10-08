'use client';

import { useState, useRef } from 'react';
import { Product, FurnitureCustomization } from '@/lib/types';
import { VisualizationResponse } from '@/lib/ai/types';

interface VisualizationPanelProps {
  product: Product;
  customization: FurnitureCustomization;
}

export default function VisualizationPanel({ product, customization }: VisualizationPanelProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  
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
        setError('Image file is too large (max 5MB).');
        return;
      }
      
      setError('');
      setAnalysisResult(null); 
      setGeneratedImage(null);
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
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

    setIsAnalyzing(true);
    setError('');
    setLoadingPhase('Analyzing spatial lighting and layout...');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('product', JSON.stringify(product));
      formData.append('customization', JSON.stringify(customization));

      const res = await fetch('/api/ai/visualize', {
        method: 'POST',
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
    } catch (err: any) {
      setError(err.message || 'Error occurred communicating with AI service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage) return;

    setIsGeneratingImage(true);
    setError('');
    setGeneratedImage(null);
    setLoadingPhase('Synthesizing furniture placement visualization...');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('product', JSON.stringify(product));
      formData.append('customization', JSON.stringify(customization));

      const res = await fetch('/api/ai/generate-visualization', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Visualization generation failed.');
      }

      setGeneratedImage(data.image);
    } catch (err: any) {
      setError(err.message || 'Error occurred while generating the visualization.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // State 1: Show Result if Generated Image exists
  if (generatedImage) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-[#111827]">AI Spatial Visualization Result</h2>
          </div>
          <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
            Generated with Gemini
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Original Room Upload</h3>
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0] aspect-h-3 aspect-w-4 bg-[#F1F5F9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previewUrl && <img src={previewUrl} alt="Original Room" className="object-cover w-full h-full" />}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#047857] uppercase tracking-wider mb-2">Synthesized Placement</h3>
            <div className="rounded-xl overflow-hidden border-2 border-[#10B981] aspect-h-3 aspect-w-4 bg-[#F1F5F9] shadow-md relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImage} alt="Generated Visualization" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
        
        {analysisResult && (
          <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] mb-6">
            <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block"></span>
              <span>Gemini Spatial Reasoning Analysis</span>
            </h4>
            <div className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap">
              {analysisResult.analysis}
            </div>
          </div>
        )}
        
        <div className="border-t border-[#E2E8F0] pt-5">
          <button 
            onClick={() => { setGeneratedImage(null); setAnalysisResult(null); }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#111827] rounded-xl shadow-sm transition-colors"
          >
            Upload Another Photo &rarr;
          </button>
        </div>
      </div>
    );
  }

  // State 2: Input / Loading
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 card-shadow mt-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Visualize in My Room</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Upload a photo of your room to evaluate spatial proportions, lighting, and style harmony.</p>
        </div>
        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0] hidden sm:inline-block">
          AI Vision
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Area */}
        <div className="space-y-4">
          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#10B981] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] hover:bg-white transition-all min-h-[220px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] mb-3 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#111827] mb-1">Click to upload room photo</p>
              <p className="text-[11px] text-[#64748B]">JPEG, PNG, WebP (Max 5MB)</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9] group aspect-h-3 aspect-w-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Room Preview" className="object-cover w-full h-full" />
              {!isAnalyzing && !isGeneratingImage && (
                <button 
                  onClick={handleClearImage}
                  className="absolute top-3 right-3 bg-white/95 hover:bg-white text-[#111827] rounded-full p-2 shadow-md border border-[#E2E8F0] transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleImageSelect}
            disabled={isAnalyzing || isGeneratingImage}
          />
        </div>

        {/* Configuration Summary & Action */}
        <div className="flex flex-col space-y-5">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#047857] mb-1">Target Object</h3>
            <p className="text-sm font-bold text-[#111827] mb-3">{product.name}</p>
            
            <h4 className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Custom Specs</h4>
            <div className="text-xs text-[#64748B] space-y-1">
              <div>Color: <span className="text-[#111827] font-semibold">{customization.color}</span></div>
              <div>Material: <span className="text-[#111827] font-semibold">{customization.material}</span></div>
              <div>Finish: <span className="text-[#111827] font-semibold">{customization.finish}</span></div>
              <div>Dimensions: <span className="text-[#111827] font-semibold">{customization.width}&times;{customization.height}&times;{customization.depth} cm</span></div>
            </div>
          </div>

          <div className="flex-grow flex flex-col justify-end space-y-3">
            {analysisResult && !isGeneratingImage && !isAnalyzing && (
              <div className="bg-[#ECFDF5] p-3.5 rounded-xl border border-[#A7F3D0]">
                <h4 className="text-[11px] font-bold text-[#047857] uppercase tracking-wider mb-1">Spatial Analysis Ready</h4>
                <div className="text-xs text-[#334155] line-clamp-2">
                  {analysisResult.analysis}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing || isGeneratingImage}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                !selectedImage || isGeneratingImage
                  ? 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed' 
                  : isAnalyzing
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] cursor-wait'
                    : 'bg-white hover:bg-[#F8FAFC] text-[#111827] border-[#E2E8F0] hover:border-slate-300 shadow-sm'
              }`}
            >
              {isAnalyzing ? `Analyzing room context...` : `Analyze Room Layout`}
            </button>
            
            <button 
              onClick={handleGenerateImage}
              disabled={!selectedImage || isAnalyzing || isGeneratingImage}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                !selectedImage || isAnalyzing
                  ? 'bg-slate-200 text-slate-400 border border-transparent cursor-not-allowed' 
                  : isGeneratingImage
                    ? 'bg-[#10B981]/80 text-white cursor-wait'
                    : 'bg-[#10B981] hover:bg-[#059669] text-white'
              }`}
            >
              {isGeneratingImage ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingPhase}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Generate AI Spatial Visualization
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
