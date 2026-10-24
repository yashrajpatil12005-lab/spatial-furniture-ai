import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Spatial Furniture AI — Firebase Admin SDK Initializer
 * 
 * Safely initializes Firebase Admin SDK on the server side using
 * environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 * 
 * Never logs credentials or exposes private keys.
 */

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  const apps = getApps();
  if (apps && apps.length > 0) {
    return apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Handle formatted or escaped newlines in private key
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return adminApp;
  } catch (error) {
    console.error('[firebaseAdmin] Initialization error:', error);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (error) {
    console.error('[firebaseAdmin] Auth initialization error:', error);
    return null;
  }
}

export function getAdminFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (error) {
    console.error('[firebaseAdmin] Firestore initialization error:', error);
    return null;
  }
}

export function isFirebaseAdminReady(): boolean {
  return Boolean(
    (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}
