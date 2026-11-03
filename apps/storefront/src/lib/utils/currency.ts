/**
 * Currency formatting utilities for Indian Rupee (INR).
 *
 * IMPORTANT:
 * All prices in Medusa backend and database are stored in **paise** (integers).
 * Example: 4900 paise = ₹49.00
 */

/**
 * Formats a value in paise into a standard Indian Rupee string (e.g. ₹49 or ₹1,499).
 *
 * @param paise - Integer amount in paise (1 INR = 100 paise).
 * @param includeDecimals - Whether to force two decimal places (defaults to false for clean round amounts).
 * @returns Formatted Indian Rupee currency string.
 *
 * @example
 * formatINR(4900) // "₹49"
 * formatINR(4950) // "₹49.50"
 * formatINR(4900, true) // "₹49.00"
 */
export function formatINR(paise: number, includeDecimals = false): string {
  if (!Number.isFinite(paise) || isNaN(paise)) {
    return '₹0'
  }

  const inr = paise / 100
  const hasSubunits = paise % 100 !== 0

  if (!includeDecimals && !hasSubunits) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(inr)
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(inr)
}

/**
 * Calculates discount percentage between original price and sale price.
 *
 * @param originalPaise - Base or compare-at price in paise.
 * @param currentPaise - Current selling price in paise.
 * @returns Integer discount percentage (e.g. 20 for 20% off), or 0 if no discount.
 */
export function calculateDiscountPercent(originalPaise: number, currentPaise: number): number {
  if (originalPaise <= 0 || currentPaise >= originalPaise) {
    return 0
  }
  return Math.round(((originalPaise - currentPaise) / originalPaise) * 100)
}
