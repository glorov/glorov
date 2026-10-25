import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Indian Rupees (INR - ₹)
 * @param amountInPaise - amount in smallest currency unit (paise) or full rupees
 * @param isPaise - whether the input is in paise (default: true for Medusa v2)
 */
export function formatINR(amount: number, isPaise: boolean = true): string {
  const value = isPaise ? amount / 100 : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
