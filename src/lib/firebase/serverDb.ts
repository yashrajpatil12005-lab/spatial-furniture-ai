import { Product } from '@/lib/types';

export const fetchProductsFromServer = async (token: string): Promise<Product[]> => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('Firebase project ID is not defined');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Firestore REST Error:', errorText);
    throw new Error('Failed to fetch products from Firestore on the server.');
  }

  const data = await res.json();
  
  if (!data.documents) {
    return [];
  }

  // Parse Firestore REST API format to standard Product objects
  return data.documents.map((doc: any) => {
    const id = doc.name.split('/').pop();
    const fields = doc.fields;
    
    // Helper to extract value safely
    const extract = (field: any) => {
      if (!field) return undefined;
      if (field.stringValue !== undefined) return field.stringValue;
      if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
      if (field.doubleValue !== undefined) return parseFloat(field.doubleValue);
      if (field.booleanValue !== undefined) return field.booleanValue;
      if (field.timestampValue !== undefined) return field.timestampValue;
      return null;
    };

    return {
      id,
      name: extract(fields.name) || '',
      category: extract(fields.category) || '',
      description: extract(fields.description) || '',
      price: extract(fields.price) || 0,
      brand: extract(fields.brand) || '',
      material: extract(fields.material) || '',
      color: extract(fields.color) || '',
      style: extract(fields.style) || '',
      width: extract(fields.width) || 0,
      height: extract(fields.height) || 0,
      depth: extract(fields.depth) || 0,
      stock: extract(fields.stock) || 0,
      imageUrl: extract(fields.imageUrl) || '',
      retailerId: extract(fields.retailerId) || '',
      createdAt: extract(fields.createdAt) || '',
      updatedAt: extract(fields.updatedAt) || ''
    } as Product;
  });
};
