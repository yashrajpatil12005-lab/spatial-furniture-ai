import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/utils/currency';

describe('formatPrice utility', () => {
  it('formats positive numbers as INR with currency symbol and 2 decimal places', () => {
    const formatted = formatPrice(12999);
    // Depending on OS/locale space characters, verify currency symbol and numeric structure
    expect(formatted).toContain('₹');
    expect(formatted).toMatch(/12,999\.00/);
  });

  it('formats fractional values correctly', () => {
    const formatted = formatPrice(499.5);
    expect(formatted).toContain('₹');
    expect(formatted).toMatch(/499\.50/);
  });

  it('formats string representations of numbers', () => {
    const formatted = formatPrice('25000');
    expect(formatted).toContain('₹');
    expect(formatted).toMatch(/25,000\.00/);
  });

  it('handles zero correctly', () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain('₹');
    expect(formatted).toMatch(/0\.00/);
  });

  it('handles null, undefined, and empty string gracefully with fallback ₹0.00', () => {
    expect(formatPrice(null)).toBe('₹0.00');
    expect(formatPrice(undefined)).toBe('₹0.00');
    expect(formatPrice('')).toBe('₹0.00');
  });

  it('handles invalid non-numeric strings with fallback ₹0.00', () => {
    expect(formatPrice('abc')).toBe('₹0.00');
    expect(formatPrice(NaN)).toBe('₹0.00');
  });
});
