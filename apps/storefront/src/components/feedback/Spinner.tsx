import React from 'react'
import { cn } from '../../lib/utils/cn'
import type { ComponentSize } from '../../types/ui'

export interface SpinnerProps {
  /**
   * Visual size of the spinner.
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * Color theme variant for the spinner.
   * @default 'primary'
   */
  variant?: 'primary' | 'white' | 'muted'
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
 * Accessible with screen reader label and smooth SVG animation.
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  label = 'Loading...',
  className,
}: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size]

  const colorMap = {
    primary: 'text-forest-deep',
    white: 'text-white',
    muted: 'text-text-muted',
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
