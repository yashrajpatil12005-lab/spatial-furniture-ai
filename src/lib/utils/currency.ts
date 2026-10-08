/**
 * Formats a numeric price into Indian Rupee (₹) currency format.
 * Examples:
 *   formatPrice(899.99) -> "₹899.99"
 *   formatPrice(25000)   -> "₹25,000.00"
 */
export function formatPrice(price: number | string | undefined | null): string {
  if (price === undefined || price === null || price === '') {
    return '₹0.00';
  }

  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) {
    return '₹0.00';
  }

  // Format with Indian numbering system (lakhs/crores) and 2 decimal places
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
