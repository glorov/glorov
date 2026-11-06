'use client'

import React from 'react'
import { cn } from '../../lib/utils/cn'

export type QuantitySelectorSize = 'sm' | 'md' | 'lg'
export type QuantitySelectorVariant = 'default' | 'cart' | 'pill'

export interface QuantitySelectorProps {
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: QuantitySelectorSize
  variant?: QuantitySelectorVariant
  className?: string
}

/**
 * @component QuantitySelector
 *
 * @description
 * Stepper control for item quantity increment/decrement with 3 distinct size scales:
 * - 'sm': Very small compact pill stepper (26px height), tailored for inside cart items.
 * - 'md': Standard medium stepper (40px height), ideal for lists, modals, and compact cards.
 * - 'lg': Prominent large stepper (44px mobile / 48px desktop height), matching the exact
 *         height and rounded radius of PDP "Add To Cart" & "Buy Now" buttons.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  variant = 'default',
  className,
}: QuantitySelectorProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (value > min && !disabled) {
      onChange(value - 1)
    }
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (value < max && !disabled) {
      onChange(value + 1)
    }
  }

  const isCartStyle = variant === 'cart' || (variant === 'pill' && size === 'sm')

  // Container styling across sizes
  const containerClasses: Record<QuantitySelectorSize, string> = {
    sm: isCartStyle
      ? 'h-[26px] bg-[#F4F9F6] border-[1.1px] border-[#0A4C36] rounded-full px-1 text-[#0A4C36]'
      : 'h-7 sm:h-8 px-1 bg-white border border-[#D1D5DB] rounded-md text-[#111827]',
    md: 'h-10 px-1.5 bg-white border border-[#D1D5DB] rounded-[8px] text-[#111827]',
    lg: 'h-11 sm:h-12 px-2 bg-white border border-[#D1D5DB] rounded-lg sm:rounded-[10px] text-[#111827]',
  }

  // Button sizing across scales
  const buttonClasses: Record<QuantitySelectorSize, string> = {
    sm: isCartStyle
      ? 'w-5 h-5 rounded-full flex items-center justify-center text-[#0A4C36] hover:bg-[#E8F3ED] disabled:opacity-30 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0A4C36]'
      : 'w-6 h-full rounded flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-30 transition-all active:scale-95 focus-visible:outline-none',
    md: 'w-8 h-8 rounded-md flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-stone-100 disabled:opacity-30 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
    lg: 'w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
  }

  // Numeric text sizing
  const textClasses: Record<QuantitySelectorSize, string> = {
    sm: isCartStyle
      ? 'min-w-[18px] text-center font-extrabold text-[11.5px] text-[#0A4C36] px-1 select-none leading-none'
      : 'min-w-[22px] text-center font-bold text-xs text-[#111827] px-1 select-none leading-none',
    md: 'min-w-[28px] sm:min-w-[32px] text-center font-bold text-sm text-[#111827] px-1 select-none',
    lg: 'min-w-[32px] sm:min-w-[36px] text-center font-bold text-sm sm:text-base text-[#111827] px-1 select-none',
  }

  const iconDimension = size === 'sm' ? 10 : size === 'lg' ? 14 : 12
  const strokeWidth = size === 'sm' ? 2.8 : 2.4

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={cn(
        'inline-flex items-center select-none',
        containerClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        aria-label="Decrease quantity"
        className={buttonClasses[size]}
      >
        <svg
          width={iconDimension}
          height={iconDimension}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Numerical Value */}
      <span aria-live="polite" className={textClasses[size]}>
        {value}
      </span>

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        aria-label="Increase quantity"
        className={buttonClasses[size]}
      >
        <svg
          width={iconDimension}
          height={iconDimension}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
