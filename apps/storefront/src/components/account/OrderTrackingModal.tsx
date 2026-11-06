'use client'

import React, { useEffect, useState } from 'react'
import { GlorovImage } from '../ui/GlorovImage'
import type { CustomerOrder, OrderTrackingInfo } from '../../types/account'
import { formatINR } from '../product/ProductPrice'
import { fetchOrderTracking } from '../../lib/api/orders'

export interface OrderTrackingModalProps {
  order: CustomerOrder
  isOpen: boolean
  onClose: () => void
}

interface TimelineStep {
  id: string
  title: string
  subtitle: string
  timestamp?: string
  status: 'completed' | 'current' | 'upcoming'
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo | null>(null)
  const [isLoadingTracking, setIsLoadingTracking] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Fetch real-time tracking data from Medusa / Shiprocket
  useEffect(() => {
    if (!isOpen || !order.id) return

    let isCancelled = false
    setIsLoadingTracking(true)

    fetchOrderTracking(order.id, undefined, order.email)
      .then((res) => {
        if (!isCancelled && res.success && res.tracking) {
          setTrackingInfo(res.tracking)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoadingTracking(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, order.id, order.email])

  if (!isOpen) return null

  const effectiveAwb = trackingInfo?.awb || order.trackingCode
  const effectiveCarrier = trackingInfo?.courier_name || order.carrierName || 'Shiprocket Botanical Cold-Chain'
  const effectiveTrackingUrl = trackingInfo?.tracking_url || order.trackingUrl || (effectiveAwb ? `https://shiprocket.co/tracking/${effectiveAwb}` : null)
  const moistureShield = trackingInfo?.moisture_shield_status || 'Live plant packaged with moisture-retaining sphagnum wrap & breathable air ventilation'

  const handleCopyAwb = () => {
    if (effectiveAwb) {
      navigator.clipboard.writeText(effectiveAwb)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Derive steps based on order status or real tracking scans
  const defaultSteps: TimelineStep[] = [
    {
      id: 'step_1',
      title: 'Order Confirmed & Verified',
      subtitle: 'Order received and nursery dispatch voucher generated',
      timestamp: order.createdAt,
      status: 'completed',
    },
    {
      id: 'step_2',
      title: 'Botanical Quality Check & Hydro-Packed',
      subtitle: 'Roots sealed in nutrient moisture wrap for transit protection',
      timestamp: order.status !== 'pending' ? 'Verified Safe' : undefined,
      status: order.status === 'pending' ? 'current' : 'completed',
    },
    {
      id: 'step_3',
      title: 'Cold-Chain Dispatch & In Transit',
      subtitle: `${effectiveCarrier} in transit`,
      timestamp:
        order.status === 'shipped' || order.status === 'delivered'
          ? 'Dispatched'
          : undefined,
      status:
        order.status === 'pending'
          ? 'upcoming'
          : order.status === 'processing'
          ? 'upcoming'
          : order.status === 'shipped'
          ? 'current'
          : 'completed',
    },
    {
      id: 'step_4',
      title: 'Delivered Fresh & Thriving',
      subtitle: 'Handed over directly to customer at doorstep',
      timestamp: order.status === 'delivered' ? order.estimatedDeliveryDate : undefined,
      status: order.status === 'delivered' ? 'completed' : 'upcoming',
    },
  ]

  const hasRealScans = Array.isArray(trackingInfo?.scans) && trackingInfo.scans.length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Tracking
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-stone-900">
                {order.displayId}
              </span>
              {isLoadingTracking && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <p id="tracking-modal-title" className="text-xs text-stone-500 mt-0.5">
              Botanical Cold-Chain Courier Status
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking window"
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-sm space-y-5 text-xs">
          {/* Tracking & Carrier Info Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-emerald-800 font-medium">Carrier Partner</p>
              <p className="font-bold text-stone-900 text-xs sm:text-sm">
                {effectiveCarrier}
              </p>
              {effectiveAwb && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-stone-600 text-[11px]">AWB: {effectiveAwb}</span>
                  <button
                    type="button"
                    onClick={handleCopyAwb}
                    className="text-[10px] font-bold text-brand-primary underline hover:text-emerald-700"
                  >
                    {copied ? 'Copied!' : 'Copy AWB'}
                  </button>
                </div>
              )}
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] text-emerald-800 font-medium">Estimated Arrival</p>
              <p className="font-bold text-stone-900 text-xs sm:text-sm">
                {order.estimatedDeliveryDate || 'Within 3-5 Days'}
              </p>
              {effectiveTrackingUrl && (
                <a
                  href={effectiveTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline"
                >
                  <span>Track on Courier Site</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Plant Safety Assurance Pill */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-0.5">
              <p className="font-bold">Botanical Moisture & Transit Shield</p>
              <p className="text-amber-800">{moistureShield}</p>
            </div>
          </div>

          {/* Vertical Journey Timeline */}
          <div>
            <h4 className="font-bold text-stone-900 mb-3 text-xs sm:text-sm">Consignment Journey</h4>

            {hasRealScans ? (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {trackingInfo!.scans.map((scan, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-stone-900 text-xs sm:text-sm">{scan.activity}</p>
                        <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">
                          {scan.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{scan.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {defaultSteps.map((step) => {
                  const isCompleted = step.status === 'completed'
                  const isCurrent = step.status === 'current'

                  return (
                    <div key={step.id} className="relative group">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isCurrent
                            ? 'bg-brand-primary text-white ring-4 ring-emerald-200 animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`font-bold text-xs sm:text-sm ${
                              isCompleted || isCurrent ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          {step.timestamp && (
                            <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isCompleted || isCurrent ? 'text-stone-600' : 'text-stone-400'}`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Package Contents */}
          <div className="pt-3 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 mb-2.5 text-xs">Items in this Package ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white border border-stone-200 flex-shrink-0">
                      <GlorovImage
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="36px"
                        className="object-cover"
                        containerClassName="w-full h-full"
                        fallbackTitle={item.title}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 truncate text-[11px]">{item.title}</p>
                      <p className="text-[10px] text-stone-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-700 text-[11px] flex-shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-[11px]">
            <p className="font-bold text-stone-800 mb-1">Delivering To:</p>
            <p className="text-stone-700 font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-stone-600">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
            </p>
            <p className="text-stone-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
          {effectiveTrackingUrl ? (
            <a
              href={effectiveTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-brand-primary text-stone-700 hover:text-brand-primary font-bold text-xs transition"
            >
              Open Courier Tracking ↗
            </a>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  )
}
