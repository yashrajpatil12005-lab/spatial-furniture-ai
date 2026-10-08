import { createProduct } from './index';
import { Product } from '../types';

const DEMO_PRODUCTS = [
  {
    name: 'Modern 3-Seater Sofa',
    category: 'Sofa',
    description: 'A sleek, modern 3-seater sofa with premium fabric and minimalist design.',
    price: 899.99,
    brand: 'LuxeLiving',
    material: 'Fabric, Wood',
    color: 'Charcoal Grey',
    style: 'Modern',
    width: 210,
    height: 85,
    depth: 90,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    model3dUrl: '',
  },
  {
    name: 'Scandinavian Lounge Chair',
    category: 'Chair',
    description: 'Ergonomic scandinavian lounge chair perfect for reading corners.',
    price: 349.50,
    brand: 'NordicWood',
    material: 'Wood, Wool',
    color: 'Mustard Yellow',
    style: 'Scandinavian',
    width: 75,
    height: 95,
    depth: 80,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800',
    model3dUrl: '',
  },
  {
    name: 'King Size Wooden Bed',
    category: 'Bed',
    description: 'Solid oak king size bed frame with headboard.',
    price: 1199.00,
    brand: 'OakHeritage',
    material: 'Solid Oak',
    color: 'Natural Wood',
    style: 'Classic',
    width: 195,
    height: 110,
    depth: 210,
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    model3dUrl: '',
  },
  {
    name: 'Minimal Study Table',
    category: 'Study Table',
    description: 'Clean minimal study desk with hidden cable management.',
    price: 249.00,
    brand: 'WorkSpace',
    material: 'Engineered Wood, Steel',
    color: 'Matte White',
    style: 'Minimalist',
    width: 120,
    height: 75,
    depth: 60,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800',
    model3dUrl: '',
  },
  {
    name: '6-Seater Dining Table',
    category: 'Dining Table',
    description: 'Spacious 6-seater dining table perfect for family gatherings.',
    price: 799.00,
    brand: 'DineRight',
    material: 'Walnut Wood',
    color: 'Dark Walnut',
    style: 'Mid-Century',
    width: 180,
    height: 76,
    depth: 90,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=800',
    model3dUrl: '',
  }
];

export const seedDemoProducts = async (retailerId: string) => {
  console.log("Seeding demo products for retailer:", retailerId);
  try {
    const promises = DEMO_PRODUCTS.map(product => 
      createProduct({ ...product, retailerId })
    );
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
};
