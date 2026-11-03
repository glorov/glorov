import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface ProductPriceProps {
  price: number // in INR
  originalPrice?: number // in INR
  discountPercent?: number
  size?: 'sm' | 'md' | 'lg'
  showDiscountBadge?: boolean
  className?: string
}

/**
 * Format number into Indian Rupee string without decimals for clean display
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * @component ProductPrice
 *
 * @description
 * High-craft Indian Rupee pricing display migrated from Flutter `GlorovProductCard` and PDP.
 * Formats pricing with prominent effective price, optional strikethrough original price,
 * and calculated discount badge.
 */
export function ProductPrice({
  price,
  originalPrice,
  discountPercent,
  size = 'md',
  showDiscountBadge = false,
  className,
}: ProductPriceProps) {
  const hasDiscount = originalPrice !== undefined && originalPrice > price
  const computedPercent =
    discountPercent ??
    (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)

  const sizeConfig = {
    sm: {
      effective: 'text-sm sm:text-base font-bold',
      original: 'text-xs',
      badge: 'text-[9px] px-1 py-0.2',
    },
    md: {
      effective: 'text-base sm:text-lg font-extrabold',
      original: 'text-xs sm:text-sm',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      effective: 'text-xl sm:text-2xl font-black',
      original: 'text-sm sm:text-base',
      badge: 'text-xs px-2 py-0.5',
    },
  }

  const currentSize = sizeConfig[size]

  return (
    <div className={cn('inline-flex items-baseline flex-wrap gap-x-2 gap-y-0.5 select-none', className)}>
      {/* Effective Selling Price */}
      <span className={cn('text-[#111827] font-display tracking-tight', currentSize.effective)}>
        {formatINR(price)}
      </span>

      {/* Strikethrough Original Price */}
      {hasDiscount && (
        <span
          className={cn(
            'text-[#94A3B8] line-through font-medium',
            currentSize.original
          )}
          aria-label={`Original price: ${formatINR(originalPrice)}`}
        >
          {formatINR(originalPrice)}
        </span>
      )}

      {/* Savings Percentage Badge */}
      {showDiscountBadge && hasDiscount && computedPercent > 0 && (
        <span
          className={cn(
            'rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase tracking-wider',
            currentSize.badge
          )}
        >
          {computedPercent}% OFF
        </span>
      )}
    </div>
  )
}
