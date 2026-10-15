import { createProduct, getRetailerProducts } from './index';
import { Product } from '../types';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-sofa-1',
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
    retailerId: 'demo-retailer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-chair-2',
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
    retailerId: 'demo-retailer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-bed-3',
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
    retailerId: 'demo-retailer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-desk-4',
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
    retailerId: 'demo-retailer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-dining-5',
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
    retailerId: 'demo-retailer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
];

export interface SeedResult {
  success: boolean;
  seededCount: number;
  totalCatalogCount: number;
  alreadySeeded: boolean;
  seededProducts: string[];
  skippedProducts: string[];
}

export type SeedingErrorCategory = 'permission' | 'auth' | 'network' | 'quota' | 'precondition' | 'unknown';

export interface SeedingErrorInfo {
  category: SeedingErrorCategory;
  title: string;
  message: string;
}

/**
 * Categorizes errors encountered during catalog operations into safe,
 * user-actionable descriptions without exposing database secrets, API keys, or tokens.
 */
export function categorizeSeedingError(error: unknown): SeedingErrorInfo {
  if (!error) {
    return {
      category: 'unknown',
      title: 'Unknown Error',
      message: 'An unexpected error occurred while seeding demo products. Please try again.',
    };
  }

  // Extract error code and message from FirebaseError or generic Error
  const err = error as { code?: string; message?: string; name?: string };
  const code = (err.code || '').toLowerCase();
  const rawMessage = (err.message || '').toLowerCase();
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  // 1. Browser offline detection
  if (isOffline) {
    return {
      category: 'network',
      title: 'Network Offline',
      message: 'You appear to be offline. Please verify your internet connection and try again.',
    };
  }

  // 2. Permission Denied (Firestore security rules / role check)
  if (
    code.includes('permission-denied') ||
    code.includes('unauthorized') ||
    rawMessage.includes('insufficient permissions') ||
    rawMessage.includes('permission-denied') ||
    rawMessage.includes('permission denied')
  ) {
    return {
      category: 'permission',
      title: 'Permission Denied',
      message:
        'Your account lacks permissions to write catalog products to Firestore. Ensure your account is assigned the Retailer role and that security rules are deployed in the Firebase Console.',
    };
  }

  // 3. Unauthenticated / Session Expired
  if (
    code.includes('unauthenticated') ||
    code.includes('auth/user-token-expired') ||
    code.includes('auth/invalid-user-token') ||
    code.includes('auth/user-not-found') ||
    rawMessage.includes('unauthenticated') ||
    rawMessage.includes('must be logged in') ||
    rawMessage.includes('retailer id is required')
  ) {
    return {
      category: 'auth',
      title: 'Authentication Required',
      message:
        'Your authentication session has expired or is invalid. Please sign in again before modifying catalog inventory.',
    };
  }

  // 4. Network / Service Unavailable / Deadline Exceeded
  if (
    code.includes('unavailable') ||
    code.includes('deadline-exceeded') ||
    code.includes('network-request-failed') ||
    rawMessage.includes('unavailable') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('network error') ||
    rawMessage.includes('networkrequestfailed')
  ) {
    return {
      category: 'network',
      title: 'Network / Service Unavailable',
      message:
        'Unable to reach Firestore database services. Please check your internet connection or verify that Firestore is active in the Firebase Console.',
    };
  }

  // 5. Quota / Resource Exhausted
  if (
    code.includes('resource-exhausted') ||
    rawMessage.includes('quota') ||
    rawMessage.includes('resource exhausted')
  ) {
    return {
      category: 'quota',
      title: 'Quota Exceeded',
      message:
        'Firestore request quota or bandwidth threshold has been reached. Please try again later or upgrade your project quota tier.',
    };
  }

  // 6. Precondition / Database Initialization
  if (
    code.includes('failed-precondition') ||
    rawMessage.includes('database not found') ||
    rawMessage.includes('precondition')
  ) {
    return {
      category: 'precondition',
      title: 'Database Configuration Required',
      message:
        'The Cloud Firestore database has not been initialized or is configured in another region. Verify your database status in the Firebase Console.',
    };
  }

  // Default fallback
  return {
    category: 'unknown',
    title: 'Catalog Seeding Error',
    message:
      'Failed to complete demo catalog seeding. Please check your network and account permissions, or retry in a few moments.',
  };
}

/**
 * Seeds demo products into the authenticated retailer's catalog.
 * Idempotent: Checks for existing items by name under the retailer's ownership
 * before creating documents, avoiding duplicate items when executed multiple times.
 */
export const seedDemoProducts = async (retailerId: string): Promise<SeedResult> => {
  if (!retailerId || typeof retailerId !== 'string' || !retailerId.trim()) {
    throw new Error('A valid authenticated retailer ID is required to seed products.');
  }

  try {
    // 1. Fetch current catalog for this retailer to prevent duplicate items
    const existingProducts = await getRetailerProducts(retailerId);
    const existingNames = new Set(
      existingProducts.map((p) => (p.name || '').trim().toLowerCase())
    );

    // 2. Filter DEMO_PRODUCTS to only those not already in the retailer's catalog
    const productsToSeed = DEMO_PRODUCTS.filter(
      (demoItem) => !existingNames.has(demoItem.name.trim().toLowerCase())
    );

    const skippedProducts = DEMO_PRODUCTS.filter((demoItem) =>
      existingNames.has(demoItem.name.trim().toLowerCase())
    ).map((p) => p.name);

    // 3. If all demo products already exist, return early without generating duplicate documents
    if (productsToSeed.length === 0) {
      return {
        success: true,
        seededCount: 0,
        totalCatalogCount: existingProducts.length,
        alreadySeeded: true,
        seededProducts: [],
        skippedProducts,
      };
    }

    // 4. Create missing demo products with retailerId strictly bound to the authenticated user
    const createPromises = productsToSeed.map((demoItem) =>
      createProduct({
        name: demoItem.name,
        category: demoItem.category,
        description: demoItem.description,
        price: demoItem.price,
        brand: demoItem.brand,
        material: demoItem.material,
        color: demoItem.color,
        style: demoItem.style,
        width: demoItem.width,
        height: demoItem.height,
        depth: demoItem.depth,
        stock: demoItem.stock,
        imageUrl: demoItem.imageUrl,
        model3dUrl: demoItem.model3dUrl,
        retailerId,
      })
    );

    await Promise.all(createPromises);

    return {
      success: true,
      seededCount: productsToSeed.length,
      totalCatalogCount: existingProducts.length + productsToSeed.length,
      alreadySeeded: false,
      seededProducts: productsToSeed.map((p) => p.name),
      skippedProducts,
    };
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

