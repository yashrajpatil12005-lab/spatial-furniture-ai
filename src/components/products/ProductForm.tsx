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
      setError(err.message || 'An error occurred saving the product.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Product Name *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700">Category *</label>
          <select name="category" required value={formData.category} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2">
            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Price ($) *</label>
          <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Brand</label>
          <input type="text" name="brand" value={formData.brand} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700">Material</label>
          <input type="text" name="material" value={formData.material} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Style</label>
          <input type="text" name="style" value={formData.style} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Width (cm) *</label>
          <input type="number" name="width" required min="1" value={formData.width} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Height (cm) *</label>
          <input type="number" name="height" required min="1" value={formData.height} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Depth (cm) *</label>
          <input type="number" name="depth" required min="1" value={formData.depth} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Stock Quantity *</label>
          <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Image URL</label>
          <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">3D Model URL (Phase 4 Placeholder)</label>
          <input type="url" name="model3dUrl" value={formData.model3dUrl} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2" />
        </div>
      </div>
      
      <div className="pt-5 border-t border-neutral-200 flex justify-end space-x-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
