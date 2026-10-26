'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitReturnRequestAction } from '@/lib/customer-actions'
import type { ReturnReason } from '@glorov/types'

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

  // Eligibility:
  // Can only request return for delivered/shipped/completed orders, and NOT canceled.
  const isCanceled = status === 'canceled'
  const isEligible =
    !isCanceled &&
    (fulfillmentStatus === 'delivered' ||
      fulfillmentStatus === 'shipped' ||
      status === 'completed')

  if (!isEligible || items.length === 0) {
    return null
  }

  const selectedItem = items.find((it) => it.id === selectedItemId) || items[0]
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-botanical-800 hover:text-botanical-900 hover:bg-earth-100 border-botanical-300"
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Request Return / Claim
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 text-foreground">
              <RotateCcw className="h-5 w-5 text-botanical-700 shrink-0" />
              <h3 className="text-lg font-bold">Request Return / Claim (Order #{displayId || orderId})</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Submit a return request for eligible seeds or merchandise. For perishable live plants,
              please describe any transit damage or root shock for nursery review.
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Line Item */}
                <div className="space-y-1.5">
                  <label htmlFor="return-item" className="text-xs font-semibold text-foreground">
                    Select Item to Return
                  </label>
                  <select
                    id="return-item"
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value)
                      setQuantity(1)
                    }}
                    className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-botanical-500"
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title} {it.variant_title ? `(${it.variant_title})` : ''} — Ordered: {it.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Quantity */}
                <div className="space-y-1.5">
                  <label htmlFor="return-qty" className="text-xs font-semibold text-foreground">
                    Return Quantity (Max: {maxQty})
                  </label>
                  <input
                    id="return-qty"
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
                    className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-botanical-500"
                  />
                </div>

                {/* Return Reason */}
                <div className="space-y-1.5">
                  <label htmlFor="return-reason" className="text-xs font-semibold text-foreground">
                    Reason for Return / Claim
                  </label>
                  <select
                    id="return-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnReason)}
                    className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-botanical-500"
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
                <div className="space-y-1.5">
                  <label htmlFor="return-remarks" className="text-xs font-semibold text-foreground">
                    Botanical Condition / Observations
                  </label>
                  <textarea
                    id="return-remarks"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Describe packaging condition, unopened seal, or transit defects..."
                    rows={3}
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading}
                    className="bg-botanical-700 hover:bg-botanical-800 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Return Request'
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
