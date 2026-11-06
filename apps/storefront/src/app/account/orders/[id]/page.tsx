'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../../context/CustomerAuthContext'
import { GlorovImage } from '../../../../components/ui/GlorovImage'
import { formatINR } from '../../../../components/product/ProductPrice'
import {
  fetchOrderById,
  fetchOrderTracking,
  cancelOrder,
  submitReturnRequest,
  fetchOrderReturnRequests,
} from '../../../../lib/api/orders'
import type {
  CustomerOrder,
  OrderTrackingInfo,
  ReturnRequestRecord,
  OrderFulfillment,
} from '../../../../types/account'

const CANCELLATION_REASONS = [
  'Customer requested cancellation',
  'Ordered by mistake',
  'Found better price or alternative',
  'Delivery time longer than expected',
  'Need to modify delivery address or phone',
  'Botanical requirements changed',
  'Other',
]

const RETURN_REASONS: Array<{ value: string; label: string }> = [
  { value: 'damaged_in_transit', label: 'Damaged in Transit / Plant Shock' },
  { value: 'defective_quality', label: 'Defective Quality / Health Issue' },
  { value: 'wrong_item', label: 'Wrong Botanical Item Received' },
  { value: 'expired_viability', label: 'Non-Viable / Seed Germination Failure' },
  { value: 'changed_mind_unopened', label: 'Changed Mind (Unopened / Unused)' },
  { value: 'other', label: 'Other Reason' },
]

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { customer, token } = useCustomerAuth()

  const rawOrderId = (params?.id as string) || ''
  const orderId = decodeURIComponent(rawOrderId)
  const initialGuestEmail = searchParams?.get('email') || ''

  // Data states
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [rawOrder, setRawOrder] = useState<{ fulfillments?: OrderFulfillment[]; [key: string]: unknown } | null>(null)
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo | null>(null)
  const [returnRequests, setReturnRequests] = useState<ReturnRequestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Guest lookup verification states
  const [guestEmailInput, setGuestEmailInput] = useState(initialGuestEmail)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(initialGuestEmail || null)
  const [isVerifyingGuest, setIsVerifyingGuest] = useState(false)
  const [guestVerificationError, setGuestVerificationError] = useState<string | null>(null)
  const [requiresGuestVerification, setRequiresGuestVerification] = useState(false)

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0])
  const [cancelCustomerNote, setCancelCustomerNote] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelActionError, setCancelActionError] = useState<string | null>(null)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null)

  // Return Request Modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [selectedItemsForReturn, setSelectedItemsForReturn] = useState<
    Record<string, { selected: boolean; quantity: number; reason: string; customer_note?: string }>
  >({})
  const [returnCustomerNotes, setReturnCustomerNotes] = useState('')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [returnActionError, setReturnActionError] = useState<string | null>(null)
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null)

  const [copiedAwb, setCopiedAwb] = useState(false)

  // Main order loading routine
  const loadOrderDetails = useCallback(
    async (emailForLookup?: string | null) => {
      if (!orderId) return
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const effectiveEmail = emailForLookup || verifiedEmail || initialGuestEmail || undefined
        const res = await fetchOrderById(orderId, token || undefined, effectiveEmail)

        if (res.success && res.order) {
          setOrder(res.order)
          setRawOrder(res.rawOrder || null)
          setRequiresGuestVerification(false)

          // Concurrently load live tracking info & return requests
          fetchOrderTracking(orderId, token || undefined, effectiveEmail)
            .then((trackRes) => {
              if (trackRes.success && trackRes.tracking) {
                setTrackingInfo(trackRes.tracking)
              }
            })
            .catch(() => {})

          fetchOrderReturnRequests(orderId, token || undefined, effectiveEmail)
            .then((retRes) => {
              if (retRes.success && Array.isArray(retRes.return_requests)) {
                setReturnRequests(retRes.return_requests)
              }
            })
            .catch(() => {})
        } else {
          if (res.status === 401 && !customer) {
            setRequiresGuestVerification(true)
          } else {
            setErrorMessage(res.error || 'Failed to retrieve order details')
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error retrieving order'
        setErrorMessage(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [orderId, token, verifiedEmail, initialGuestEmail, customer]
  )

  useEffect(() => {
    loadOrderDetails()
  }, [loadOrderDetails])

  // Guest email submission handler
  const handleVerifyGuestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuestVerificationError(null)

    const clean = guestEmailInput.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      setGuestVerificationError('Please enter a valid email address.')
      return
    }

    setIsVerifyingGuest(true)
    try {
      const res = await fetchOrderById(orderId, undefined, clean)
      if (res.success && res.order) {
        setVerifiedEmail(clean)
        setOrder(res.order)
        setRawOrder(res.rawOrder || null)
        setRequiresGuestVerification(false)

        fetchOrderTracking(orderId, undefined, clean)
          .then((t) => t.success && t.tracking && setTrackingInfo(t.tracking))
          .catch(() => {})

        fetchOrderReturnRequests(orderId, undefined, clean)
          .then((r) => r.success && setReturnRequests(r.return_requests))
          .catch(() => {})
      } else {
        setGuestVerificationError(
          res.error || 'The email address provided does not match this order.'
        )
      }
    } catch {
      setGuestVerificationError('Verification failed. Please check your connection and try again.')
    } finally {
      setIsVerifyingGuest(false)
    }
  }

  // Copy AWB
  const effectiveAwb = trackingInfo?.awb || order?.trackingCode
  const handleCopyAwb = () => {
    if (effectiveAwb) {
      navigator.clipboard.writeText(effectiveAwb)
      setCopiedAwb(true)
      setTimeout(() => setCopiedAwb(false), 2000)
    }
  }

  // Cancellation eligibility check
  const isEligibleForCancellation = useMemo(() => {
    if (!order) return false
    const s = (order.status || '').toLowerCase()
    if (s === 'canceled' || s === 'cancelled' || s === 'completed') return false

    const f = (order.fulfillmentStatus || '').toLowerCase()
    if (f === 'shipped' || f === 'delivered' || f === 'partially_shipped') return false

    const fulfillments: OrderFulfillment[] = Array.isArray(rawOrder?.fulfillments) ? rawOrder.fulfillments : []
    const hasDispatched = fulfillments.some(
      (ful: OrderFulfillment) => !ful.canceled_at && (ful.shipped_at || ful.delivered_at)
    )
    return !hasDispatched
  }, [order, rawOrder])

  // Order Return eligibility check
  const isEligibleForReturn = useMemo(() => {
    if (!order) return false
    const s = (order.status || '').toLowerCase()
    if (s === 'canceled' || s === 'cancelled') return false

    const f = (order.fulfillmentStatus || '').toLowerCase()
    const isDispatchedOrDelivered =
      f === 'shipped' ||
      f === 'delivered' ||
      f === 'fulfilled' ||
      f === 'partially_shipped' ||
      f === 'partially_delivered'

    const fulfillments: OrderFulfillment[] = Array.isArray(rawOrder?.fulfillments) ? rawOrder.fulfillments : []
    const hasActiveDispatched = fulfillments.some(
      (ful: OrderFulfillment) => !ful.canceled_at && (ful.shipped_at || ful.delivered_at)
    )

    return isDispatchedOrDelivered || hasActiveDispatched
  }, [order, rawOrder])

  // Submit Order Cancellation
  const handleConfirmCancellation = async () => {
    if (!order) return
    setIsCancelling(true)
    setCancelActionError(null)

    try {
      const emailToPass = verifiedEmail || order.email || undefined
      const res = await cancelOrder(
        order.id,
        {
          reason: cancelReason,
          customer_note: cancelCustomerNote.trim() || undefined,
          email: emailToPass,
          order_email: emailToPass,
        },
        token || undefined
      )

      if (res.success) {
        setCancelSuccessMsg(res.message || 'Order canceled successfully.')
        setOrder((prev) => (prev ? { ...prev, status: 'canceled' } : null))
        setTimeout(() => {
          setIsCancelModalOpen(false)
          setCancelSuccessMsg(null)
          loadOrderDetails()
        }, 1500)
      } else {
        setCancelActionError(res.message || 'Cancellation failed.')
      }
    } catch {
      setCancelActionError('An unexpected error occurred during cancellation.')
    } finally {
      setIsCancelling(false)
    }
  }

  // Open Return Request Modal with prefilled line items
  const handleOpenReturnModal = () => {
    if (!order) return
    const initialMap: Record<
      string,
      { selected: boolean; quantity: number; reason: string; customer_note?: string }
    > = {}

    order.items.forEach((item) => {
      initialMap[item.id] = {
        selected: false,
        quantity: item.quantity,
        reason: RETURN_REASONS[0].value,
      }
    })

    setSelectedItemsForReturn(initialMap)
    setReturnCustomerNotes('')
    setReturnActionError(null)
    setReturnSuccessMsg(null)
    setIsReturnModalOpen(true)
  }

  // Submit Return Request
  const handleSubmitReturn = async () => {
    if (!order) return
    const selectedList = Object.entries(selectedItemsForReturn)
      .filter(([_, cfg]) => cfg.selected)
      .map(([lineItemId, cfg]) => ({
        line_item_id: lineItemId,
        quantity: cfg.quantity,
        reason: cfg.reason,
        customer_note: cfg.customer_note,
      }))

    if (selectedList.length === 0) {
      setReturnActionError('Please select at least one botanical specimen to return.')
      return
    }

    setIsSubmittingReturn(true)
    setReturnActionError(null)

    try {
      const emailToPass = verifiedEmail || order.email || undefined
      const res = await submitReturnRequest(
        order.id,
        {
          items: selectedList,
          customer_notes: returnCustomerNotes.trim() || undefined,
          email: emailToPass,
          order_email: emailToPass,
        },
        token || undefined
      )

      if (res.success) {
        setReturnSuccessMsg(
          res.message || 'Return request submitted successfully and is pending review.'
        )
        setTimeout(() => {
          setIsReturnModalOpen(false)
          setReturnSuccessMsg(null)
          loadOrderDetails()
        }, 1800)
      } else {
        setReturnActionError(res.message || 'Failed to submit return request.')
      }
    } catch {
      setReturnActionError('An unexpected error occurred while submitting your return request.')
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  // -------------------------------------------------------------
  // RENDER: LOADING STATE
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-primary">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-stone-900 font-serif">Loading Order Details</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Fetching botanical consignment status, cold-chain logs, and fulfillment data from Medusa...
        </p>
      </div>
    )
  }

  // -------------------------------------------------------------
  // RENDER: GUEST EMAIL VERIFICATION REQUIRED
  // -------------------------------------------------------------
  if (requiresGuestVerification) {
    return (
      <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 space-y-5 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">Verify Order Ownership</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            To view order details and tracking for <strong className="font-mono text-stone-800">{orderId}</strong>, please verify the email address used during checkout.
          </p>
        </div>

        <form onSubmit={handleVerifyGuestEmail} className="space-y-3.5 text-left">
          <div>
            <label htmlFor="verify-email" className="block text-xs font-bold text-stone-700 mb-1">
              Checkout Email Address
            </label>
            <input
              id="verify-email"
              type="email"
              value={guestEmailInput}
              onChange={(e) => setGuestEmailInput(e.target.value)}
              placeholder="e.g. patron@glorov.in"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {guestVerificationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {guestVerificationError}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifyingGuest}
            className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/95 transition disabled:opacity-60"
          >
            {isVerifyingGuest ? 'Verifying...' : 'Verify & View Order'}
          </button>
        </form>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-3 text-xs text-stone-500">
          <span>Registered customer?</span>
          <Link href={`/auth/login?redirect=/account/orders/${encodeURIComponent(orderId)}`} className="font-bold text-brand-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // RENDER: ERROR STATE (Not found or access denied)
  // -------------------------------------------------------------
  if (errorMessage || !order) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-stone-900 font-serif">Order Not Found</h3>
        <p className="text-xs text-stone-500">{errorMessage || 'Unable to load order details.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => loadOrderDetails()}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition"
          >
            Retry
          </button>
          <Link
            href="/account/orders"
            className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // RENDER: SUCCESSFUL ORDER DETAIL VIEW
  // -------------------------------------------------------------
  const normalizedStatus = (order.status || 'pending').toLowerCase()
  const statusBadgeCls =
    normalizedStatus === 'delivered' || normalizedStatus === 'completed'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : normalizedStatus === 'shipped'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : normalizedStatus === 'canceled' || normalizedStatus === 'cancelled'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : 'bg-amber-100 text-amber-800 border-amber-200'

  const normalizedPayment = (order.paymentStatus || 'authorized').toLowerCase()
  const paymentBadge =
    normalizedPayment === 'captured'
      ? { text: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : normalizedPayment === 'authorized'
      ? { text: 'Authorized (COD)', cls: 'bg-sky-50 text-sky-700 border-sky-200' }
      : normalizedPayment.includes('refund')
      ? { text: 'Refunded', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
      : { text: order.paymentStatus || 'Pending', cls: 'bg-stone-50 text-stone-600 border-stone-200' }

  const normalizedFulfillment = (order.fulfillmentStatus || 'not_fulfilled').toLowerCase()
  const fulfillmentBadge =
    normalizedFulfillment === 'delivered'
      ? { text: 'Delivered Fresh', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : normalizedFulfillment === 'shipped' || normalizedFulfillment === 'partially_shipped'
      ? { text: 'In Cold-Chain Transit', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
      : normalizedFulfillment === 'fulfilled'
      ? { text: 'Ready for Courier', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      : normalizedFulfillment === 'canceled'
      ? { text: 'Fulfillment Canceled', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
      : { text: 'Preparing in Nursery', cls: 'bg-stone-50 text-stone-600 border-stone-200' }

  const carrierName = trackingInfo?.courier_name || order.carrierName || 'Shiprocket Botanical Cold-Chain'
  const trackingUrl = trackingInfo?.tracking_url || order.trackingUrl || (effectiveAwb ? `https://shiprocket.co/tracking/${effectiveAwb}` : null)
  const moistureShield = trackingInfo?.moisture_shield_status || 'Live plant packaged with moisture-retaining sphagnum wrap & breathable air ventilation'

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-primary transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>All Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          {isEligibleForCancellation && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
            >
              Cancel Order
            </button>
          )}

          {isEligibleForReturn && (
            <button
              type="button"
              onClick={handleOpenReturnModal}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition"
            >
              Request Return
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
          >
            Print Receipt
          </button>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono font-bold text-lg sm:text-xl text-stone-900">
              {order.displayId}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadgeCls}`}>
              {order.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${paymentBadge.cls}`}>
              {paymentBadge.text}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${fulfillmentBadge.cls}`}>
              {fulfillmentBadge.text}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Placed on {order.createdAt} • {order.items.length} {order.items.length === 1 ? 'Specimen' : 'Specimens'}
          </p>
        </div>

        <div className="flex items-baseline gap-2 self-start md:self-center">
          <span className="text-xs text-stone-500">Order Total:</span>
          <span className="text-lg font-black text-brand-primary">
            {formatINR(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Live Consignment Tracking Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Cold-Chain Tracking
            </span>
            <h3 className="font-bold text-stone-900 text-sm mt-1">Consignment Progress</h3>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-stone-500">Carrier: </span>
            <span className="font-bold text-stone-800">{carrierName}</span>
          </div>
        </div>

        {/* Carrier Info & AWB Strip */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-[11px] text-emerald-800 font-medium">Air Waybill (AWB)</p>
            {effectiveAwb ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-stone-900">{effectiveAwb}</span>
                <button
                  type="button"
                  onClick={handleCopyAwb}
                  className="text-[11px] font-bold text-brand-primary underline hover:text-emerald-700"
                >
                  {copiedAwb ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <p className="text-stone-500 font-medium mt-0.5">AWB assignment in progress at nursery hub</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-bold text-xs transition inline-flex items-center gap-1.5"
              >
                <span>Track on Courier Site</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Plant Moisture Shield Status Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-bold">Botanical Quality Shield: </span>
            <span>{moistureShield}</span>
          </div>
        </div>

        {/* Real Scans Timeline */}
        {Array.isArray(trackingInfo?.scans) && trackingInfo.scans.length > 0 ? (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              Transit Log & Milestones
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {trackingInfo.scans.map((scan, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center" />
                  <div className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-stone-900">{scan.activity}</p>
                      <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">{scan.date}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{scan.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-500">
            Fulfillment registered at Pune Nursery Hub. Detailed transit scans will populate once courier scanning commences.
          </div>
        )}
      </div>

      {/* Itemized Botanical Specimens Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90">
        <h3 className="font-bold text-stone-900 text-sm mb-4 pb-2 border-b border-stone-100">
          Ordered Specimens ({order.items.length})
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                  <GlorovImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    containerClassName="w-full h-full"
                    fallbackTitle={item.title}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-stone-900 truncate text-xs sm:text-sm">{item.title}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Quantity: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                  </p>
                  {item.sku && (
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-bold text-stone-900 text-xs sm:text-sm">
                  {formatINR(item.price * item.quantity)}
                </span>
                <p className="text-[10px] text-stone-400">
                  {formatINR(item.price)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Coordinates & Payment Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Coordinates */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 text-xs space-y-2">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] text-stone-400">
            Delivery Coordinates
          </h3>
          <p className="font-bold text-stone-900 text-sm">{order.shippingAddress.fullName}</p>
          <p className="text-stone-600">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-stone-500">{order.shippingAddress.addressLine2}</p>
          )}
          <p className="text-stone-700 font-medium">
            {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
            <span className="font-mono">{order.shippingAddress.pincode}</span>
          </p>
          {order.shippingAddress.phoneNumber && (
            <p className="text-stone-500 pt-1">Phone: +91 {order.shippingAddress.phoneNumber}</p>
          )}
        </div>

        {/* Financial Ledger */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 text-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] text-stone-400 mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">
                  {formatINR(order.subtotal || order.totalAmount)}
                </span>
              </div>
              {(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Savings</span>
                  <span className="font-bold">- {formatINR(order.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Botanical Shipping</span>
                <span>
                  {(order.shippingAmount || 0) === 0 ? 'FREE' : formatINR(order.shippingAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-stone-100 flex justify-between items-baseline">
            <span className="font-bold text-stone-900">Grand Total</span>
            <span className="text-base font-black text-brand-primary">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Return Requests History Section (if any exists) */}
      {returnRequests.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 space-y-4">
          <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">
            Return & Replacement Requests ({returnRequests.length})
          </h3>

          <div className="space-y-3">
            {returnRequests.map((rr) => {
              const rrBadge =
                rr.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : rr.status === 'rejected'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'

              return (
                <div key={rr.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-800">{rr.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${rrBadge}`}>
                        {rr.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">{rr.created_at}</span>
                  </div>

                  <div className="space-y-1">
                    {rr.items.map((it, idx) => (
                      <p key={idx} className="text-stone-700">
                        • {it.quantity}x {it.title} — Reason: <span className="font-medium">{it.reason.replace(/_/g, ' ')}</span>
                      </p>
                    ))}
                  </div>

                  {rr.seller_decision && (
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px]">
                      <p className="font-bold text-stone-800">
                        Nursery Decision: {rr.seller_decision.decision.toUpperCase()}
                      </p>
                      {rr.seller_decision.customer_note && (
                        <p className="text-stone-600 mt-0.5">{rr.seller_decision.customer_note}</p>
                      )}
                      {rr.refund_status && rr.refund_status !== 'not_applicable' && (
                        <p className="text-emerald-700 font-semibold mt-1">
                          Refund Status: {rr.refund_status.toUpperCase()}{' '}
                          {rr.refund_amount_inr ? `(₹${rr.refund_amount_inr})` : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CANCELLATION MODAL */}
      {/* ----------------------------------------------------------- */}
      {isCancelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="fixed inset-0" onClick={() => !isCancelling && setIsCancelModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-5 sm:p-6 space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm font-serif">Cancel Botanical Order</h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Are you sure you want to cancel order <strong className="font-mono text-stone-900">{order.displayId}</strong>?
              If already paid, any captured funds will be automatically queued for refund.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 bg-white"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Optional Note</label>
                <textarea
                  value={cancelCustomerNote}
                  onChange={(e) => setCancelCustomerNote(e.target.value)}
                  placeholder="Provide additional details for our botanical concierge..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>
            </div>

            {cancelActionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {cancelActionError}
              </div>
            )}

            {cancelSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                {cancelSuccessMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isCancelling}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition disabled:opacity-60"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* RETURN REQUEST MODAL */}
      {/* ----------------------------------------------------------- */}
      {isReturnModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="fixed inset-0" onClick={() => !isSubmittingReturn && setIsReturnModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-5 sm:p-6 space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  GLOROV Guarantee
                </span>
                <h3 className="font-bold text-stone-900 text-base font-serif mt-1">
                  Request Item Return or Replacement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                disabled={isSubmittingReturn}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Select the delivered specimen(s) you wish to return. In accordance with our{' '}
              <strong>48-Hour Live Plant Arrival Guarantee</strong>, transit shock or damaged specimens are eligible for free nursery replacement or refund.
            </p>

            {/* Items selection */}
            <div className="space-y-3 text-xs">
              {order.items.map((item) => {
                const itemCfg = selectedItemsForReturn[item.id] || {
                  selected: false,
                  quantity: item.quantity,
                  reason: RETURN_REASONS[0].value,
                }

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition ${
                      itemCfg.selected
                        ? 'border-brand-primary bg-emerald-50/40 ring-1 ring-brand-primary'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={itemCfg.selected}
                        onChange={(e) => {
                          setSelectedItemsForReturn((prev) => ({
                            ...prev,
                            [item.id]: { ...itemCfg, selected: e.target.checked },
                          }))
                        }}
                        className="w-4 h-4 text-brand-primary rounded border-stone-300 focus:ring-brand-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-stone-500">
                          Ordered: {item.quantity} • Unit Price: {formatINR(item.price)}
                        </p>
                      </div>
                    </div>

                    {itemCfg.selected && (
                      <div className="mt-3 pt-3 border-t border-emerald-100/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Quantity to Return
                          </label>
                          <select
                            value={itemCfg.quantity}
                            onChange={(e) => {
                              const q = parseInt(e.target.value, 10)
                              setSelectedItemsForReturn((prev) => ({
                                ...prev,
                                [item.id]: { ...itemCfg, quantity: q },
                              }))
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                          >
                            {Array.from({ length: item.quantity }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n} unit{n > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Return Reason
                          </label>
                          <select
                            value={itemCfg.reason}
                            onChange={(e) => {
                              setSelectedItemsForReturn((prev) => ({
                                ...prev,
                                [item.id]: { ...itemCfg, reason: e.target.value },
                              }))
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                          >
                            {RETURN_REASONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Additional Notes for Nursery Caretaker
                </label>
                <textarea
                  value={returnCustomerNotes}
                  onChange={(e) => setReturnCustomerNotes(e.target.value)}
                  placeholder="Describe specimen condition, hydration level, or transit issues..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>

            {returnActionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {returnActionError}
              </div>
            )}

            {returnSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                {returnSuccessMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                disabled={isSubmittingReturn}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitReturn}
                disabled={isSubmittingReturn}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary/95 transition disabled:opacity-60"
              >
                {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
