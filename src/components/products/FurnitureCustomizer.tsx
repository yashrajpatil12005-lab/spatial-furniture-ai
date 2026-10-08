'use client';

import { useState, useEffect } from 'react';
import { Product, FurnitureCustomization } from '@/lib/types';
import { CUSTOMIZATION_COLORS, CUSTOMIZATION_MATERIALS, CUSTOMIZATION_FINISHES } from '@/lib/constants';

interface FurnitureCustomizerProps {
  product: Product;
  onCustomizationChange: (customization: FurnitureCustomization) => void;
}

export default function FurnitureCustomizer({ product, onCustomizationChange }: FurnitureCustomizerProps) {
  const defaultCustomization: FurnitureCustomization = {
    productId: product.id!,
    color: CUSTOMIZATION_COLORS.includes(product.color as any) ? product.color : CUSTOMIZATION_COLORS[0],
    material: CUSTOMIZATION_MATERIALS.includes(product.material as any) ? product.material : CUSTOMIZATION_MATERIALS[0],
    finish: CUSTOMIZATION_FINISHES[0],
    width: product.width,
    height: product.height,
    depth: product.depth,
  };

  const [customization, setCustomization] = useState<FurnitureCustomization>(defaultCustomization);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (!product.id) return;
    const storageKey = `spatialai-customization-${product.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomization(parsed);
      } catch (e) {
        console.error('Error parsing saved customization', e);
      }
    }
    setIsLoaded(true);
  }, [product.id]);

  // Save to local storage & notify parent whenever customization changes
  useEffect(() => {
    if (!isLoaded || !product.id) return;
    const storageKey = `spatialai-customization-${product.id}`;
    localStorage.setItem(storageKey, JSON.stringify(customization));
    onCustomizationChange(customization);
  }, [customization, isLoaded, product.id, onCustomizationChange]);

  const handleReset = () => {
    setCustomization(defaultCustomization);
  };

  const handleChange = (field: keyof FurnitureCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  const getColorHex = (colorName: string) => {
    const c = colorName.toLowerCase();
    if (c === 'beige') return '#d4be9b';
    if (c === 'black') return '#171717';
    if (c === 'white') return '#ffffff';
    if (c === 'grey' || c === 'gray') return '#6b7280';
    if (c === 'brown') return '#78350f';
    if (c === 'blue') return '#1d4ed8';
    return '#9ca3af';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Customization Studio</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Configure fabric, color swatches, and spatial dimensions</p>
        </div>
        <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
          Interactive 3D Ready
        </span>
      </div>
      
      <div className="space-y-5 mt-5">
        {/* Color Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
            Color Palette
          </label>
          <div className="flex flex-wrap gap-2">
            {CUSTOMIZATION_COLORS.map(color => {
              const isSelected = customization.color === color;
              const hex = getColorHex(color);
              return (
                <button
                  key={color}
                  onClick={() => handleChange('color', color)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected 
                      ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] ring-1 ring-[#10B981] font-semibold' 
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:text-[#111827] hover:border-slate-300'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-sm" 
                    style={{ backgroundColor: hex }}
                  />
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
            Material Texture
          </label>
          <select 
            value={customization.material}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full rounded-xl bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
          >
            {CUSTOMIZATION_MATERIALS.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        {/* Finish Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
            Finish &amp; Coating
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CUSTOMIZATION_FINISHES.map(finish => {
              const isSelected = customization.finish === finish;
              return (
                <button
                  key={finish}
                  onClick={() => handleChange('finish', finish)}
                  className={`px-3 py-2 rounded-xl text-xs text-center border font-medium transition-all ${
                    isSelected 
                      ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] font-semibold ring-1 ring-[#10B981]' 
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:text-[#111827] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {finish}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
            Dimensions (Width &times; Height &times; Depth in cm)
          </label>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              value={customization.width} 
              onChange={(e) => handleChange('width', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="W"
            />
            <span className="text-[#94A3B8] font-bold">&times;</span>
            <input 
              type="number" 
              value={customization.height} 
              onChange={(e) => handleChange('height', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="H"
            />
            <span className="text-[#94A3B8] font-bold">&times;</span>
            <input 
              type="number" 
              value={customization.depth} 
              onChange={(e) => handleChange('depth', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="D"
            />
          </div>
        </div>

        {/* Configuration Summary & Reset Action */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="text-xs text-[#047857] bg-[#ECFDF5] px-3 py-1.5 rounded-lg border border-[#A7F3D0] truncate font-medium">
            {customization.color} &bull; {customization.material} &bull; {customization.finish}
          </div>
          <button 
            onClick={handleReset}
            className="py-1.5 px-3 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:text-[#111827] bg-white hover:bg-[#F8FAFC] transition-colors flex-shrink-0"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
