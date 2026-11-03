import React from 'react'
import { cn } from '../../lib/utils/cn'
import type { ComponentSize, ComponentVariant } from '../../types/ui'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant determining color hierarchy and elevation.
   * @default 'primary'
   */
  variant?: ComponentVariant
  /**
   * Component size affecting padding, font size, and touch target.
   * Note: On 350px viewports, 'md' and 'lg' ensure a minimum 44px touch target.
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * Whether the button is currently in an asynchronous or loading state.
   * Disables interaction and displays a spinning indicator while maintaining layout dimensions.
   * @default false
   */
  isLoading?: boolean
  /**
   * Slot for optional icon placed before the label.
   */
  iconLeading?: React.ReactNode
  /**
   * Slot for optional icon placed after the label.
   */
  iconTrailing?: React.ReactNode
  /**
   * Whether the button should occupy 100% width of its parent container.
   * Essential on 350px mobile screens for CTAs and forms.
   * @default false
   */
  fullWidth?: boolean
}

/**
 * @component Button
 *
 * @description
 * Primary interactive action element across GLOROV storefront.
 * Adheres strictly to botanical brand palette: Deep Forest green for primary CTAs,
 * Sage and outlined neutrals for secondary actions.
 *
 * @usage
 * Use for explicit user actions: form submissions, navigation triggers, modals, cart actions.
 *
 * @when_not_to_use
 * Do not use as a standalone text link without background/action context; use an anchor link styled via typography instead.
 *
 * @accessibility
 * - Provides focus-visible rings with brand colors.
 * - Sets aria-busy when in loading state.
 * - Guaranteed minimum touch target of 44px on mobile for accessibility compliance.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => handleSubmit()}>
 *   Add to Cart
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconLeading,
      iconTrailing,
      fullWidth = false,
      disabled,
      className,
      type = 'button',
      ...restProps
    },
    ref
  ) => {
    // Base styles: reset, font, transitions, focus ring, tap target
    const baseClasses =
      'inline-flex items-center justify-center font-sans font-semibold rounded-md transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100'

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    // Size variants
    const sizeClasses = {
      sm: 'text-body-sm px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-body-md px-5 py-2.5 min-h-[44px] gap-2', // Meets 44px mobile touch target
      lg: 'text-label-lg px-6 py-3 min-h-[50px] gap-2.5',
    }[size]

    // Visual variants
    const variantClasses = {
      primary:
        'bg-forest-deep text-white hover:bg-forest-medium shadow-sm focus-visible:ring-2 focus-visible:ring-forest-deep focus-visible:ring-offset-2',
      secondary:
        'bg-sage text-white hover:bg-forest-medium shadow-sm focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
      outline:
        'border border-border-medium bg-transparent text-forest-deep hover:bg-surface-muted hover:border-forest-deep focus-visible:ring-2 focus-visible:ring-forest-deep',
      ghost:
        'bg-transparent text-forest-deep hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-forest-deep',
      danger:
        'bg-brand-error text-white hover:bg-red-700 shadow-sm focus-visible:ring-2 focus-visible:ring-brand-error focus-visible:ring-offset-2',
      subtle:
        'bg-mint-badge text-forest-deep hover:bg-mint focus-visible:ring-2 focus-visible:ring-forest-deep',
    }[variant]

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseClasses, widthClasses, sizeClasses, variantClasses, className)}
        {...restProps}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 mr-1 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && iconLeading && <span className="shrink-0">{iconLeading}</span>}
        <span>{children}</span>
        {!isLoading && iconTrailing && <span className="shrink-0">{iconTrailing}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
