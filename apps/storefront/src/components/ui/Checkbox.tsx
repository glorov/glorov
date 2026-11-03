import React, { useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Primary label text displayed beside the checkbox.
   */
  label?: React.ReactNode
  /**
   * Optional supporting description text below the label.
   */
  description?: React.ReactNode
  /**
   * Error message displayed below the checkbox.
   */
  error?: string
}

/**
 * @component Checkbox
 *
 * @description
 * Branded botanical checkbox input matching Flutter `checkboxThemeData`.
 * Displays a custom SVG checkmark over a Forest Deep green fill when active.
 *
 * @usage
 * Terms agreement, billing/shipping address match, filter facet selections.
 *
 * @accessibility
 * - Hidden native `<input type="checkbox">` preserves keyboard focus, change events, and screen reader announcements.
 * - Entire label wrapper is clickable with a minimum 44px touch target on mobile viewports.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Billing address same as delivery address"
 *   checked={isSameAddress}
 *   onChange={(e) => setIsSameAddress(e.target.checked)}
 * />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      checked,
      disabled = false,
      id: customId,
      className,
      onChange,
      ...restProps
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = customId || generatedId

    return (
      <div className={cn('flex flex-col', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-start gap-3 cursor-pointer select-none group min-h-[44px] py-1.5',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {/* Custom Checkbox Box */}
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              className="sr-only peer"
              {...restProps}
            />

            <div
              className={cn(
                'w-5 h-5 rounded-sm border transition-all duration-150 flex items-center justify-center',
                // Unchecked
                'bg-surface-pure border-border-medium group-hover:border-forest-deep',
                // Checked
                'peer-checked:bg-forest-deep peer-checked:border-forest-deep',
                // Focus
                'peer-focus-visible:ring-2 peer-focus-visible:ring-forest-deep peer-focus-visible:ring-offset-1',
                // Error state
                error && 'border-brand-error peer-checked:bg-brand-error peer-checked:border-brand-error'
              )}
            >
              {/* Checkmark SVG */}
              <svg
                className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col text-left">
              {label && (
                <span className="font-sans text-body-md font-medium text-text-primary group-hover:text-forest-deep transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <span className="font-sans text-body-sm text-text-muted mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {error && (
          <p role="alert" className="font-sans text-body-sm text-brand-error mt-0.5 ml-8">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
