import React, { useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Visible label displayed above the select field.
   */
  label?: string
  /**
   * Helper text providing selection context.
   */
  helperText?: string
  /**
   * Error message displayed below select.
   */
  error?: string
  /**
   * Array of options to render if children are not provided directly.
   */
  options?: SelectOption[]
  /**
   * Optional placeholder option text rendered as a disabled default.
   */
  placeholder?: string
  /**
   * Whether select container should take full width.
   * @default true
   */
  fullWidth?: boolean
}

/**
 * @component Select
 *
 * @description
 * Form dropdown selection control styled according to GLOROV botanical theme.
 * Wraps an accessible native `<select>` with a custom SVG chevron icon, white background,
 * and 12px radius.
 *
 * @usage
 * Use for catalog sorting options, Indian state pickers, packet-size variants, and review filters.
 *
 * @accessibility
 * - Uses native `<select>` for full mobile OS picker support (iOS Wheel / Android bottom sheet).
 * - Minimum 44px touch height on mobile.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Sort By"
 *   options={[
 *     { value: 'featured', label: 'Featured' },
 *     { value: 'price_asc', label: 'Price: Low to High' },
 *     { value: 'price_desc', label: 'Price: High to Low' },
 *   ]}
 *   onChange={(e) => setSort(e.target.value)}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      children,
      fullWidth = true,
      disabled = false,
      required = false,
      id: customId,
      className,
      ...restProps
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = customId || generatedId
    const helperId = `${selectId}-helper`
    const errorId = `${selectId}-error`

    const isError = Boolean(error)

    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label
            htmlFor={selectId}
            className="font-sans text-title-sm font-semibold text-text-primary mb-1.5 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-brand-error ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={isError ? 'true' : undefined}
            aria-describedby={isError ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full appearance-none bg-surface-pure font-sans text-body-md text-text-primary rounded-md pl-4 pr-10 py-2.5 transition-colors duration-200 outline-none cursor-pointer min-h-[44px]',
              isError
                ? 'border border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error'
                : 'border border-border-subtle hover:border-border-medium focus:border-forest-deep focus:ring-1 focus:ring-forest-deep',
              disabled && 'bg-surface-muted text-text-disabled cursor-not-allowed border-border-light',
              className
            )}
            {...restProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Custom SVG Chevron Icon */}
          <div className="absolute right-3.5 pointer-events-none text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="font-sans text-body-sm text-brand-error mt-1.5 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="font-sans text-body-sm text-text-muted mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
