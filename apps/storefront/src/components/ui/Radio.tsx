import React, { useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Primary label text displayed beside the radio button.
   */
  label?: React.ReactNode
  /**
   * Optional supporting description text below the label.
   */
  description?: React.ReactNode
}

/**
 * @component Radio
 *
 * @description
 * Single-choice option control for mutually exclusive selections.
 * Styled with GLOROV brand green active dot and white background.
 *
 * @usage
 * Checkout payment method selection (Razorpay vs Cash on Delivery), shipping courier tier choice.
 *
 * @accessibility
 * - Native `<input type="radio">` maintained for native keyboard arrow navigation and group semantics.
 * - Minimum 44px mobile touch target.
 *
 * @example
 * ```tsx
 * <Radio
 *   name="payment"
 *   value="razorpay"
 *   label="Razorpay (Cards, UPI, NetBanking)"
 *   description="Instant zero-fee payment confirmation"
 *   checked={paymentMethod === 'razorpay'}
 *   onChange={() => setPaymentMethod('razorpay')}
 * />
 * ```
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
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
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer select-none group min-h-[44px] py-1.5',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...restProps}
          />

          <div
            className={cn(
              'w-5 h-5 rounded-full border transition-all duration-150 flex items-center justify-center',
              // Unchecked
              'bg-surface-pure border-border-medium group-hover:border-forest-deep',
              // Checked
              'peer-checked:border-forest-deep',
              // Focus
              'peer-focus-visible:ring-2 peer-focus-visible:ring-forest-deep peer-focus-visible:ring-offset-1'
            )}
          >
            {/* Inner active dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-forest-deep opacity-0 peer-checked:opacity-100 transition-opacity duration-150" />
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
    )
  }
)

Radio.displayName = 'Radio'
