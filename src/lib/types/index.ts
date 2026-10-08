import { ProductCategory } from '../constants';

export interface Product {
  id?: string; // Optional for creation
  name: string;
  category: ProductCategory | string;
  description: string;
  price: number;
  brand: string;
  material: string;
  color: string;
  style: string;
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
  stock: number;
  imageUrl: string;
  model3dUrl: string;
  retailerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureCustomization {
  productId: string;
  color: string;
  material: string;
  finish: string;
  width: number;
  height: number;
  depth: number;
}
