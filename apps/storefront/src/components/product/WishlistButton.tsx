'use client'

import React, { useState } from 'react'
import { useWishlist } from '../../context/StorefrontContext'
import { cn } from '../../lib/utils/cn'

export interface WishlistButtonProps {
  productId: string
  productTitle?: string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * @component WishlistButton
 *
 * @description
 * Heart toggle action migrated directly from Flutter `GlorovProductCard`.
 * Renders a circular translucent frosted button with spring bounce animation on toggle,
 * updating central wishlist state and emitting accessible screen reader feedback.
 */
export function WishlistButton({
  productId,
  productTitle = 'product',
  size = 'md',
  className,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isSaved = isInWishlist(productId)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAnimating(true)
    toggleWishlist(productId, productTitle)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isSaved
          ? `Remove ${productTitle} from wishlist`
          : `Add ${productTitle} to wishlist`
      }
      aria-pressed={isSaved}
      className={cn(
        'flex items-center justify-center rounded-full bg-white hover:bg-stone-50 text-gray-700 border border-stone-200/80 transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] z-10',
        sizeClasses[size],
        isAnimating && 'scale-125 duration-200',
        className
      )}
    >
      {isSaved ? (
        <svg
          width={size === 'sm' ? 14 : 16}
          height={size === 'sm' ? 14 : 16}
          className={cn(iconSizes[size], 'text-[#85102F] fill-current animate-in zoom-in-50 shrink-0')}
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          width={size === 'sm' ? 14 : 16}
          height={size === 'sm' ? 14 : 16}
          className={cn(iconSizes[size], 'text-[#4B5563] fill-none stroke-current stroke-2 shrink-0')}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  )
}
