'use client'

import React from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import type { RazorpayPaymentFailureDetails } from '../../types/razorpay'

export interface RazorpayPaymentErrorAlertProps {
  error: string | null
  paymentFailed: RazorpayPaymentFailureDetails | null
  isCancelled?: boolean
  onRetry: () => void
  onSwitchToCod?: () => void
  onDismiss?: () => void
  canSwitchToCod?: boolean
}

/**
 * An accessible and user-friendly error/cancellation alert for Razorpay online payments.
 * Allows instant retry, clear error diagnostics, and easy fallback to COD if eligible.
 */
export const RazorpayPaymentErrorAlert: React.FC<RazorpayPaymentErrorAlertProps> = ({
  error,
  paymentFailed,
  isCancelled,
  onRetry,
  onSwitchToCod,
  onDismiss,
  canSwitchToCod = true,
}) => {
  if (!error && !paymentFailed && !isCancelled) {
    return null
  }

  const isUserCancel = isCancelled && !paymentFailed
  const errorTitle = isUserCancel
    ? 'Payment Cancelled'
    : paymentFailed?.code
    ? `Payment Failed (${paymentFailed.code})`
    : 'Payment Incomplete'

  const description =
    paymentFailed?.description ||
    error ||
    (isUserCancel
      ? 'You closed the payment modal before completing the transaction. Your shopping bag and details are safely preserved.'
      : 'We were unable to verify or finalize your payment. Please try again.')

  return (
    <div
      role="alert"
      className={`w-full p-4 sm:p-5 rounded-[16px] border transition-colors ${
        isUserCancel
          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
          : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isUserCancel ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#FEE2E2] text-[#DC2626]'
          }`}
        >
          {isUserCancel ? (
            <GlorovCustomIcons.info size={18} />
          ) : (
            <GlorovCustomIcons.info size={18} className="text-red-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-[13.5px] leading-tight">
              {errorTitle}
            </h3>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss alert"
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 transition-colors"
              >
                <GlorovCustomIcons.close size={14} />
              </button>
            )}
          </div>

          <p className="text-[12px] mt-1 leading-relaxed opacity-90">
            {description}
          </p>

          {/* Action buttons */}
          <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white font-bold text-[12px] inline-flex items-center gap-1.5 transition-colors"
            >
              <GlorovCustomIcons.refresh size={13} />
              <span>Retry Online Payment</span>
            </button>

            {canSwitchToCod && onSwitchToCod && (
              <button
                type="button"
                onClick={onSwitchToCod}
                className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-[12px] inline-flex items-center gap-1.5 transition-colors"
              >
                <GlorovCustomIcons.cash size={13} />
                <span>Switch to Cash on Delivery (COD)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface RazorpayProcessingOverlayProps {
  isOpen: boolean
  statusMessage?: string
}

/**
 * Overlay indicator shown during Razorpay verification and Medusa cart completion.
 */
export const RazorpayProcessingOverlay: React.FC<RazorpayProcessingOverlayProps> = ({
  isOpen,
  statusMessage = 'Verifying payment with bank & finalizing your order...',
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Payment Processing"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-sm w-full text-center shadow-xl border border-[#E5ECE8] flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#EBF5F0] text-[#0A4C36] flex items-center justify-center animate-pulse">
          <GlorovCustomIcons.shieldCheck size={28} />
        </div>

        <div>
          <h3 className="font-serif text-[17px] font-bold text-[#111827]">
            Securing Botanical Order
          </h3>
          <p className="text-[12px] text-[#6B7280] mt-1.5 leading-relaxed">
            {statusMessage}
          </p>
        </div>

        <div className="w-6 h-6 border-2 border-[#0A4C36]/20 border-t-[#0A4C36] rounded-full animate-spin" />
      </div>
    </div>
  )
}
