import { describe, it, expect } from 'vitest';
import { Product } from '@/lib/types';

describe('Product Catalog Filtering & Sorting Logic', () => {
  const sampleProducts: Product[] = [
    {
      id: 'p1',
      name: 'Aura Minimalist Armchair',
      category: 'Chairs',
      description: 'Comfortable armchair',
      brand: 'Nordic Living',
      style: 'Minimalist',
      material: 'Oak Wood',
      color: 'Light Oak',
      price: 15000,
      width: 70,
      height: 80,
      depth: 75,
      stock: 8,
      imageUrl: 'https://example.com/p1.jpg',
      model3dUrl: 'https://example.com/p1.glb',
      retailerId: 'ret-1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'p2',
      name: 'Zenith Velvet Sectional',
      category: 'Sofas',
      description: 'Luxury sectional sofa',
      brand: 'Luxe Interiors',
      style: 'Contemporary',
      material: 'Velvet',
      color: 'Emerald Green',
      price: 68000,
      width: 240,
      height: 85,
      depth: 110,
      stock: 2,
      imageUrl: 'https://example.com/p2.jpg',
      model3dUrl: 'https://example.com/p2.glb',
      retailerId: 'ret-2',
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
    },
    {
      id: 'p3',
      name: 'Solace Dining Table',
      category: 'Tables',
      description: 'Handcrafted teak table',
      brand: 'Artisan Woodcraft',
      style: 'Rustic',
      material: 'Reclaimed Teak',
      color: 'Warm Brown',
      price: 42000,
      width: 180,
      height: 76,
      depth: 90,
      stock: 0, // out of stock
      imageUrl: 'https://example.com/p3.jpg',
      model3dUrl: 'https://example.com/p3.glb',
      retailerId: 'ret-1',
      createdAt: '2026-01-03',
      updatedAt: '2026-01-03',
    },
  ];

  function filterAndSortProducts(
    products: Product[],
    filters: {
      searchTerm?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      availability?: 'all' | 'instock';
      sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
    }
  ): Product[] {
    let result = [...products];

    if (filters.searchTerm?.trim()) {
      const q = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.material || '').toLowerCase().includes(q) ||
          (p.color || '').toLowerCase().includes(q) ||
          (p.style || '').toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.availability === 'instock') {
      result = result.filter(p => p.stock > 0);
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return result;
  }

  it('filters products matching a search term across name, brand, and material', () => {
    const byName = filterAndSortProducts(sampleProducts, { searchTerm: 'Aura' });
    expect(byName).toHaveLength(1);
    expect(byName[0].id).toBe('p1');

    const byBrand = filterAndSortProducts(sampleProducts, { searchTerm: 'Luxe' });
    expect(byBrand).toHaveLength(1);
    expect(byBrand[0].id).toBe('p2');

    const byMaterial = filterAndSortProducts(sampleProducts, { searchTerm: 'Teak' });
    expect(byMaterial).toHaveLength(1);
    expect(byMaterial[0].id).toBe('p3');
  });

  it('filters by category accurately', () => {
    const chairs = filterAndSortProducts(sampleProducts, { category: 'Chairs' });
    expect(chairs).toHaveLength(1);
    expect(chairs[0].id).toBe('p1');

    const all = filterAndSortProducts(sampleProducts, { category: 'All' });
    expect(all).toHaveLength(3);
  });

  it('filters by price boundaries correctly', () => {
    const under50k = filterAndSortProducts(sampleProducts, { maxPrice: 50000 });
    expect(under50k).toHaveLength(2); // p1 (15k) and p3 (42k)

    const over50k = filterAndSortProducts(sampleProducts, { minPrice: 50000 });
    expect(over50k).toHaveLength(1); // p2 (68k)
  });

  it('filters out of stock products when instock filter is selected', () => {
    const inStockOnly = filterAndSortProducts(sampleProducts, { availability: 'instock' });
    expect(inStockOnly).toHaveLength(2);
    expect(inStockOnly.map(p => p.id)).toEqual(['p1', 'p2']);
  });

  it('sorts correctly by price and name', () => {
    const priceAsc = filterAndSortProducts(sampleProducts, { sortBy: 'price-asc' });
    expect(priceAsc.map(p => p.price)).toEqual([15000, 42000, 68000]);

    const priceDesc = filterAndSortProducts(sampleProducts, { sortBy: 'price-desc' });
    expect(priceDesc.map(p => p.price)).toEqual([68000, 42000, 15000]);

    const nameAsc = filterAndSortProducts(sampleProducts, { sortBy: 'name-asc' });
    expect(nameAsc.map(p => p.name)).toEqual([
      'Aura Minimalist Armchair',
      'Solace Dining Table',
      'Zenith Velvet Sectional',
    ]);
  });
});
