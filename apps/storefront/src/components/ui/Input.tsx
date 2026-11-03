import React, { useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visible label displayed above the input field.
   */
  label?: string
  /**
   * Helper text providing additional input context or formatting guidance.
   */
  helperText?: string
  /**
   * Error message displayed below input. Passing a non-empty string sets error state.
   */
  error?: string
  /**
   * Optional icon placed inside the left of the input field.
   */
  iconLeading?: React.ReactNode
  /**
   * Optional icon or action placed inside the right of the input field.
   */
  iconTrailing?: React.ReactNode
  /**
   * Whether the input container should take 100% width.
   * @default true
   */
  fullWidth?: boolean
}

/**
 * @component Input
 *
 * @description
 * Primary text entry control mirroring the Flutter `InputDecorationTheme`.
 * Renders with a pure white surface, subtle 1px border, 12px border radius,
 * and active focus ring in GLOROV Forest Deep green.
 *
 * @usage
 * Form fields: login, checkout addresses, pincode validation, product review submission.
 *
 * @accessibility
 * - Automatic `id` generation links label and helper text via `aria-describedby`.
 * - Sets `aria-invalid="true"` when an error message is provided.
 * - Minimum touch height of 44px on mobile viewports.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Delivery Pincode"
 *   placeholder="Enter 6-digit PIN"
 *   maxLength={6}
 *   error={pincodeError}
 *   iconLeading={<LocationIcon />}
 *   onChange={(e) => setPin(e.target.value)}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconLeading,
      iconTrailing,
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
    const inputId = customId || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const isError = Boolean(error)

    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans text-title-sm font-semibold text-text-primary mb-1.5 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-brand-error ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          {iconLeading && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted shrink-0">
              {iconLeading}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={isError ? 'true' : undefined}
            aria-describedby={isError ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-surface-pure font-sans text-body-md text-text-primary placeholder:text-text-muted rounded-md transition-colors duration-200 outline-none min-h-[44px]',
              // Padding: 16px horiz, 12px vert (adapted for leading/trailing icons)
              iconLeading ? 'pl-10' : 'pl-4',
              iconTrailing ? 'pr-10' : 'pr-4',
              'py-2.5',
              // Border and focus
              isError
                ? 'border border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error'
                : 'border border-border-subtle hover:border-border-medium focus:border-forest-deep focus:ring-1 focus:ring-forest-deep',
              disabled && 'bg-surface-muted text-text-disabled cursor-not-allowed border-border-light',
              className
            )}
            {...restProps}
          />

          {iconTrailing && (
            <div className="absolute right-3.5 flex items-center text-text-muted shrink-0">
              {iconTrailing}
            </div>
          )}
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

Input.displayName = 'Input'
