'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { cancelCustomerOrderAction } from '@/lib/customer-actions'
import styles from './OrderCancellationButton.module.css'

interface OrderCancellationButtonProps {
  orderId: string
  displayId?: string | number
  status: string
  fulfillmentStatus?: string | null
}

export function OrderCancellationButton({
  orderId,
  displayId,
  status,
  fulfillmentStatus,
}: OrderCancellationButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('Changed mind')
  const [customerNote, setCustomerNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Manage body scroll lock and Escape key dismiss
  React.useEffect(() => {
    if (!isOpen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Determine eligibility:
  // Cannot cancel if already canceled, completed, or shipped
  const isCanceled = status === 'canceled'
  const isCompleted = status === 'completed'
  const isShipped =
    fulfillmentStatus === 'shipped' ||
    fulfillmentStatus === 'delivered' ||
    fulfillmentStatus === 'partially_shipped'

  // If already canceled, completed or dispatched, order cannot be cancelled
  if (isCanceled || isCompleted || isShipped) {
    return null
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await cancelCustomerOrderAction(orderId, {
        reason,
        customer_note: customerNote.trim() || undefined,
      })

      if (!res.success) {
        setError(res.error || 'Failed to cancel order')
        setIsLoading(false)
        return
      }

      setSuccessMessage(
        res.message || `Order #${displayId || orderId} has been successfully canceled.`
      )
      setIsLoading(false)

      setTimeout(() => {
        router.refresh()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error during cancellation')
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={styles.cancelTrigger}
      >
        <XCircle size={15} aria-hidden="true" />
        <span>Cancel Order</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
          className={styles.backdrop}
        >
          <div className={styles.dialogCard}>
            <div className={styles.header}>
              <AlertCircle size={20} color="#dc2626" aria-hidden="true" />
              <h3 id="cancel-dialog-title" className={styles.title}>
                Cancel Order #{displayId || orderId}
              </h3>
            </div>

            <p className={styles.notice}>
              You can cancel this order because it has not yet been dispatched from the Pune Central
              Nursery Hub. Any reserved items will be released back to inventory.
            </p>

            {error && (
              <div role="alert" className={styles.alertError}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div role="status" className={styles.alertSuccess}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{successMessage}</span>
              </div>
            )}

            {!successMessage && (
              <form onSubmit={handleCancel} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="cancel-reason" className={styles.label}>
                    Reason for cancellation
                  </label>
                  <select
                    id="cancel-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Changed mind">Changed my mind</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Need to change delivery address">Need to change delivery address</option>
                    <option value="Need different seed packet size">Need different seed packet size</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cancel-note" className={styles.label}>
                    Additional notes (optional)
                  </label>
                  <textarea
                    id="cancel-note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Provide any details for nursery customer service..."
                    rows={2}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsOpen(false)}
                    className={styles.keepButton}
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.confirmButton}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className={styles.spinner} aria-hidden="true" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
