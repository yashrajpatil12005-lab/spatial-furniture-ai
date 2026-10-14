import { NextRequest, NextResponse } from 'next/server';

export interface VerifiedUser {
  uid: string;
  email?: string;
  role?: string;
}

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Uses Google Identity Toolkit API to verify token authenticity.
 */
export async function verifyAuthToken(req: NextRequest): Promise<VerifiedUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.error('[serverAuth] NEXT_PUBLIC_FIREBASE_API_KEY is not defined.');
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const user = data.users?.[0];
    if (!user || !user.localId) {
      return null;
    }

    return {
      uid: user.localId,
      email: user.email,
    };
  } catch (error) {
    console.error('[serverAuth] Token verification failed:', error);
    return null;
  }
}

/**
 * Retrieves the user's role document from Firestore via REST using their Bearer token.
 */
export async function getUserRoleServer(token: string, uid: string): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const doc = await res.json();
    return doc.fields?.role?.stringValue || null;
  } catch {
    return null;
  }
}

/**
 * Enforces authentication on protected routes.
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ authorized: true; user: VerifiedUser; token: string } | { authorized: false; response: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication token is required.' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const user = await verifyAuthToken(req);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired authentication token.' },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    user,
    token,
  };
}

/**
 * Enforces admin authorization on administrative routes.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ authorized: true; user: VerifiedUser } | { authorized: false; response: NextResponse }> {
  const auth = await requireAuth(req);
  if (!auth.authorized) {
    return auth;
  }

  const role = await getUserRoleServer(auth.token, auth.user.uid);
  if (role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { ...auth.user, role },
  };
}
