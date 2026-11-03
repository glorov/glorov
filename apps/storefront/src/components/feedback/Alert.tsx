import React from 'react'
import { cn } from '../../lib/utils/cn'
import type { AlertVariant } from '../../types/ui'

export interface AlertProps {
  /**
   * Severity variant determining colors and default icon.
   * @default 'info'
   */
  variant?: AlertVariant
  /**
   * Primary title or heading.
   */
  title?: string
  /**
   * Detailed alert message or children elements.
   */
  children?: React.ReactNode
  /**
   * Optional custom icon override.
   */
  icon?: React.ReactNode
  /**
   * Optional action button slot on the right.
   */
  action?: React.ReactNode
  /**
   * Optional callback when dismiss button is clicked. If passed, renders a close 'X' button.
   */
  onDismiss?: () => void
  /**
   * Custom container class names.
   */
  className?: string
}

/**
 * @component Alert
 *
 * @description
 * Prominent contextual feedback banner.
 * Replaces Flutter alert dialogs and delivery availability banners (`GlorovDeliveryAvailabilityAlert`).
 *
 * @usage
 * Serviceability warnings, out-of-stock notices, checkout warnings, cart coupon feedback.
 *
 * @accessibility
 * - Renders with `role="alert"` for assertive screen reader announcements on error/warning.
 *
 * @example
 * ```tsx
 * <Alert
 *   variant="warning"
 *   title="Perishable Item Notice"
 *   children="Live plants cannot be shipped via COD. Please choose prepaid delivery."
 * />
 * ```
 */
export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-brand-info',
      text: 'text-blue-900',
      iconDefault: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    success: {
      container: 'bg-brand-success-surface border-brand-success/30 text-brand-success',
      text: 'text-emerald-950',
      iconDefault: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-brand-warning-surface border-brand-warning/40 text-brand-warning',
      text: 'text-amber-950',
      iconDefault: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      container: 'bg-brand-error-surface border-brand-error/30 text-brand-error',
      text: 'text-red-950',
      iconDefault: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
  }[variant]

  return (
    <div
      role="alert"
      className={cn(
        'w-full p-4 rounded-md border flex items-start gap-3 transition-colors',
        variantStyles.container,
        className
      )}
    >
      <div className="shrink-0 mt-0.5" aria-hidden="true">
        {icon || variantStyles.iconDefault}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-sans text-title-sm font-semibold mb-0.5', variantStyles.text)}>
            {title}
          </h4>
        )}
        {children && (
          <div className={cn('font-sans text-body-sm leading-relaxed', variantStyles.text)}>
            {children}
          </div>
        )}
      </div>

      {action && <div className="shrink-0 self-center ml-2">{action}</div>}

      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-xs hover:bg-black/5 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
