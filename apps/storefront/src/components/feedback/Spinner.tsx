import React from 'react'
import { cn } from '../../lib/utils/cn'
import { GlorovGSymbol } from '../ui/GlorovGSymbol'
import type { ComponentSize } from '../../types/ui'

export interface SpinnerProps {
  /**
   * Visual size of the spinner.
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * Color theme variant for the spinner.
   * 'botanical-g' renders the branded G SVG logo inside an animated botanical ring.
   * @default 'primary'
   */
  variant?: 'primary' | 'white' | 'muted' | 'botanical-g'
  /**
   * Accessibility label for screen readers.
   * @default 'Loading content...'
   */
  label?: string
  /**
   * Optional custom class names.
   */
  className?: string
}

/**
 * @component Spinner
 *
 * @description
 * Branded loading spinner matching GLOROV colors.
 * Accessible with screen reader label and smooth animation.
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  label = 'Loading...',
  className,
}: SpinnerProps) {
  if (variant === 'botanical-g') {
    const boxSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10'
    const logoPx = size === 'sm' ? 18 : size === 'lg' ? 36 : 22

    return (
      <div
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center relative', boxSize, className)}
      >
        {/* Ambient Ring Track with G Logo Forest Green */}
        <div className="absolute inset-0 rounded-full border-2 border-[#02411a]/15 shadow-sm" />

        {/* Dynamic Rotating Spinner Ring using G SVG Logo Colors */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
          viewBox="0 0 40 40"
          fill="none"
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#71b109"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="75"
            strokeDashoffset="45"
          />
        </svg>

        {/* Centered GLOROV G SVG Logo (Instant Inline Vector) */}
        <div className="relative z-10 flex items-center justify-center animate-pulse">
          <GlorovGSymbol size={logoPx} />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size]

  const colorMap = {
    primary: 'text-forest-deep',
    white: 'text-white',
    muted: 'text-text-muted',
    'botanical-g': 'text-forest-deep',
  }[variant]

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <svg
        className={cn('animate-spin', sizeMap, colorMap)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
