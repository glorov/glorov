import React, { useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Visible label displayed above the textarea.
   */
  label?: string
  /**
   * Helper text providing formatting guidance.
   */
  helperText?: string
  /**
   * Error message displayed below textarea.
   */
  error?: string
  /**
   * Whether the textarea container should occupy full parent width.
   * @default true
   */
  fullWidth?: boolean
}

/**
 * @component Textarea
 *
 * @description
 * Multi-line text entry control matching the GLOROV input decoration system.
 * Used for detailed user text such as full street addresses, plant care inquiries, and customer reviews.
 *
 * @accessibility
 * - Automatic `id` linking for label, helper, and error messages via ARIA.
 * - Sets `aria-invalid="true"` when an error message is active.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Street Address / Landmark"
 *   placeholder="Enter complete building, street, and colony"
 *   rows={3}
 *   error={addressError}
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      disabled = false,
      required = false,
      rows = 4,
      id: customId,
      className,
      ...restProps
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = customId || generatedId
    const helperId = `${textareaId}-helper`
    const errorId = `${textareaId}-error`

    const isError = Boolean(error)

    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="font-sans text-title-sm font-semibold text-text-primary mb-1.5 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-brand-error ml-0.5">*</span>}
            </span>
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={isError ? 'true' : undefined}
          aria-describedby={isError ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full bg-surface-pure font-sans text-body-md text-text-primary placeholder:text-text-muted rounded-md p-3.5 transition-colors duration-200 outline-none resize-y min-h-[90px]',
            isError
              ? 'border border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error'
              : 'border border-border-subtle hover:border-border-medium focus:border-forest-deep focus:ring-1 focus:ring-forest-deep',
            disabled && 'bg-surface-muted text-text-disabled cursor-not-allowed border-border-light',
            className
          )}
          {...restProps}
        />

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

Textarea.displayName = 'Textarea'
