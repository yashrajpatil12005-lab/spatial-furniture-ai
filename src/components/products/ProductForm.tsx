'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/products';
import { useAuth } from '@/lib/firebase/AuthContext';

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || PRODUCT_CATEGORIES[0],
    description: initialData?.description || '',
    price: initialData?.price || 0,
    brand: initialData?.brand || '',
    material: initialData?.material || '',
    color: initialData?.color || '',
    style: initialData?.style || '',
    width: initialData?.width || 0,
    height: initialData?.height || 0,
    depth: initialData?.depth || 0,
    stock: initialData?.stock || 0,
    imageUrl: initialData?.imageUrl || '',
    model3dUrl: initialData?.model3dUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (initialData?.id) {
        await updateProduct(initialData.id, formData);
      } else {
        await createProduct({ ...formData, retailerId: user.uid });
      }
      router.push('/retailer/products');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the furniture item.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-[#141414] rounded-xl border border-[#27272A] p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#27272A]">
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
            1. Basic Information
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">Primary product identification and public naming</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ergonomic Velvet Lounge Chair"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] transition-colors"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of craft, ergonomics, and materials..."
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="bg-[#141414] rounded-xl border border-[#27272A] p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#27272A]">
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
            2. Product Details &amp; Aesthetics
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">Attributes leveraged by Gemini AI for recommendations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. NordicWood, LuxeLiving"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="e.g. Solid Oak, Velvet, Steel"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Charcoal Grey, Beige"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Design Style
            </label>
            <input
              type="text"
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="e.g. Modern, Minimalist, Scandinavian"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. Dimensions & Inventory */}
      <div className="bg-[#141414] rounded-xl border border-[#27272A] p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#27272A]">
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
            3. Dimensions &amp; Inventory
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">Physical dimensions for AR spatial scale and price calculation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Width (cm) *
            </label>
            <input
              type="number"
              name="width"
              required
              min="1"
              value={formData.width}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Height (cm) *
            </label>
            <input
              type="number"
              name="height"
              required
              min="1"
              value={formData.height}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Depth (cm) *
            </label>
            <input
              type="number"
              name="depth"
              required
              min="1"
              value={formData.depth}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Price (₹ INR) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>
        </div>
      </div>

      {/* 4. Media & 3D Assets */}
      <div className="bg-[#141414] rounded-xl border border-[#27272A] p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#27272A]">
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
            4. Media &amp; 3D Assets
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">High-resolution image URL and spatial asset URLs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Image URL (Public HTTPS)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              3D Model URL (GLB / USDZ)
            </label>
            <input
              type="url"
              name="model3dUrl"
              value={formData.model3dUrl}
              onChange={handleChange}
              placeholder="https://models.example.com/item.glb"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#27272A] px-3.5 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 5. Actions */}
      <div className="pt-2 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#141414] hover:bg-[#181818] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
