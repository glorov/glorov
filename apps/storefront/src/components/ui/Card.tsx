import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the card is an interactive clickable card (applies hover border and subtle shadow).
   * @default false
   */
  interactive?: boolean
  /**
   * Internal padding scale.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /**
   * Header slot element.
   */
  header?: React.ReactNode
  /**
   * Footer slot element.
   */
  footer?: React.ReactNode
}

/**
 * @component Card
 *
 * @description
 * Primary surface container matching Flutter `CardThemeData`.
 * Flat design (`elevation: 0`) with pure white background, 1px subtle neutral border (`borderSubtle`),
 * and 12px corner radius (`rounded-md`).
 *
 * @usage
 * Product showcase items, cart item rows, checkout payment selection boxes, account order summary cards.
 *
 * @example
 * ```tsx
 * <Card
 *   header={<h3 className="font-serif text-title-md">Order Summary</h3>}
 *   footer={<Button fullWidth>Checkout</Button>}
 * >
 *   <p>Items in cart: 3</p>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      interactive = false,
      padding = 'md',
      header,
      footer,
      className,
      ...restProps
    },
    ref
  ) => {
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    }[padding]

    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface-pure rounded-md border border-border-subtle shadow-card overflow-hidden transition-all duration-200',
          interactive &&
            'cursor-pointer hover:border-forest-deep/40 hover:shadow-header active:scale-[0.99]',
          className
        )}
        {...restProps}
      >
        {header && (
          <div className="px-4 py-3.5 sm:px-6 border-b border-border-light bg-surface-pure">
            {header}
          </div>
        )}

        <div className={paddingClasses}>{children}</div>

        {footer && (
          <div className="px-4 py-3 sm:px-6 border-t border-border-light bg-surface-cream/50">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'
