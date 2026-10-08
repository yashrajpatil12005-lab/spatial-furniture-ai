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
    <div className="bg-[#141414] border border-[#27272A] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5]">Customization Studio</h2>
          <p className="text-xs text-[#71717A] mt-0.5">Configure fabric, color swatches, and spatial dimensions</p>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
          Interactive
        </span>
      </div>
      
      <div className="space-y-5 mt-5">
        {/* Color Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected 
                      ? 'border-[#10B981] bg-[#10B981]/10 text-white ring-1 ring-[#10B981]' 
                      : 'border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5] hover:border-slate-600'
                  }`}
                >
                  <span 
                    className="w-3 h-3 rounded-full border border-white/20 inline-block" 
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
          <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
            Material Texture
          </label>
          <select 
            value={customization.material}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] transition-colors"
          >
            {CUSTOMIZATION_MATERIALS.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        {/* Finish Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
            Finish &amp; Coating
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CUSTOMIZATION_FINISHES.map(finish => {
              const isSelected = customization.finish === finish;
              return (
                <button
                  key={finish}
                  onClick={() => handleChange('finish', finish)}
                  className={`px-3 py-2 rounded-lg text-xs text-center border font-medium transition-all ${
                    isSelected 
                      ? 'border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-semibold' 
                      : 'border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#181818]'
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
          <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
            Dimensions (Width &times; Height &times; Depth in cm)
          </label>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              value={customization.width} 
              onChange={(e) => handleChange('width', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="W"
            />
            <span className="text-[#71717A]">&times;</span>
            <input 
              type="number" 
              value={customization.height} 
              onChange={(e) => handleChange('height', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="H"
            />
            <span className="text-[#71717A]">&times;</span>
            <input 
              type="number" 
              value={customization.depth} 
              onChange={(e) => handleChange('depth', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] text-center [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="D"
            />
          </div>
        </div>

        {/* Configuration Summary & Reset Action */}
        <div className="pt-4 border-t border-[#27272A] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#A1A1AA] truncate">
            {customization.color} &bull; {customization.material} &bull; {customization.finish}
          </div>
          <button 
            onClick={handleReset}
            className="py-1.5 px-3 rounded-lg border border-[#27272A] text-[11px] font-medium text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#0A0A0A] hover:bg-[#181818] transition-colors flex-shrink-0"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
