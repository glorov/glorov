import React from 'react'
import { cn } from '../../lib/utils/cn'
import type { ComponentSize, StatusType } from '../../types/ui'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Semantic status or brand role of the badge.
   * @default 'neutral'
   */
  status?: StatusType | 'brand' | 'discount'
  /**
   * Size of the badge.
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * Optional dot indicator prefix.
   * @default false
   */
  withDot?: boolean
}

/**
 * @component Badge
 *
 * @description
 * Compact visual indicator for product tags, stock states, discounts, and order statuses.
 * Follows the GLOROV botanical theme palette.
 *
 * @usage
 * - Product cards: "Organic", "Heirloom", "20% OFF", "In Stock".
 * - Order tracking: "Delivered", "Dispatched", "Pending".
 *
 * @when_not_to_use
 * Do not use for clickable actions or large text; use a Button or Chip instead.
 *
 * @example
 * ```tsx
 * <Badge status="brand">Organic Heirloom</Badge>
 * <Badge status="discount">25% OFF</Badge>
 * ```
 */
export function Badge({
  children,
  status = 'neutral',
  size = 'md',
  withDot = false,
  className,
  ...restProps
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center font-sans font-semibold rounded-full select-none'

  const sizeClasses = {
    sm: 'text-label-sm px-2 py-0.5 gap-1',
    md: 'text-label-md px-2.5 py-1 gap-1.5',
    lg: 'text-body-sm px-3 py-1.5 gap-2',
  }[size]

  const statusClasses = {
    neutral: 'bg-surface-muted text-text-secondary border border-border-subtle',
    brand: 'bg-mint-badge text-forest-deep border border-mint',
    discount: 'bg-tag-dark-blue text-white',
    success: 'bg-brand-success-surface text-brand-success border border-brand-success/20',
    warning: 'bg-brand-warning-surface text-brand-warning border border-brand-warning/30',
    error: 'bg-brand-error-surface text-brand-error border border-brand-error/20',
    info: 'bg-blue-50 text-brand-info border border-blue-200',
  }[status]

  return (
    <span
      className={cn(baseClasses, sizeClasses, statusClasses, className)}
      {...restProps}
    >
      {withDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            status === 'success' && 'bg-brand-success',
            status === 'warning' && 'bg-brand-warning',
            status === 'error' && 'bg-brand-error',
            status === 'brand' && 'bg-forest-deep',
            status === 'discount' && 'bg-white',
            status === 'info' && 'bg-brand-info',
            status === 'neutral' && 'bg-text-muted'
          )}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  )
}
