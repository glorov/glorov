'use client'

import React, { useState } from 'react'
import type { GlorovProductItem } from '../../types/storefront'
import { useCart } from '../../context/StorefrontContext'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { cn } from '../../lib/utils/cn'

export interface AddToCartButtonProps {
  product?: GlorovProductItem
  quantity?: number
  variant?: 'circular' | 'pill' | 'full'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  inStock?: boolean
  isAdding?: boolean
  onAddToCart?: () => void
  className?: string
}

/**
 * @component AddToCartButton
 *
 * @description
 * Quick add-to-cart button migrated directly from Flutter `GlorovProductCard` and PDP.
 * Provides instant tactile botanical feedback, connects to the unified storefront cart state,
 * and maintains minimum 44px touch targets on mobile viewports.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
  inStock,
  isAdding = false,
  onAddToCart,
  className,
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isSuccess, setIsSuccess] = useState(false)

  const effectiveInStock = inStock !== undefined ? inStock : (product?.inStock ?? true)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!effectiveInStock || isAdding) return

    if (onAddToCart) {
      onAddToCart()
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 1200)
    } else if (product) {
      addToCart(product, quantity)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 1200)
    }
  }

  if (!effectiveInStock) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'px-3 py-1.5 rounded-full bg-gray-200 text-gray-500 font-semibold text-xs cursor-not-allowed select-none min-h-[36px]',
          fullWidth && 'w-full',
          className
        )}
      >
        Sold Out
      </button>
    )
  }

  // Circular Icon Bag Button (matching compact Flutter cards)
  if (variant === 'circular') {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding}
        aria-label={product ? `Add ${product.title} to cart` : 'Add to cart'}
        className={cn(
          'flex items-center justify-center w-9 h-9 min-w-[36px] rounded-full text-white transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
          isSuccess ? 'bg-[#16A34A]' : 'bg-[#1B4332] hover:bg-[#2D6A4F]',
          isAdding && 'opacity-70 cursor-wait',
          className
        )}
      >
        {isSuccess ? (
          <svg width={16} height={16} className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : isAdding ? (
          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
        ) : (
          <GlorovCustomIcons.cart size={16} />
        )}
      </button>
    )
  }

  // Pill / Full Button
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-full',
    md: 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-[12px] lg:text-[13px] font-bold rounded-full',
    lg: 'px-6 py-3 text-sm font-bold rounded-xl',
  }[size]

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isAdding}
      aria-label={product ? `Add ${product.title} to cart` : 'Add to cart'}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 text-white font-bold tracking-wide transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] min-h-[36px] cursor-pointer',
        sizeClasses,
        isSuccess ? 'bg-[#16A34A]' : 'bg-[#1B4332] hover:bg-[#2D6A4F]',
        (variant === 'full' || fullWidth) && 'w-full',
        isAdding && 'opacity-75 cursor-wait',
        className
      )}
    >
      {isSuccess ? (
        <>
          <svg width={16} height={16} className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Added!</span>
        </>
      ) : isAdding ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <span>{variant === 'full' || fullWidth || size === 'lg' ? 'Add to Bag' : 'Add To Cart'}</span>
        </>
      )}
    </button>
  )
}
