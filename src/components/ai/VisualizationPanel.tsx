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
    
    setLoadingPhase('Analyzing your room...');

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
        throw new Error(data.error || data.message || 'Analysis failed.');
      }

      setAnalysisResult(data);
      // Save for use in Recommendation Engine
      if (data.analysis) {
        localStorage.setItem('spatialai-room-analysis', data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while communicating with AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage) return;

    setIsGeneratingImage(true);
    setError('');
    setGeneratedImage(null);
    
    setLoadingPhase('Generating furniture visualization...');

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
        throw new Error(data.error || 'Generation failed.');
      }

      setGeneratedImage(data.image);
    } catch (err: any) {
      setError(err.message || 'Network error occurred while generating the image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // State 1: Show Result if Generated Image exists
  if (generatedImage) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
          <span className="bg-emerald-100 text-emerald-700 p-1 rounded-md mr-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          AI Visualization Result
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-2">Original Room</h3>
            <div className="rounded-lg overflow-hidden border border-neutral-200 aspect-h-3 aspect-w-4 bg-neutral-100">
              {previewUrl && <img src={previewUrl} alt="Original" className="object-cover w-full h-full" />}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-2">AI Generated Visualization</h3>
            <div className="rounded-lg overflow-hidden border-2 border-emerald-500 aspect-h-3 aspect-w-4 bg-neutral-100 shadow-md relative group">
              <img src={generatedImage} alt="Generated Visualization" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
        
        {analysisResult && (
          <div className="bg-white p-4 rounded-md border border-neutral-200 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">AI Spatial Analysis</h4>
            <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {analysisResult.analysis}
            </div>
          </div>
        )}
        
        <div className="border-t border-neutral-200 pt-5">
          <button 
            onClick={() => { setGeneratedImage(null); setAnalysisResult(null); }}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-md shadow-sm hover:bg-neutral-50 transition-colors"
          >
            Generate Again
          </button>
        </div>
      </div>
    );
  }

  // State 2: Input / Loading
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mt-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-2">Visualize in My Room</h2>
      <p className="text-sm text-neutral-500 mb-6">Upload a photo of your room to see how this furniture might look.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Area */}
        <div className="space-y-4">
          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 hover:border-emerald-500 transition-colors bg-neutral-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-10 h-10 text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-emerald-600 mb-1">Click to upload room image</p>
              <p className="text-xs text-neutral-500">JPEG, PNG, WebP (Max 5MB)</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group aspect-h-3 aspect-w-4">
              <img src={previewUrl} alt="Room Preview" className="object-cover w-full h-full" />
              {!isAnalyzing && !isGeneratingImage && (
                <button 
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 bg-white/90 text-neutral-900 rounded-full p-1.5 shadow hover:bg-white transition-colors"
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
        <div className="flex flex-col space-y-6">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 mb-2">Target Furniture</h3>
            <p className="text-sm font-medium text-emerald-700 mb-4">{product.name}</p>
            
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">Current Customization</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li><span className="text-neutral-400 mr-2">•</span> Color: {customization.color}</li>
              <li><span className="text-neutral-400 mr-2">•</span> Material: {customization.material}</li>
              <li><span className="text-neutral-400 mr-2">•</span> Finish: {customization.finish}</li>
              <li><span className="text-neutral-400 mr-2">•</span> Dim: {customization.width}×{customization.height}×{customization.depth} cm</li>
            </ul>
          </div>

          <div className="flex-grow flex flex-col justify-end space-y-3">
            {analysisResult && !isGeneratingImage && !isAnalyzing && (
              <div className="bg-white p-3 rounded-md border border-neutral-200 shadow-sm">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">AI Spatial Analysis Ready</h4>
                <div className="text-xs text-neutral-600 line-clamp-2">
                  {analysisResult.analysis}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing || isGeneratingImage}
              className={`w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold transition-colors ${
                !selectedImage || isGeneratingImage
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-transparent' 
                  : isAnalyzing
                    ? 'bg-neutral-200 text-neutral-600 cursor-wait border border-transparent'
                    : 'bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {isAnalyzing ? `Analyzing...` : `Analyze Room`}
            </button>
            
            <button 
              onClick={handleGenerateImage}
              disabled={!selectedImage || isAnalyzing || isGeneratingImage}
              className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                !selectedImage || isAnalyzing
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-transparent' 
                  : isGeneratingImage
                    ? 'bg-emerald-600 text-white cursor-wait border border-transparent opacity-90'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent'
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
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Generate AI Visualization
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
