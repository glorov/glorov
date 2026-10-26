'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelCustomerOrderAction } from '@/lib/customer-actions'

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

  const isEligible = !isCanceled && !isCompleted && !isShipped

  if (!isEligible) {
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
      >
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
        Cancel Order
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center gap-2.5 text-foreground">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <h3 id="cancel-dialog-title" className="text-lg font-bold">
                Cancel Order #{displayId || orderId}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You can cancel this order because it has not yet been dispatched from the Pune Central
              Nursery Hub. Any reserved items will be released back to inventory.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {!successMessage && (
              <form onSubmit={handleCancel} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="cancel-reason" className="text-xs font-semibold text-foreground">
                    Reason for cancellation
                  </label>
                  <select
                    id="cancel-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-botanical-500"
                  >
                    <option value="Changed mind">Changed my mind</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Need to change delivery address">Need to change delivery address</option>
                    <option value="Need different seed packet size">Need different seed packet size</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cancel-note" className="text-xs font-semibold text-foreground">
                    Additional notes (optional)
                  </label>
                  <textarea
                    id="cancel-note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Provide any details for nursery customer service..."
                    rows={2}
                    className="w-full text-xs rounded-lg border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-botanical-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setIsOpen(false)}
                  >
                    Keep Order
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
