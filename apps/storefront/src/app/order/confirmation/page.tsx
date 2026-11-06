'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { GlorovImage } from '../../../components/ui/GlorovImage'
import { useSearchParams } from 'next/navigation'
import { useCheckout } from '../../../context/StorefrontContext'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { PageContainer } from '../../../components/layout/PageContainer'
import { formatINR } from '../../../components/product/ProductPrice'
import { fetchMedusaOrder } from '../../../lib/api/checkout'
import type { PlacedOrderReceipt } from '../../../types/checkout'

function OrderConfirmationContent(): React.ReactElement {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams ? searchParams.get('id') : null
  const { latestOrder } = useCheckout()
  const { token: authToken } = useCustomerAuth()

  const [order, setOrder] = useState<PlacedOrderReceipt | null>(latestOrder)
  const [isLoading, setIsLoading] = useState<boolean>(!latestOrder && !!orderIdParam)

  // Fetch authoritative order data from Medusa v2 backend if orderId is provided
  useEffect(() => {
    if (!orderIdParam) return

    let isMounted = true
    setIsLoading(true)

    fetchMedusaOrder(orderIdParam, authToken)
      .then((realOrder) => {
        if (isMounted && realOrder) {
          setOrder(realOrder)
        }
      })
      .catch(() => {
        // Fall back to latestOrder if present in state
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [orderIdParam, authToken])

  if (isLoading && !order) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-stone-200 max-w-md mx-auto my-12 animate-pulse">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">Verifying Botanical Order</h2>
        <p className="text-xs text-stone-500">
          Loading your order details from Medusa commerce server...
        </p>
      </div>
    )
  }

  if (!order && !orderIdParam) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-stone-200 max-w-md mx-auto my-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">No Recent Order Found</h2>
        <p className="text-xs text-stone-500 mb-6">
          You do not have any active order sessions. Explore our nursery catalog to place your botanical order.
        </p>
        <Link
          href="/categories/seeds"
          className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider inline-block hover:bg-brand-primary/95 transition"
        >
          Explore Seeds & Plants
        </Link>
      </div>
    )
  }

  // Display receipt with real Medusa data
  const displayId = order?.displayId || `GLR-${orderIdParam?.slice(-6).toUpperCase() || 'ORDER'}`
  const customerEmail = order?.email || order?.shippingAddress?.email || 'customer@example.com'
  const customerName = order?.customerName || order?.shippingAddress?.fullName || 'Botanical Patron'
  const estDelivery = order?.estimatedDeliveryDate || 'Within 3 — 5 Business Days'
  const items = order?.items || []

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* 1. Celebration Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 text-center flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-brand-primary flex items-center justify-center mb-4 ring-8 ring-emerald-50">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-900 mb-2">
          Payment & Order Confirmed
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Thank you, {customerName}!
        </h1>

        <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-md">
          Your botanical order <strong className="font-mono text-stone-800">{displayId}</strong> has been received and is being prepared in our climate-conditioned nursery.
        </p>

        <p className="mt-2 text-xs text-stone-400">
          A receipt and tracking details have been sent to{' '}
          <span className="font-semibold text-stone-700">{customerEmail}</span>.
        </p>
      </div>

      {/* 2. Transit & Cold Chain Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-200/70 text-emerald-900 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-emerald-950 block">Estimated Botanical Delivery</span>
            <span className="text-emerald-800 font-semibold">{estDelivery}</span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-emerald-800 border border-emerald-300">
          Cold Chain Transit Safe Guarantee
        </span>
      </div>

      {/* 3. Delivery & Payment Details Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping Address */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 text-xs">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-2 text-[11px] text-stone-400">
            Delivery Destination
          </h3>
          {order?.shippingAddress ? (
            <div className="text-stone-700 space-y-0.5 leading-snug">
              <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                <span className="font-mono font-semibold">{order.shippingAddress.pincode}</span>
              </p>
              <p className="text-stone-500 pt-1">Phone: +91 {order.shippingAddress.phoneNumber}</p>
            </div>
          ) : (
            <p className="text-stone-500">Standard Indian delivery address</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 text-xs">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-2 text-[11px] text-stone-400">
            Payment Method
          </h3>
          <div className="text-stone-700 space-y-1">
            <p className="font-bold text-stone-900">{order?.paymentMethodTitle || 'Cash on Delivery (COD)'}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">
                Status: {order?.paymentStatus || 'Authorized'}
              </span>
            </div>
            <p className="text-stone-500 text-[11px]">
              Shipping Method: {order?.shippingMethodName || 'Standard Botanical Delivery'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Itemized Order Review */}
      {items.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-xs pb-2 border-b border-stone-100">
            Ordered Botanical Specimens ({items.length})
          </h3>
          <div className="divide-y divide-stone-100">
            {items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                    <GlorovImage
                      src={it.image}
                      alt={it.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      containerClassName="w-full h-full"
                      fallbackTitle={it.title}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{it.title}</p>
                    <p className="text-[11px] text-stone-400">
                      Qty: {it.quantity} {it.variantName ? `• ${it.variantName}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-900 flex-shrink-0">
                  {formatINR(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Ledger Breakdown */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatINR(order?.subtotal || 0)}</span>
            </div>
            {(order?.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Discount</span>
                <span className="font-bold">- {formatINR(order?.discountAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>
                {(order?.shippingAmount || 0) === 0 ? 'FREE' : formatINR(order?.shippingAmount || 0)}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline text-sm font-black text-brand-primary">
              <span>Total Paid / Payable</span>
              <span>{formatINR(order?.totalAmount || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/categories/seeds"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider text-center hover:bg-brand-primary/95 transition"
        >
          Continue Shopping
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider text-center hover:border-brand-primary hover:text-brand-primary transition"
        >
          Print Receipt
        </button>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage(): React.ReactElement {
  return (
    <div className="w-full bg-[#F9FAF8] pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Order Confirmation' },
        ]}
      />
      <PageContainer className="pt-4">
        <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading order receipt...</div>}>
          <OrderConfirmationContent />
        </Suspense>
      </PageContainer>
    </div>
  )
}
