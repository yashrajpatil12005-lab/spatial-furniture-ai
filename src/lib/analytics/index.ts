import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface AnalyticsEvent {
  userId: string;
  eventType: 'page_view' | 'product_view';
  pagePath: string;
  productId?: string;
  productName?: string;
  category?: string;
  createdAt?: unknown;
}

const EVENTS_COLLECTION = 'analytics_events';

export async function trackPageView(
  userId: string,
  pagePath: string
) {
  if (!userId || !pagePath) return;

  try {
    await addDoc(collection(db, EVENTS_COLLECTION), {
      userId,
      eventType: 'page_view',
      pagePath,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Analytics page tracking failed:', error);
  }
}

export async function trackProductView(
  userId: string,
  product: {
    id?: string;
    name: string;
    category: string;
  },
  pagePath: string
) {
  if (!userId || !product.id) return;

  try {
    await addDoc(collection(db, EVENTS_COLLECTION), {
      userId,
      eventType: 'product_view',
      productId: product.id,
      productName: product.name,
      category: product.category,
      pagePath,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Analytics product tracking failed:', error);
  }
}

export async function getAnalyticsEvents() {
  const eventsQuery = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(2000)
  );

  const snapshot = await getDocs(eventsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as (AnalyticsEvent & { id: string })[];
}
