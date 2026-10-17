import { NextRequest, NextResponse } from 'next/server';

export interface VerifiedUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  role?: string;
}

export interface RequireAuthOptions {
  requireVerified?: boolean;
}

export type RequireAuthResult =
  | { authorized: true; user: VerifiedUser; token: string }
  | { authorized: false; response: NextResponse; status: number; error: string; code?: string };

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Uses Google Identity Toolkit API to verify token authenticity and fetch email verification status.
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
      emailVerified: Boolean(user.emailVerified),
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
 * Enforces authentication and email verification on protected routes.
 * Defaults to requiring verified emails (options.requireVerified = true).
 */
export async function requireAuth(
  req: NextRequest,
  options: RequireAuthOptions = { requireVerified: true }
): Promise<RequireAuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication token is required.',
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
      status: 401,
      error: 'Unauthorized: Invalid or expired authentication token.',
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired authentication token.' },
        { status: 401 }
      ),
    };
  }

  // Enforce email verification (defaults to true)
  const shouldRequireVerified = options.requireVerified !== false;
  if (shouldRequireVerified && !user.emailVerified) {
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: Email verification required. Please verify your email before accessing this feature.',
      code: 'EMAIL_NOT_VERIFIED',
      response: NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Email verification required. Please verify your email address.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        },
        { status: 403 }
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
 * Enforces admin authorization and email verification on administrative routes.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<
  | { authorized: true; user: VerifiedUser; token: string }
  | { authorized: false; response: NextResponse; status: number; error: string; code?: string }
> {
  const auth = await requireAuth(req, { requireVerified: true });
  if (!auth.authorized) {
    return auth;
  }

  const role = await getUserRoleServer(auth.token, auth.user.uid);
  if (role !== 'admin') {
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: Administrator privileges required.',
      response: NextResponse.json(
        { error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { ...auth.user, role },
    token: auth.token,
  };
}

/**
 * Enforces role authorization and email verification on role-restricted routes.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<
  | { authorized: true; user: VerifiedUser; token: string }
  | { authorized: false; response: NextResponse; status: number; error: string; code?: string }
> {
  const auth = await requireAuth(req, { requireVerified: true });
  if (!auth.authorized) {
    return auth;
  }

  const role = await getUserRoleServer(auth.token, auth.user.uid);
  if (!role || !allowedRoles.includes(role)) {
    return {
      authorized: false,
      status: 403,
      error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}].`,
      response: NextResponse.json(
        { error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}].` },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { ...auth.user, role },
    token: auth.token,
  };
}
