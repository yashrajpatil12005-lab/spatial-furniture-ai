
'use client';

import { useState } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [modelProgress, setModelProgress] = useState(0);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const uploadAsset = (
    file: File,
    assetType: 'images' | 'models',
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!user) {
        reject(new Error('Please log in before uploading files.'));
        return;
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      let contentType = file.type;

      if (assetType === 'images') {
        const allowed = ['png', 'jpg', 'jpeg', 'webp'];

        if (!allowed.includes(extension)) {
          reject(new Error('Choose a PNG, JPG, or WEBP image.'));
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('Image size must be 10 MB or less.'));
          return;
        }

        contentType =
          extension === 'png'
            ? 'image/png'
            : extension === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
      } else {
        if (!['glb', 'usdz'].includes(extension)) {
          reject(new Error('Choose a GLB or USDZ 3D model.'));
          return;
        }

        if (file.size > 100 * 1024 * 1024) {
          reject(new Error('3D model size must be 100 MB or less.'));
          return;
        }

        contentType =
          extension === 'glb'
            ? 'model/gltf-binary'
            : 'model/vnd.usdz+zip';
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      const filePath = `product-media/${user.uid}/${assetType}/${Date.now()}-${safeName}`;

      const storageRef = ref(storage, filePath);

      const task = uploadBytesResumable(storageRef, file, {
        contentType,
      });

      task.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );

          onProgress(progress);
        },
        reject,
        async () => {
          try {
            const downloadURL = await getDownloadURL(task.snapshot.ref);
            resolve(downloadURL);
          } catch (uploadError) {
            reject(uploadError);
          }
        }
      );
    });
  };

  // Corrected product submission function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please log in before saving a product.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payload from existing form data
      const payload = { ...formData };

      // Upload selected image
      if (imageFile) {
        payload.imageUrl = await uploadAsset(
          imageFile,
          'images',
          setImageProgress
        );
      }

      // Upload selected 3D model
      if (modelFile) {
        payload.model3dUrl = await uploadAsset(
          modelFile,
          'models',
          setModelProgress
        );
      }

      // Create or update product
      if (initialData?.id) {
        await updateProduct(initialData.id, payload);
      } else {
        await createProduct({
          ...payload,
          retailerId: user.uid,
        });
      }

      router.push('/retailer/products');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'An error occurred while saving the furniture item.';

      setError(msg);
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
          <p className="text-xs text-[#64748B] mt-0.5">
            Primary product identification and public naming
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              id="product-name"
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
            <label htmlFor="product-category" className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              id="product-category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-description" className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              id="product-description"
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
          <p className="text-xs text-[#64748B] mt-0.5">
            Attributes leveraged by Gemini AI for recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {[
            { name: 'brand', label: 'Brand / Manufacturer', placeholder: 'e.g. NordicWood, LuxeLiving' },
            { name: 'material', label: 'Material', placeholder: 'e.g. Solid Oak, Velvet, Steel' },
            { name: 'color', label: 'Color', placeholder: 'e.g. Charcoal Grey, Beige' },
            { name: 'style', label: 'Design Style', placeholder: 'e.g. Modern, Minimalist, Scandinavian' },
          ].map((field) => (
            <div key={field.name}>
              <label htmlFor={`product-${field.name}`} className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
                {field.label}
              </label>
              <input
                id={`product-${field.name}`}
                type="text"
                name={field.name}
                value={formData[field.name as 'brand' | 'material' | 'color' | 'style']}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Dimensions & Inventory */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            3. Dimensions &amp; Inventory
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Physical dimensions for AR spatial scale and price calculation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {[
            { name: 'width', label: 'Width (cm) *', min: '1' },
            { name: 'height', label: 'Height (cm) *', min: '1' },
            { name: 'depth', label: 'Depth (cm) *', min: '1' },
            { name: 'stock', label: 'Stock Quantity *', min: '0' },
            { name: 'price', label: 'Price (₹ INR) *', min: '0' },
          ].map((field) => (
            <div key={field.name} className={field.name === 'price' ? 'sm:col-span-2' : ''}>
              <label htmlFor={`product-${field.name}`} className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1.5">
                {field.label}
              </label>
              <input
                id={`product-${field.name}`}
                type="number"
                name={field.name}
                required
                min={field.min}
                step={field.name === 'price' ? '0.01' : '1'}
                value={formData[field.name as 'width' | 'height' | 'depth' | 'stock' | 'price']}
                onChange={handleChange}
                className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Media & 3D Assets */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 card-shadow space-y-5">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            4. Media &amp; 3D Assets
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Upload product images and 3D furniture models directly.
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider">
            Product Image
          </label>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] || null);
              setImageProgress(0);
            }}
            className="block w-full text-xs text-[#64748B] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#ECFDF5] file:text-[#047857] file:font-semibold file:cursor-pointer hover:file:bg-[#D1FAE5]"
          />

          <p className="text-xs text-[#94A3B8]">
            PNG, JPG, WEBP · Maximum 10 MB
          </p>

          {imageFile && (
            <>
              <p className="text-xs text-[#047857]">
                Selected: {imageFile.name}
              </p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${imageProgress}%` }} />
              </div>
            </>
          )}

          {formData.imageUrl && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#64748B]">
                Current / uploaded image
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt="Product preview"
                className="h-32 w-32 object-cover rounded-xl border border-[#E2E8F0]"
              />
            </div>
          )}

          <div>
            <label htmlFor="product-imageUrl" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Or paste Image URL
            </label>
            <input
              id="product-imageUrl"
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/furniture.png"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] shadow-sm"
            />
          </div>
        </div>

        <div className="border-t border-[#E2E8F0]" />

        {/* 3D Model Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider">
            3D Furniture Model
          </label>

          <input
            type="file"
            accept=".glb,.usdz,model/gltf-binary,model/vnd.usdz+zip"
            onChange={(e) => {
              setModelFile(e.target.files?.[0] || null);
              setModelProgress(0);
            }}
            className="block w-full text-xs text-[#64748B] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#ECFDF5] file:text-[#047857] file:font-semibold file:cursor-pointer hover:file:bg-[#D1FAE5]"
          />

          <p className="text-xs text-[#94A3B8]">
            GLB, USDZ · Maximum 100 MB
          </p>

          {modelFile && (
            <>
              <p className="text-xs text-[#047857]">
                Selected: {modelFile.name}
              </p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${modelProgress}%` }} />
              </div>
            </>
          )}

          {formData.model3dUrl && (
            <p className="text-xs text-[#047857] break-all">
              Current model: {formData.model3dUrl}
            </p>
          )}

          <div>
            <label htmlFor="product-model3dUrl" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Or paste 3D Model URL
            </label>
            <input
              id="product-model3dUrl"
              type="url"
              name="model3dUrl"
              value={formData.model3dUrl}
              onChange={handleChange}
              placeholder="https://models.example.com/item.glb"
              className="w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] shadow-sm"
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
          {loading
            ? 'Saving...'
            : isEditing
              ? 'Update Product'
              : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
