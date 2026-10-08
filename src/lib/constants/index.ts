export const PRODUCT_CATEGORIES = [
  'Sofa',
  'Bed',
  'Chair',
  'Dining Table',
  'Wardrobe',
  'Study Table',
  'Cabinet',
  'Other',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const CUSTOMIZATION_COLORS = ['Beige', 'Black', 'White', 'Grey', 'Brown', 'Blue'] as const;
export const CUSTOMIZATION_MATERIALS = ['Fabric', 'Leather', 'Wood', 'Metal', 'Velvet'] as const;
export const CUSTOMIZATION_FINISHES = ['Matte', 'Glossy', 'Natural Wood', 'Walnut', 'Oak'] as const;
