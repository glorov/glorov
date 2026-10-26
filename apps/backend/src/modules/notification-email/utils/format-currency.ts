/**
 * Format currency to Indian Rupees (INR - ₹)
 * Supports primitive numbers, strings, and Medusa v2 BigNumber objects ({ numeric, raw, value }).
 * @param amount - amount in either paise (minor units) or full rupees
 * @param isPaise - whether the input is in paise (default: true for Medusa v2 money amounts)
 */
export function formatINR(amount: unknown, isPaise: boolean = true): string {
  let num = 0

  if (amount !== null && typeof amount === 'object') {
    if ('numeric' in amount && typeof (amount as any).numeric === 'number') {
      num = (amount as any).numeric
    } else if (
      'raw' in amount &&
      typeof (amount as any).raw === 'object' &&
      (amount as any).raw?.value !== undefined
    ) {
      num = Number((amount as any).raw.value) || 0
    } else if ('value' in amount) {
      num = Number((amount as any).value) || 0
    } else {
      num = Number(amount) || 0
    }
  } else if (typeof amount === 'string') {
    num = Number(amount.replace(/[^0-9.-]+/g, '')) || 0
  } else if (typeof amount === 'number') {
    num = isNaN(amount) ? 0 : amount
  }

  const value = isPaise ? num / 100 : num

  // Uses en-IN formatting for Indian numbering (Lakhs and Crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

