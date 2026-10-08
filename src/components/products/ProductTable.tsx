'use client';

import { Product } from '@/lib/types';
import Link from 'next/link';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
        <p className="text-sm text-neutral-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-neutral-300">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-900 sm:pl-6">Product</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Category</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Price</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Stock</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {product.imageUrl ? (
                      <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-neutral-200 flex items-center justify-center">
                        <span className="text-neutral-500 text-xs">No img</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-neutral-900">{product.name}</div>
                    <div className="text-neutral-500">{product.brand}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {product.category}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">${product.price.toFixed(2)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-neutral-900'}>
                  {product.stock}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link href={`/retailer/products/${product.id}/edit`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                  Edit
                </Link>
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this product?')) {
                      onDelete(product.id!);
                    }
                  }} 
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
