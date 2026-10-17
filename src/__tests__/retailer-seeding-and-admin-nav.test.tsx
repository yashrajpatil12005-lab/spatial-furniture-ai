import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  categorizeSeedingError,
  seedDemoProducts,
  DEMO_PRODUCTS,
} from '@/lib/products/seed';
import RetailerDashboard from '@/app/retailer/page';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import * as productsModule from '@/lib/products';

// Mock AuthContext
let mockUser: { uid: string; email: string; displayName?: string; emailVerified?: boolean } | null = {
  uid: 'retailer-test-uid-123',
  email: 'retailer@example.com',
  displayName: 'LuxeLiving Store',
  emailVerified: true,
};

let mockUserData: { role: 'customer' | 'retailer' | 'admin'; name?: string } | null = {
  role: 'retailer',
  name: 'LuxeLiving Store',
};

vi.mock('@/lib/firebase/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    userData: mockUserData,
    loading: false,
  }),
}));

// Mock ProtectedRoute to render children directly
vi.mock('@/lib/firebase/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next/navigation
let mockPathname = '/retailer';
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockRouterPush,
  }),
  redirect: vi.fn(),
}));

describe('Issue 1: Demo Catalog Seeding & Error Handling', () => {
  describe('categorizeSeedingError', () => {
    it('categorizes permission-denied errors without exposing secrets or paths', () => {
      const err = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('permission');
      expect(categorized.title).toBe('Permission Denied');
      expect(categorized.message).toContain('permissions to write catalog products');
      expect(categorized.message).toContain('Firebase Console');
      // Must not expose internal secrets
      expect(categorized.message).not.toContain('secret');
      expect(categorized.message).not.toContain('apiKey');
    });

    it('categorizes unauthenticated or missing session errors', () => {
      const err = { code: 'unauthenticated', message: 'User is not logged in.' };
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('auth');
      expect(categorized.title).toBe('Authentication Required');
      expect(categorized.message).toContain('sign in again');
    });

    it('categorizes network / service unavailable errors', () => {
      const err = { code: 'unavailable', message: 'Failed to fetch database connection.' };
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('network');
      expect(categorized.title).toBe('Network / Service Unavailable');
      expect(categorized.message).toContain('internet connection');
    });

    it('categorizes quota / resource exhaustion errors', () => {
      const err = { code: 'resource-exhausted', message: 'Quota exceeded for project.' };
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('quota');
      expect(categorized.title).toBe('Quota Exceeded');
      expect(categorized.message).toContain('quota');
    });

    it('categorizes failed-precondition / database initialization errors', () => {
      const err = { code: 'failed-precondition', message: 'The database (default) does not exist.' };
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('precondition');
      expect(categorized.title).toBe('Database Configuration Required');
      expect(categorized.message).toContain('database');
    });

    it('provides safe fallback for unknown or generic errors', () => {
      const err = new Error('Something strange happened');
      const categorized = categorizeSeedingError(err);

      expect(categorized.category).toBe('unknown');
      expect(categorized.title).toBe('Catalog Seeding Error');
      expect(categorized.message).toContain('Failed to complete demo catalog seeding');
    });

    it('handles falsy error safely', () => {
      const categorized = categorizeSeedingError(null);
      expect(categorized.category).toBe('unknown');
      expect(categorized.title).toBe('Unknown Error');
    });
  });

  describe('seedDemoProducts business logic & idempotency', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('rejects empty or whitespace retailer IDs', async () => {
      await expect(seedDemoProducts('')).rejects.toThrow(
        'A valid authenticated retailer ID is required to seed products.'
      );
      await expect(seedDemoProducts('   ')).rejects.toThrow(
        'A valid authenticated retailer ID is required to seed products.'
      );
    });

    it('seeds all demo products when retailer catalog is currently empty', async () => {
      // Mock existing products as empty
      vi.spyOn(productsModule, 'getRetailerProducts').mockResolvedValue([]);
      const createSpy = vi.spyOn(productsModule, 'createProduct').mockResolvedValue('new-doc-id');

      const result = await seedDemoProducts('retailer-abc');

      expect(result.success).toBe(true);
      expect(result.alreadySeeded).toBe(false);
      expect(result.seededCount).toBe(DEMO_PRODUCTS.length);
      expect(createSpy).toHaveBeenCalledTimes(DEMO_PRODUCTS.length);

      // Verify that all products were assigned to the authenticated retailer
      createSpy.mock.calls.forEach(([productPayload]) => {
        expect(productPayload.retailerId).toBe('retailer-abc');
      });
    });

    it('is idempotent: avoids creating duplicate products if all demo items already exist', async () => {
      // Mock that retailer already has all 5 demo products
      const existingCatalog = DEMO_PRODUCTS.map((dp, i) => ({
        ...dp,
        id: `existing-doc-${i}`,
        retailerId: 'retailer-abc',
      }));

      vi.spyOn(productsModule, 'getRetailerProducts').mockResolvedValue(existingCatalog);
      const createSpy = vi.spyOn(productsModule, 'createProduct').mockResolvedValue('dup-id');

      const result = await seedDemoProducts('retailer-abc');

      expect(result.success).toBe(true);
      expect(result.alreadySeeded).toBe(true);
      expect(result.seededCount).toBe(0);
      expect(result.totalCatalogCount).toBe(5);
      // No documents should have been written to Firestore
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('seeds only missing demo products when partially seeded', async () => {
      // Suppose the retailer already has 2 of the 5 demo products
      const partialExisting = [
        {
          ...DEMO_PRODUCTS[0],
          id: 'existing-0',
          retailerId: 'retailer-abc',
        },
        {
          ...DEMO_PRODUCTS[1],
          id: 'existing-1',
          retailerId: 'retailer-abc',
        },
      ];

      vi.spyOn(productsModule, 'getRetailerProducts').mockResolvedValue(partialExisting);
      const createSpy = vi.spyOn(productsModule, 'createProduct').mockResolvedValue('new-doc-id');

      const result = await seedDemoProducts('retailer-abc');

      expect(result.success).toBe(true);
      expect(result.alreadySeeded).toBe(false);
      expect(result.seededCount).toBe(3);
      expect(createSpy).toHaveBeenCalledTimes(3);
      expect(result.totalCatalogCount).toBe(5);
    });
  });

  describe('Retailer Dashboard UI Component', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      mockUser = {
        uid: 'retailer-test-uid-123',
        email: 'retailer@example.com',
        displayName: 'LuxeLiving Store',
      };
      mockUserData = {
        role: 'retailer',
        name: 'LuxeLiving Store',
      };
      vi.spyOn(productsModule, 'getRetailerProducts').mockResolvedValue([]);
    });

    it('shows success message with product count on successful initial seeding', async () => {
      vi.spyOn(productsModule, 'getRetailerProducts')
        .mockResolvedValueOnce([]) // 1. initial page load in useEffect
        .mockResolvedValueOnce([]) // 2. inside seedDemoProducts checking existing items
        .mockResolvedValueOnce(DEMO_PRODUCTS); // 3. reload after seeding

      vi.spyOn(productsModule, 'createProduct').mockResolvedValue('doc-id');

      render(<RetailerDashboard />);

      const seedButton = screen.getByRole('button', { name: /seed demo data/i });
      fireEvent.click(seedButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/successfully seeded 5 demo products into your retailer inventory/i)
        ).toBeInTheDocument();
      });
    });

    it('shows informative notice that items already exist on repeated seeding (safe retry)', async () => {
      // Mock existing products containing all demo products
      vi.spyOn(productsModule, 'getRetailerProducts').mockResolvedValue(DEMO_PRODUCTS);
      const createSpy = vi.spyOn(productsModule, 'createProduct');

      render(<RetailerDashboard />);

      const seedButton = screen.getByRole('button', { name: /seed demo data/i });
      fireEvent.click(seedButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/all demo catalog products are already present in your inventory/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/no duplicate products were created/i)).toBeInTheDocument();
      });

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('shows categorized Permission Denied error when Firestore throws permission-denied', async () => {
      vi.spyOn(productsModule, 'getRetailerProducts').mockRejectedValue({
        code: 'permission-denied',
        message: 'Missing or insufficient permissions.',
      });

      render(<RetailerDashboard />);

      const seedButton = screen.getByRole('button', { name: /seed demo data/i });
      fireEvent.click(seedButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toContain('Permission Denied');
        expect(alert.textContent).toContain('Firebase Console');
        // Old generic message must NOT be displayed
        expect(alert.textContent).not.toBe(
          'Failed to seed demo catalog. Please check your network or permissions.'
        );
      });
    });

    it('shows categorized Network error when service is unavailable', async () => {
      vi.spyOn(productsModule, 'getRetailerProducts').mockRejectedValue({
        code: 'unavailable',
        message: 'Network request failed',
      });

      render(<RetailerDashboard />);

      const seedButton = screen.getByRole('button', { name: /seed demo data/i });
      fireEvent.click(seedButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toContain('Network / Service Unavailable');
      });
    });

    it('blocks non-retailer / customer user with a permission error if they attempt seeding', async () => {
      mockUserData = {
        role: 'customer',
        name: 'Normal Customer',
      };

      render(<RetailerDashboard />);

      const seedButton = screen.getByRole('button', { name: /seed demo data/i });
      fireEvent.click(seedButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toContain('Permission Denied');
        expect(alert.textContent).toContain('Only authorized retail partners and administrators');
      });
    });
  });
});

