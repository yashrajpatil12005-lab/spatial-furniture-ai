import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Navbar from '@/components/layout/Navbar';
import CustomerProductsPage from '@/app/customer/products/page';
import CustomerVisualizerPage from '@/app/customer/visualizer/page';
import CustomerPage from '@/app/customer/page';
import { Product } from '@/lib/types';

// Mock AuthContext
const mockUserData = {
  name: 'Alex Rivera',
  email: 'alex@example.com',
  role: 'customer' as const,
  createdAt: 1700000000000,
};

let mockUser: { uid: string; email: string; getIdToken: () => Promise<string>; emailVerified?: boolean } | null = {
  uid: 'user-123',
  email: 'alex@example.com',
  getIdToken: vi.fn().mockResolvedValue('fake-token'),
  emailVerified: true,
};

vi.mock('@/lib/firebase/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    userData: mockUser ? mockUserData : null,
    loading: false,
  }),
}));

// Mock ProtectedRoute to directly render children
vi.mock('@/lib/firebase/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Next.js navigation hooks
let mockPathname = '/customer/products';
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock products data
const sampleProducts: Product[] = [
  {
    id: 'prod-chair-1',
    name: 'Ergonomic Velvet Lounge Chair',
    category: 'Chair',
    description: 'High-density foam armchair in plush velvet.',
    brand: 'Spatial Studio',
    style: 'Modern',
    material: 'Velvet',
    color: 'Emerald Green',
    price: 18500,
    width: 85,
    height: 92,
    depth: 80,
    stock: 8,
    imageUrl: 'https://example.com/chair.jpg',
    model3dUrl: 'https://example.com/chair.glb',
    retailerId: 'ret-1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'prod-sofa-2',
    name: 'Nordic Minimalist 3-Seater Sofa',
    category: 'Sofa',
    description: 'Clean Scandinavian silhouette with solid oak frame.',
    brand: 'Koben Design',
    style: 'Scandinavian',
    material: 'Oak Wood',
    color: 'Natural Oak',
    price: 45000,
    width: 210,
    height: 80,
    depth: 95,
    stock: 3,
    imageUrl: 'https://example.com/sofa.jpg',
    model3dUrl: 'https://example.com/sofa.glb',
    retailerId: 'ret-1',
    createdAt: '2026-01-02',
    updatedAt: '2026-01-02',
  },
];

vi.mock('@/lib/products', () => ({
  getProducts: vi.fn().mockImplementation(() => Promise.resolve(sampleProducts)),
  getProduct: vi.fn().mockImplementation((id: string) =>
    Promise.resolve(sampleProducts.find((p) => p.id === id) || null)
  ),
}));

describe('Navigation and Page-Content Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      uid: 'user-123',
      email: 'alex@example.com',
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
      emailVerified: true,
    };
    mockPathname = '/customer/products';
    // Mock window hash
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hash: '' },
    });
  });

  describe('Navbar Links & Active States', () => {
    it('renders distinct navigation links for Furniture Catalog and Room Visualizer', () => {
      render(<Navbar />);

      const catalogLink = screen.getByRole('link', { name: /^furniture catalog$/i });
      const visualizerLink = screen.getByRole('link', { name: /^room visualizer$/i });

      expect(catalogLink).toHaveAttribute('href', '/customer/products');
      expect(visualizerLink).toHaveAttribute('href', '/customer/visualizer');
      expect(catalogLink.getAttribute('href')).not.toEqual(visualizerLink.getAttribute('href'));
    });

    it('highlights only Furniture Catalog when on /customer/products', () => {
      mockPathname = '/customer/products';
      render(<Navbar />);

      const catalogLink = screen.getByRole('link', { name: /^furniture catalog$/i });
      const visualizerLink = screen.getByRole('link', { name: /^room visualizer$/i });

      expect(catalogLink.className).toContain('text-[#047857]');
      expect(catalogLink.className).toContain('bg-[#ECFDF5]');
      expect(visualizerLink.className).not.toContain('bg-[#ECFDF5]');
    });

    it('highlights only Room Visualizer when on /customer/visualizer', () => {
      mockPathname = '/customer/visualizer';
      render(<Navbar />);

      const catalogLink = screen.getByRole('link', { name: /^furniture catalog$/i });
      const visualizerLink = screen.getByRole('link', { name: /^room visualizer$/i });

      expect(visualizerLink.className).toContain('text-[#047857]');
      expect(visualizerLink.className).toContain('bg-[#ECFDF5]');
      expect(catalogLink.className).not.toContain('bg-[#ECFDF5]');
    });

    it('renders public links with distinct paths for logged-out visitors', () => {
      mockUser = null;
      render(<Navbar />);

      const catalogLink = screen.getByRole('link', { name: /^furniture catalog$/i });
      const visualizerLink = screen.getByRole('link', { name: /^room visualizer$/i });

      expect(catalogLink).toHaveAttribute('href', '/customer/products');
      expect(visualizerLink).toHaveAttribute('href', '/customer/visualizer');
    });
  });

  describe('Furniture Catalog Page (/customer/products)', () => {
    it('displays the actual furniture catalog without RecommendationPanel at the top', async () => {
      render(<CustomerProductsPage />);

      // Should display Furniture Catalog header
      expect(screen.getByRole('heading', { level: 1, name: /furniture catalog/i })).toBeInTheDocument();

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Ergonomic Velvet Lounge Chair')).toBeInTheDocument();
        expect(screen.getByText('Nordic Minimalist 3-Seater Sofa')).toBeInTheDocument();
      });

      // Product cards with prices formatted in INR (using formatPrice)
      expect(screen.getByText('₹18,500.00')).toBeInTheDocument();
      expect(screen.getByText('₹45,000.00')).toBeInTheDocument();

      // Search & Filters should be present
      expect(screen.getByPlaceholderText(/sofa, wood, scandinavian/i)).toBeInTheDocument();

      // Should NOT render the RecommendationPanel ("AI Furniture Recommendations")
      expect(screen.queryByRole('heading', { level: 2, name: /ai furniture recommendations/i })).toBeNull();
    });
  });

  describe('Room Visualizer Page (/customer/visualizer)', () => {
    it('displays a distinct room-analysis interface with upload area, specifications, and analyze action', async () => {
      render(<CustomerVisualizerPage />);

      // Page Title
      expect(screen.getByRole('heading', { level: 1, name: /ai room visualizer/i })).toBeInTheDocument();

      // Wait for catalog items to load in the visualizer selector
      await waitFor(() => {
        expect(screen.getByLabelText(/choose catalog item/i)).toBeInTheDocument();
      });

      // Target Furniture Piece card
      expect(screen.getByText(/target furniture piece/i)).toBeInTheDocument();

      // Room photo upload area
      expect(screen.getByText(/click to upload your room photo/i)).toBeInTheDocument();
      expect(screen.getByText(/supports jpeg, png, webp \(max 5mb\)/i)).toBeInTheDocument();

      // Analyze Room Action Button
      const analyzeButton = screen.getByRole('button', { name: /analyze room layout with gemini/i });
      expect(analyzeButton).toBeInTheDocument();

      // AI Image synthesis labeled Coming Soon
      expect(screen.getByText(/ai spatial image synthesis/i)).toBeInTheDocument();
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Customer Portal Dashboard (/customer)', () => {
    it('houses AI Furniture Recommendations distinctly on the dashboard', () => {
      render(<CustomerPage />);

      // Dashboard header
      expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();

      // Quick navigation cards
      expect(screen.getByRole('heading', { level: 3, name: /furniture catalog/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /ai room visualizer/i })).toBeInTheDocument();

      // AI Furniture Recommendations panel is rendered here distinctly
      expect(screen.getByRole('heading', { level: 2, name: /ai furniture recommendations/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/room type/i)).toBeInTheDocument();
    });
  });
});
