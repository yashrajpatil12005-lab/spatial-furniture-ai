import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Spatial Furniture AI — Firebase Admin SDK Initializer
 * 
 * Safely initializes Firebase Admin SDK on the server side using
 * environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 * 
 * Provides robust sanitization for Vercel environment variables:
 * - Strips enclosing quotes (double or single)
 * - Handles literal newlines and escaped newlines (\n, \\n, \r\n)
 * - Never logs credentials or exposes private keys
 */

let adminApp: App | null = null;

/**
 * Normalizes and formats PEM private keys from environment variables.
 * Handles multiline PEM keys, escaped newlines, and wrapping quotes.
 */
export function formatPrivateKey(rawKey: string | undefined): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();

  // Strip wrapping double or single quotes if present (common in Vercel UI or .env files)
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // Handle CRLF and escaped newlines (\r\n -> \n, \\n -> \n)
  if (key.includes('\r\n')) {
    key = key.replace(/\r\n/g, '\n');
  }
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  return key;
}

export function getAdminConfigStatus(): {
  isReady: boolean;
  hasProjectId: boolean;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
} {
  const rawProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const projectId = rawProjectId.trim().replace(/^["']|["']$/g, '');

  const rawClientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const clientEmail = rawClientEmail.trim().replace(/^["']|["']$/g, '');

  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  return {
    isReady: Boolean(projectId && clientEmail && privateKey),
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
  };
}

export function getFirebaseAdminApp(): App | null {
  const apps = getApps();
  if (apps && apps.length > 0) {
    return apps[0]!;
  }

  const rawProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const projectId = rawProjectId.trim().replace(/^["']|["']$/g, '');

  const rawClientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const clientEmail = rawClientEmail.trim().replace(/^["']|["']$/g, '');

  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null;
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
    const errorMsg = error instanceof Error ? error.message : 'Unknown initialization error';
    console.error('[firebaseAdmin] Initialization error:', errorMsg);
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
  return getAdminConfigStatus().isReady;
}
