import React from 'react'
import { cn } from '../../lib/utils/cn'
import type { ComponentSize, ComponentVariant } from '../../types/ui'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Accessible description of the button action for screen readers.
   * Required for accessibility since icon buttons lack text labels.
   */
  'aria-label': string
  /**
   * Icon element to render inside the button.
   */
  icon: React.ReactNode
  /**
   * Visual style variant.
   * @default 'ghost'
   */
  variant?: ComponentVariant
  /**
   * Size affecting button bounds and touch target.
   * Note: On 350px viewports, 'md' guarantees a 44px touch target.
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * Whether the button is in an asynchronous loading state.
   * @default false
   */
  isLoading?: boolean
}

/**
 * @component IconButton
 *
 * @description
 * Compact square/circular action button displaying a single icon.
 * Enforces mandatory accessibility labels (`aria-label`) and mobile touch targets.
 *
 * @usage
 * Use for cart quantity adjusters, modal dismiss buttons, search triggers, wishlist toggles.
 *
 * @when_not_to_use
 * Do not use when space permits a text label; prefer `Button` with `iconLeading` for clarity.
 *
 * @accessibility
 * - Mandatory `aria-label` ensures screen readers describe the action.
 * - Focus-visible ring with brand green offset.
 * - Minimum 44px touch target on `size="md"` prevents mis-taps on 350px mobile screens.
 *
 * @example
 * ```tsx
 * <IconButton
 *   aria-label="Add to wishlist"
 *   icon={<HeartIcon />}
 *   variant="outline"
 *   size="md"
 *   onClick={handleWishlistToggle}
 * />
 * ```
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      icon,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      type = 'button',
      ...restProps
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-sans transition-all duration-200 select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shrink-0'

    const sizeClasses = {
      sm: 'w-8 h-8 min-h-[32px] min-w-[32px] text-body-sm p-1.5',
      md: 'w-11 h-11 min-h-[44px] min-w-[44px] text-body-md p-2.5', // Meets 44px mobile touch target
      lg: 'w-12 h-12 min-h-[48px] min-w-[48px] text-title-lg p-3',
    }[size]

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
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseClasses, sizeClasses, variantClasses, className)}
        {...restProps}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
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
        ) : (
          icon
        )}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
