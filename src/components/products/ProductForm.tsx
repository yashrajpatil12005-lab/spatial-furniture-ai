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
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] font-medium">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            1. Basic Information
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">Primary product identification and public naming</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ergonomic Velvet Lounge Chair"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of craft, ergonomics, and materials..."
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            2. Product Details &amp; Aesthetics
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">Attributes leveraged by Gemini AI for recommendations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. NordicWood, LuxeLiving"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="e.g. Solid Oak, Velvet, Steel"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Charcoal Grey, Beige"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Design Style
            </label>
            <input
              type="text"
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="e.g. Modern, Minimalist, Scandinavian"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Dimensions & Inventory */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            3. Dimensions &amp; Inventory
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">Physical dimensions for AR spatial scale and price calculation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Width (cm) *
            </label>
            <input
              type="number"
              name="width"
              required
              min="1"
              value={formData.width}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Height (cm) *
            </label>
            <input
              type="number"
              name="height"
              required
              min="1"
              value={formData.height}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Depth (cm) *
            </label>
            <input
              type="number"
              name="depth"
              required
              min="1"
              value={formData.depth}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
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
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Media & 3D Assets */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            4. Media &amp; 3D Assets
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">High-resolution image URL and spatial asset URLs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Image URL (Public HTTPS)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              3D Model URL (GLB / USDZ)
            </label>
            <input
              type="url"
              name="model3dUrl"
              value={formData.model3dUrl}
              onChange={handleChange}
              placeholder="https://models.example.com/item.glb"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 5. Actions */}
      <div className="pt-2 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#111827] bg-white hover:bg-[#F8FAFC] transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
