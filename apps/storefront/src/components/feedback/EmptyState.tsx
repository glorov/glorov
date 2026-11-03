import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface EmptyStateProps {
  /**
   * Title heading for the empty state.
   */
  title: string
  /**
   * Detailed descriptive message guiding the customer.
   */
  description: string
  /**
   * Optional custom icon or illustration slot.
   */
  icon?: React.ReactNode
  /**
   * Optional call-to-action button or link slot.
   */
  action?: React.ReactNode
  /**
   * Optional container styling classes.
   */
  className?: string
}

/**
 * @component EmptyState
 *
 * @description
 * Single canonical empty state component across GLOROV storefront.
 * Used for empty carts, zero search results, no saved addresses, and empty wishlists.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="Your Cart is Empty"
 *   description="Explore our authentic seeds and live plants to start your garden."
 *   action={<Button onClick={() => router.push('/c/seeds')}>Explore Seeds</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface-pure rounded-lg border border-border-subtle max-w-md mx-auto my-8',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-forest-deep p-3 bg-mint-surface rounded-full">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-display-sm text-text-primary mb-2">
        {title}
      </h3>
      <p className="font-sans text-body-md text-text-muted mb-6 max-w-sm">
        {description}
      </p>
      {action && <div className="w-full flex justify-center">{action}</div>}
    </div>
  )
}