describe('Issue 2: Removal of Duplicate Platform Health Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUser = {
      uid: 'admin-super-uid',
      email: 'admin@spatialai.com',
      displayName: 'System Admin',
    };
    mockUserData = {
      role: 'admin',
      name: 'System Admin',
    };
    mockPathname = '/admin';
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hash: '' },
    });
  });

  it('renders Overview as the primary admin link in Navbar without Platform Health', () => {
    render(<Navbar />);

    // Overview link must exist and point to /admin
    const overviewLink = screen.getByRole('link', { name: /^overview$/i });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute('href', '/admin');

    // Platform Health MUST NOT exist in navigation links
    const platformHealthLink = screen.queryByRole('link', { name: /platform health/i });
    expect(platformHealthLink).toBeNull();

    // Key admin workflow links must be present
    expect(screen.getByRole('link', { name: /product management/i })).toHaveAttribute(
      'href',
      '/retailer/products'
    );
    expect(screen.getByRole('link', { name: /^furniture catalog$/i })).toHaveAttribute(
      'href',
      '/customer/products'
    );
    expect(screen.getByRole('link', { name: /^room visualizer$/i })).toHaveAttribute(
      'href',
      '/customer/visualizer'
    );
    expect(screen.getByRole('link', { name: /^public site$/i })).toHaveAttribute('href', '/');
  });

  it('highlights Overview when on /admin', () => {
    mockPathname = '/admin';
    render(<Navbar />);

    const overviewLink = screen.getByRole('link', { name: /^overview$/i });
    expect(overviewLink.className).toContain('text-[#047857]');
    expect(overviewLink.className).toContain('bg-[#ECFDF5]');
  });

  it('Footer also excludes Platform Health for admin role', () => {
    render(<Footer />);

    // Platform Health should not be in the footer
    const platformHealthLink = screen.queryByRole('link', { name: /platform health/i });
    expect(platformHealthLink).toBeNull();

    // Primary admin links must be in footer
    expect(screen.getByRole('link', { name: /admin overview/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /manage products/i })).toHaveAttribute(
      'href',
      '/retailer/products'
    );
    expect(screen.getByRole('link', { name: /furniture catalog/i })).toHaveAttribute(
      'href',
      '/customer/products'
    );
  });
});
