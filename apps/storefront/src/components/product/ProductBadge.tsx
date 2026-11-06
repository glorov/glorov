import React from 'react'
import { cn } from '../../lib/utils/cn'

export type ProductBadgeVariant =
  | 'promotional'
  | 'organic'
  | 'bestseller'
  | 'sale'
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'

export interface ProductBadgeProps {
  variant?: ProductBadgeVariant
  children: React.ReactNode
  className?: string
}

/**
 * @component ProductBadge
 *
 * @description
 * Botanical product badge migrated directly from Flutter `GlorovProductCard`.
 * Renders the signature Dark Blue (#0C2340) promotional tag with golden lightning bolt,
 * organic certifications, stock levels, and promotional markers.
 */
export function ProductBadge({
  variant = 'promotional',
  children,
  className,
}: ProductBadgeProps) {
  switch (variant) {
    case 'promotional':
    case 'bestseller':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 bg-[#0C2340] text-white text-[9.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-br-lg select-none',
            className
          )}
        >
          {/* Golden lightning bolt icon matching Flutter */}
          <svg
            width={10}
            height={10}
            className="w-2.5 h-2.5 text-[#F9C74F] shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <span>{children}</span>
        </span>
      )

    case 'organic':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full select-none',
            className
          )}
        >
          <svg width={10} height={10} className="w-2.5 h-2.5 text-emerald-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span>{children}</span>
        </span>
      )

    case 'sale':
      return (
        <span
          className={cn(
            'inline-flex items-center bg-red-100 text-red-800 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full select-none',
            className
          )}
        >
          {children}
        </span>
      )

    case 'in-stock':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold select-none',
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>In Stock</span>
        </span>
      )

    case 'low-stock':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-amber-700 text-xs font-semibold select-none',
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Low Stock</span>
        </span>
      )

    case 'out-of-stock':
      return (
        <span
          className={cn(
            'inline-flex items-center text-gray-500 text-xs font-medium select-none',
            className
          )}
        >
          Out of Stock
        </span>
      )
  }
}
