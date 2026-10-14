'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Product, FurnitureCustomization } from '@/lib/types';
import { CUSTOMIZATION_COLORS, CUSTOMIZATION_MATERIALS, CUSTOMIZATION_FINISHES } from '@/lib/constants';

interface FurnitureCustomizerProps {
  product: Product;
  onCustomizationChange: (customization: FurnitureCustomization) => void;
}

const emptySubscribe = () => () => {};

export default function FurnitureCustomizer({ product, onCustomizationChange }: FurnitureCustomizerProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const defaultCustomization: FurnitureCustomization = {
    productId: product.id!,
    color: (CUSTOMIZATION_COLORS as readonly string[]).includes(product.color)
      ? product.color
      : CUSTOMIZATION_COLORS[0],
    material: (CUSTOMIZATION_MATERIALS as readonly string[]).includes(product.material)
      ? product.material
      : CUSTOMIZATION_MATERIALS[0],
    finish: CUSTOMIZATION_FINISHES[0],
    width: product.width,
    height: product.height,
    depth: product.depth,
  };

  const [customization, setCustomization] = useState<FurnitureCustomization>(() => {
    if (typeof window !== 'undefined' && product.id) {
      try {
        const saved = localStorage.getItem(`spatialai-customization-${product.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultCustomization, ...parsed };
        }
      } catch (e) {
        console.error('Error parsing saved customization', e);
      }
    }
    return defaultCustomization;
  });

  // Save to local storage & notify parent whenever customization changes
  useEffect(() => {
    if (!product.id) return;
    try {
      const storageKey = `spatialai-customization-${product.id}`;
      localStorage.setItem(storageKey, JSON.stringify(customization));
      onCustomizationChange(customization);
    } catch (e) {
      console.error('Error saving customization', e);
    }
  }, [customization, product.id, onCustomizationChange]);

  const handleReset = () => {
    setCustomization(defaultCustomization);
  };

  const handleChange = (field: keyof FurnitureCustomization, value: string | number) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  if (!isClient) return null; // Avoid hydration mismatch

  const getColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'Charcoal': '#27272a',
      'Beige': '#e7e5e4',
      'Emerald': '#047857',
      'Navy': '#1e3a8a',
      'Natural Oak': '#d4b996',
      'Walnut': '#5c4033',
      'Matte Black': '#18181b',
      'Smoked Ash': '#4a4a4a',
      'Brass': '#d4af37',
      'Chrome': '#e2e8f0'
    };
    return colorMap[colorName] || '#94a3b8';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 card-shadow">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Customization Studio</h2>
          <p className="text-xs text-[#64748B]">Tailor materials, colors, and dimensions</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-[#047857] hover:text-[#059669] transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      <div className="space-y-6">
        {/* Colors */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
            Color: <span className="text-[#111827]">{customization.color}</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {CUSTOMIZATION_COLORS.map(color => {
              const isSelected = customization.color === color;
              const hex = getColorHex(color);
              return (
                <button
                  key={color}
                  onClick={() => handleChange('color', color)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected 
                      ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] shadow-xs' 
                      : 'border-[#E2E8F0] hover:border-slate-300 text-[#334155]'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-2xs" 
                    style={{ backgroundColor: hex }}
                  />
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Materials */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
            Material: <span className="text-[#111827]">{customization.material}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CUSTOMIZATION_MATERIALS.map(material => (
              <button
                key={material}
                onClick={() => handleChange('material', material)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                  customization.material === material
                    ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] shadow-xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 text-[#334155]'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        {/* Finishes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
            Finish: <span className="text-[#111827]">{customization.finish}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CUSTOMIZATION_FINISHES.map(finish => (
              <button
                key={finish}
                onClick={() => handleChange('finish', finish)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                  customization.finish === finish
                    ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] shadow-xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 text-[#334155]'
                }`}
              >
                {finish}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Dimensions */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
            Custom Dimensions (cm)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">Width</label>
              <input
                type="number"
                min="30"
                max="400"
                value={customization.width}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">Height</label>
              <input
                type="number"
                min="30"
                max="300"
                value={customization.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">Depth</label>
              <input
                type="number"
                min="30"
                max="300"
                value={customization.depth}
                onChange={(e) => handleChange('depth', Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
