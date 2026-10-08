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

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Customize Furniture</h2>
      
      <div className="space-y-6">
        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {CUSTOMIZATION_COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleChange('color', color)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  customization.color === color 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-medium' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Material</label>
          <select 
            value={customization.material}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
          >
            {CUSTOMIZATION_MATERIALS.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        {/* Finish Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Finish</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CUSTOMIZATION_FINISHES.map(finish => (
              <button
                key={finish}
                onClick={() => handleChange('finish', finish)}
                className={`px-3 py-2 rounded-md text-sm text-center border transition-colors ${
                  customization.finish === finish 
                    ? 'border-emerald-600 bg-emerald-600 text-white font-medium' 
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {finish}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dimensions (cm)
          </label>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              value={customization.width} 
              onChange={(e) => handleChange('width', Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="W"
            />
            <span className="text-neutral-500">×</span>
            <input 
              type="number" 
              value={customization.height} 
              onChange={(e) => handleChange('height', Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="H"
            />
            <span className="text-neutral-500">×</span>
            <input 
              type="number" 
              value={customization.depth} 
              onChange={(e) => handleChange('depth', Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="D"
            />
          </div>
        </div>

        {/* Configuration Summary & Actions */}
        <div className="pt-6 border-t border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Customized Configuration</h3>
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-neutral-500">Color:</dt>
              <dd className="font-medium text-neutral-900">{customization.color}</dd>
              
              <dt className="text-neutral-500">Material:</dt>
              <dd className="font-medium text-neutral-900">{customization.material}</dd>
              
              <dt className="text-neutral-500">Finish:</dt>
              <dd className="font-medium text-neutral-900">{customization.finish}</dd>
              
              <dt className="text-neutral-500">Dimensions:</dt>
              <dd className="font-medium text-neutral-900">{customization.width} × {customization.height} × {customization.depth} cm</dd>
            </dl>
          </div>
          <button 
            onClick={handleReset}
            className="w-full py-2 px-4 border border-neutral-300 text-neutral-700 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-neutral-50 transition-colors"
          >
            Reset to Default
          </button>
        </div>

      </div>
    </div>
  );
}
