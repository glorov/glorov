'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GlorovImage } from '../ui/GlorovImage'
import type { CustomerOrder } from '../../types/account'
import { formatINR } from '../product/ProductPrice'
import { OrderTrackingModal } from './OrderTrackingModal'

export interface OrderHistoryCardProps {
  order: CustomerOrder
  onRefresh?: () => void
}

export const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order }) => {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)

  const normalizedStatus = (order.status || 'pending').toLowerCase()

  const statusBadgeClasses =
    {
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-amber-100 text-amber-800 border-amber-200',
      pending: 'bg-stone-100 text-stone-700 border-stone-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      canceled: 'bg-rose-100 text-rose-800 border-rose-200',
    }[normalizedStatus] || 'bg-stone-100 text-stone-700 border-stone-200'

  const normalizedPayment = (order.paymentStatus || 'authorized').toLowerCase()
  const paymentBadge =
    normalizedPayment === 'captured'
      ? { text: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : normalizedPayment === 'authorized'
      ? { text: 'Authorized (COD)', cls: 'bg-sky-50 text-sky-700 border-sky-200' }
      : normalizedPayment.includes('refund')
      ? { text: 'Refunded', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
      : { text: order.paymentStatus || 'Pending', cls: 'bg-stone-50 text-stone-600 border-stone-200' }

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 flex flex-col gap-3 text-xs transition-colors hover:border-stone-300">
        {/* Top Info Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                {order.displayId}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadgeClasses}`}
              >
                {order.status}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${paymentBadge.cls}`}
              >
                {paymentBadge.text}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Placed on {order.createdAt}</p>
          </div>

          <div className="flex items-baseline gap-1.5 self-start sm:self-center">
            <span className="text-stone-500">Total:</span>
            <span className="text-sm font-black text-brand-primary">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="flex flex-col divide-y divide-stone-50">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                  <GlorovImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    containerClassName="w-full h-full"
                    fallbackTitle={item.title}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-stone-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-stone-500">
                    Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-bold text-stone-800 flex-shrink-0">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-stone-500">
            <span>Delivery: </span>
            <span className="font-medium text-stone-700">
              {order.estimatedDeliveryDate || 'Standard Transit'}
            </span>
            {order.trackingCode && (
              <span className="ml-2 font-mono text-stone-400 hidden sm:inline">
                ({order.trackingCode})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}`}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-700 font-bold text-xs transition"
            >
              View Details
            </Link>

            <button
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-brand-primary text-brand-primary hover:bg-emerald-50 font-bold text-xs transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </div>

      {isTrackingOpen && (
        <OrderTrackingModal
          order={order}
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}
    </>
  )
}
