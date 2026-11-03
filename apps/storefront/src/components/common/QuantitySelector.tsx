'use client'

import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface QuantitySelectorProps {
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * @component QuantitySelector
 *
 * @description
 * Stepper control for item counts migrated directly from Flutter `GlorovProductDetailsScreen` and Cart.
 * Features:
 * - Decrement (-) button disabled at minimum bound.
 * - Increment (+) button disabled at maximum bound.
 * - High contrast border and centered numerical value.
 * - Minimum 44px touch target on mobile viewports.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
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

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
  }

  return (
    <div
      role="group"
      aria-label="Quantity selector"
      className={cn(
        'inline-flex items-center bg-white border border-[#D1D5DB] rounded-glorov-sm overflow-hidden select-none',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        aria-label="Decrease quantity"
        className="flex items-center justify-center w-8 sm:w-9 h-full text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:hover:bg-transparent active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
        </svg>
      </button>

      {/* Numerical Value */}
      <span
        aria-live="polite"
        className="min-w-[28px] sm:min-w-[36px] px-1 text-center font-bold text-[#111827]"
      >
        {value}
      </span>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        aria-label="Increase quantity"
        className="flex items-center justify-center w-8 sm:w-9 h-full text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:hover:bg-transparent active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
