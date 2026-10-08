import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

export const getProducts = async (categoryFilter?: string) => {
  try {
    let q = collection(db, PRODUCTS_COLLECTION);
    
    if (categoryFilter && categoryFilter !== 'All') {
      // @ts-ignore
      q = query(collection(db, PRODUCTS_COLLECTION), where('category', '==', categoryFilter));
    }
    
    // We fetch all products (you might want to paginate in production)
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getRetailerProducts = async (retailerId: string) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION), 
      where('retailerId', '==', retailerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching retailer products:", error);
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date().toISOString();
    const newProduct = {
      ...product,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), newProduct);
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'retailerId'>>) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
