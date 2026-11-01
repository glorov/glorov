'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { submitReturnRequestAction } from '@/lib/customer-actions'
import type { ReturnReason } from '@glorov/types'
import styles from './OrderReturnRequestModal.module.css'

interface OrderLineItem {
  id: string
  title?: string
  variant_title?: string | null
  quantity: number
  unit_price?: number
}

interface OrderReturnRequestModalProps {
  orderId: string
  displayId?: string | number
  status: string
  fulfillmentStatus?: string | null
  items: OrderLineItem[]
}

export function OrderReturnRequestModal({
  orderId,
  displayId,
  status,
  fulfillmentStatus,
  items,
}: OrderReturnRequestModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState<ReturnReason>('damaged_in_transit')
  const [customerNotes, setCustomerNotes] = useState('')
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

  // Eligibility check:
  // Can only return if fulfilled / delivered / shipped and not cancelled
  const isEligible =
    status !== 'canceled' &&
    (fulfillmentStatus === 'delivered' ||
      fulfillmentStatus === 'shipped' ||
      fulfillmentStatus === 'partially_shipped' ||
      status === 'completed')

  if (!isEligible || items.length === 0) {
    return null
  }

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0]
  const maxQty = selectedItem?.quantity || 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedItemId) {
      setError('Please select an item to return')
      setIsLoading(false)
      return
    }

    try {
      const res = await submitReturnRequestAction(orderId, {
        items: [
          {
            line_item_id: selectedItemId,
            quantity: Math.min(quantity, maxQty),
            reason,
            customer_note: customerNotes.trim() || undefined,
          },
        ],
        customer_notes: customerNotes.trim() || undefined,
      })

      if (!res.success) {
        setError(res.error || 'Failed to submit return request')
        setIsLoading(false)
        return
      }

      setSuccessMessage(
        res.message || 'Your return request has been submitted and is pending review by GLOROV nursery team.'
      )
      setIsLoading(false)

      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting return request')
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={styles.returnTrigger}
      >
        <RotateCcw size={15} aria-hidden="true" />
        <span>Request Return / Claim</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
          className={styles.backdrop}
        >
          <div className={styles.dialogCard}>
            <div className={styles.header}>
              <RotateCcw size={20} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
              <h3 id="return-dialog-title" className={styles.title}>
                Request Return / Claim (Order #{displayId || orderId})
              </h3>
            </div>

            <p className={styles.notice}>
              Submit a return request for eligible seeds or merchandise. For perishable live plants,
              please describe any transit damage or root shock for nursery review.
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
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Select Line Item */}
                <div className={styles.formGroup}>
                  <label htmlFor="return-item" className={styles.label}>
                    Select Item to Return
                  </label>
                  <select
                    id="return-item"
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value)
                      setQuantity(1)
                    }}
                    className={styles.select}
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title} {it.variant_title ? `(${it.variant_title})` : ''} — Ordered: {it.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Quantity */}
                <div className={styles.formGroup}>
                  <label htmlFor="return-qty" className={styles.label}>
                    Return Quantity (Max: {maxQty})
                  </label>
                  <input
                    id="return-qty"
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
                    className={styles.input}
                  />
                </div>

                {/* Return Reason */}
                <div className={styles.formGroup}>
                  <label htmlFor="return-reason" className={styles.label}>
                    Reason for Return / Claim
                  </label>
                  <select
                    id="return-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnReason)}
                    className={styles.select}
                  >
                    <option value="damaged_in_transit">Damaged in transit / Crushed packet</option>
                    <option value="defective_quality">Defective quality / Low seed viability</option>
                    <option value="wrong_item">Wrong item or variant received</option>
                    <option value="expired_viability">Past germination test viability date</option>
                    <option value="changed_mind_unopened">Unopened packet (Changed mind within policy)</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                {/* Customer Remarks */}
                <div className={styles.formGroup}>
                  <label htmlFor="return-remarks" className={styles.label}>
                    Botanical Condition / Observations
                  </label>
                  <textarea
                    id="return-remarks"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Describe packaging condition, unopened seal, or transit defects..."
                    rows={3}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsOpen(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className={styles.spinner} aria-hidden="true" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      'Submit Return Request'
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
