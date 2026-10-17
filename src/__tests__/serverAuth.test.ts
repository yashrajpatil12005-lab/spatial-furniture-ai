import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  verifyAuthToken,
  getUserRoleServer,
  requireAuth,
  requireAdmin,
  requireRole,
} from '@/lib/firebase/serverAuth';

describe('Server-Side Authentication & Authorization Helpers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-firebase-api-key';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function createMockRequest(authHeader?: string): NextRequest {
    const headers = new Headers();
    if (authHeader) {
      headers.set('authorization', authHeader);
    }
    return new NextRequest('http://localhost:3000/api/test', {
      headers,
    });
  }

  describe('verifyAuthToken', () => {
    it('returns null if authorization header is missing', async () => {
      const req = createMockRequest();
      const user = await verifyAuthToken(req);
      expect(user).toBeNull();
    });

    it('returns null if authorization header does not use Bearer scheme', async () => {
      const req = createMockRequest('Basic dXNlcjpwYXNz');
      const user = await verifyAuthToken(req);
      expect(user).toBeNull();
    });

    it('returns null if token verification API fails (HTTP 400/401)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'INVALID_ID_TOKEN' } }),
      } as Response);

      const req = createMockRequest('Bearer invalid-token');
      const user = await verifyAuthToken(req);
      expect(user).toBeNull();
    });

    it('returns VerifiedUser object with emailVerified: true when token is valid and verified', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-user-123', email: 'test@example.com', emailVerified: true }],
        }),
      } as Response);

      const req = createMockRequest('Bearer valid-token-123');
      const user = await verifyAuthToken(req);
      expect(user).toEqual({
        uid: 'uid-user-123',
        email: 'test@example.com',
        emailVerified: true,
      });
    });

    it('returns VerifiedUser object with emailVerified: false when email is not verified', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-unverified-1', email: 'unverified@example.com', emailVerified: false }],
        }),
      } as Response);

      const req = createMockRequest('Bearer unverified-token');
      const user = await verifyAuthToken(req);
      expect(user).toEqual({
        uid: 'uid-unverified-1',
        email: 'unverified@example.com',
        emailVerified: false,
      });
    });
  });

  describe('getUserRoleServer', () => {
    it('retrieves string role from Firestore REST document', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          fields: {
            role: { stringValue: 'retailer' },
          },
        }),
      } as Response);

      const role = await getUserRoleServer('token-123', 'uid-123');
      expect(role).toBe('retailer');
    });

    it('returns null if user document is not found or request fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const role = await getUserRoleServer('token-123', 'uid-123');
      expect(role).toBeNull();
    });
  });

  describe('requireAuth guard', () => {
    it('returns 401 when authorization header is absent', async () => {
      const req = createMockRequest();
      const result = await requireAuth(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
        expect(result.response.status).toBe(401);
      }
    });

    it('returns 401 when token fails verification', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      const req = createMockRequest('Bearer expired-token');
      const result = await requireAuth(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
        expect(result.response.status).toBe(401);
      }
    });

    it('denies unverified users with HTTP 403 Forbidden and EMAIL_NOT_VERIFIED code by default', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-cust-1', email: 'cust@example.com', emailVerified: false }],
        }),
      } as Response);

      const req = createMockRequest('Bearer valid-token-unverified');
      const result = await requireAuth(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(403);
        expect(result.code).toBe('EMAIL_NOT_VERIFIED');
        expect(result.error).toContain('Email verification required');
        const json = await result.response.json();
        expect(json.code).toBe('EMAIL_NOT_VERIFIED');
      }
    });

    it('authorizes successfully when token is valid and user email is verified', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-cust-1', email: 'cust@example.com', emailVerified: true }],
        }),
      } as Response);

      const req = createMockRequest('Bearer valid-token');
      const result = await requireAuth(req);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.uid).toBe('uid-cust-1');
        expect(result.user.emailVerified).toBe(true);
        expect(result.token).toBe('valid-token');
      }
    });

    it('allows unverified tokens when requireVerified: false is explicitly configured', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-pending-1', email: 'pending@example.com', emailVerified: false }],
        }),
      } as Response);

      const req = createMockRequest('Bearer unverified-token');
      const result = await requireAuth(req, { requireVerified: false });
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.uid).toBe('uid-pending-1');
        expect(result.user.emailVerified).toBe(false);
      }
    });
  });

  describe('requireAdmin guard', () => {
    it('returns 401 if request is unauthenticated', async () => {
      const req = createMockRequest();
      const result = await requireAdmin(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
      }
    });

    it('returns 403 Forbidden if user is unverified even if their Firestore role is admin', async () => {
      // 1st fetch: token lookup returns unverified user
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-admin-unverified', email: 'admin@spatial.com', emailVerified: false }],
        }),
      } as Response);

      const req = createMockRequest('Bearer admin-token-unverified');
      const result = await requireAdmin(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(403);
        expect(result.code).toBe('EMAIL_NOT_VERIFIED');
      }
    });

    it('returns 403 Forbidden if user is authenticated and verified but not an admin', async () => {
      // 1st fetch: token lookup succeeds with verified email
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-cust-1', email: 'cust@example.com', emailVerified: true }],
          }),
        } as Response)
        // 2nd fetch: firestore role lookup returns "customer"
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            fields: { role: { stringValue: 'customer' } },
          }),
        } as Response);

      const req = createMockRequest('Bearer valid-token');
      const result = await requireAdmin(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(403);
      }
    });

    it('authorizes successfully when user is verified and has admin role in Firestore', async () => {
      // 1st fetch: token lookup with emailVerified true
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-admin-1', email: 'admin@spatial.com', emailVerified: true }],
          }),
        } as Response)
        // 2nd fetch: firestore role lookup returns "admin"
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            fields: { role: { stringValue: 'admin' } },
          }),
        } as Response);

      const req = createMockRequest('Bearer admin-token');
      const result = await requireAdmin(req);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.uid).toBe('uid-admin-1');
        expect(result.user.role).toBe('admin');
        expect(result.user.emailVerified).toBe(true);
      }
    });
  });

  describe('requireRole guard', () => {
    it('authorizes retailer role when verified', async () => {
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-ret-1', email: 'ret@example.com', emailVerified: true }],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            fields: { role: { stringValue: 'retailer' } },
          }),
        } as Response);

      const req = createMockRequest('Bearer ret-token');
      const result = await requireRole(req, ['retailer', 'admin']);
      expect(result.authorized).toBe(true);
    });

    it('denies retailer role when user has customer role', async () => {
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-cust-1', email: 'cust@example.com', emailVerified: true }],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            fields: { role: { stringValue: 'customer' } },
          }),
        } as Response);

      const req = createMockRequest('Bearer cust-token');
      const result = await requireRole(req, ['retailer']);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(403);
      }
    });
  });
});
