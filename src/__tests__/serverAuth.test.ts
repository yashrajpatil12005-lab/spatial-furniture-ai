import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  verifyAuthToken,
  getUserRoleServer,
  requireAuth,
  requireAdmin,
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

    it('returns VerifiedUser object when token is valid', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-user-123', email: 'test@example.com' }],
        }),
      } as Response);

      const req = createMockRequest('Bearer valid-token-123');
      const user = await verifyAuthToken(req);
      expect(user).toEqual({
        uid: 'uid-user-123',
        email: 'test@example.com',
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
        expect(result.response.status).toBe(401);
      }
    });

    it('returns authorized true with user and token on valid token', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ localId: 'uid-cust-1', email: 'cust@example.com' }],
        }),
      } as Response);

      const req = createMockRequest('Bearer valid-token');
      const result = await requireAuth(req);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.uid).toBe('uid-cust-1');
        expect(result.token).toBe('valid-token');
      }
    });
  });

  describe('requireAdmin guard', () => {
    it('returns 401 if request is unauthenticated', async () => {
      const req = createMockRequest();
      const result = await requireAdmin(req);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.response.status).toBe(401);
      }
    });

    it('returns 403 Forbidden if user is authenticated but not an admin', async () => {
      // 1st fetch: token lookup succeeds
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-cust-1', email: 'cust@example.com' }],
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
        expect(result.response.status).toBe(403);
      }
    });

    it('authorizes successfully when user has the admin role in Firestore', async () => {
      // 1st fetch: token lookup
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            users: [{ localId: 'uid-admin-1', email: 'admin@spatial.com' }],
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
      }
    });
  });
});
