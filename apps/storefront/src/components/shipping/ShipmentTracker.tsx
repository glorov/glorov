'use client'

import React, { useState, useEffect } from 'react'
import {
  Truck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Package,
  MapPin,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface TrackingScan {
  date: string
  activity: string
  location: string
}

export interface TrackingData {
  order_id: string
  display_id?: number | string
  fulfillment_status?: string
  shipping_status:
    | 'processing'
    | 'dispatched'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'rto'
    | 'exception'
  awb?: string | null
  courier_name?: string | null
  tracking_url?: string | null
  origin?: string
  destination_city?: string
  destination_state?: string
  destination_pincode?: string
  is_perishable?: boolean
  moisture_shield_status?: string
  scans?: TrackingScan[]
  message?: string
}

export interface ShipmentTrackerProps {
  orderId: string
  initialTracking?: TrackingData | null
  className?: string
}

const STAGES = [
  { key: 'processing', label: 'Order Confirmed', icon: Package },
  { key: 'dispatched', label: 'Packed & AWB Assigned', icon: ShieldCheck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

export function ShipmentTracker({
  orderId,
  initialTracking,
  className = '',
}: ShipmentTrackerProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(initialTracking || null)
  const [isLoading, setIsLoading] = useState<boolean>(!initialTracking)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    if (initialTracking) {
      setTracking(initialTracking)
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function fetchTracking() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/shipping/tracking/${orderId}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || 'Tracking information could not be retrieved.')
        }

        if (isMounted) {
          setTracking(json.tracking)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error loading shipment tracking')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTracking()

    return () => {
      isMounted = false
    }
  }, [orderId, initialTracking])

  const handleCopyAwb = (awb: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(awb)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-center gap-3 min-h-[140px] ${className}`}
        data-testid="shipment-tracker-loading"
      >
        <Loader2 className="h-5 w-5 animate-spin text-botanical-600" />
        <span className="text-sm font-medium text-muted-foreground">
          Connecting to courier tracking gateway...
        </span>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div
        className={`rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2 ${className}`}
        data-testid="shipment-tracker-error"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Tracking Status Temporarily Unavailable</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error ||
            'Tracking data will update once your parcel is scanned by the courier partner at Pune Nursery Hub.'}
        </p>
      </div>
    )
  }

  // Calculate current progress stage index (0 to 4)
  const currentStatus = tracking.shipping_status || 'processing'
  let currentStageIndex = 0
  if (currentStatus === 'delivered') currentStageIndex = 4
  else if (currentStatus === 'out_for_delivery') currentStageIndex = 3
  else if (currentStatus === 'in_transit') currentStageIndex = 2
  else if (currentStatus === 'dispatched') currentStageIndex = 1
  else currentStageIndex = 0

  const isRto = currentStatus === 'rto'
  const isException = currentStatus === 'exception'

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6 ${className}`}
      data-testid="shipment-tracker"
    >
      {/* Header with Status and Courier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Live Shipment Tracking</h3>
            {currentStatus === 'delivered' ? (
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold">
                Delivered
              </Badge>
            ) : isRto ? (
              <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold">
                Return to Origin
              </Badge>
            ) : isException ? (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold">
                Delivery Rescheduled
              </Badge>
            ) : (
              <Badge variant="botanical" className="text-xs font-semibold">
                {currentStageIndex === 0 ? 'Packing in Progress' : 'In Transit'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dispatched from <strong>{tracking.origin || 'Pune Central Nursery Hub'}</strong>
          </p>
        </div>

        {/* AWB & Courier Badge */}
        {tracking.awb && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                {tracking.courier_name || 'Carrier Partner'}
              </p>
              <p className="text-xs font-mono font-bold text-foreground">{tracking.awb}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleCopyAwb(tracking.awb!)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Copy AWB Number"
              aria-label="Copy AWB number"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            {tracking.tracking_url && (
              <a
                href={tracking.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-botanical-700 hover:text-botanical-900 inline-flex items-center pl-1"
                title="Open carrier tracking page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Visual Timeline Stepper */}
      <div className="pt-2">
        <div className="relative">
          {/* Progress Bar Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-muted rounded-full -z-0 hidden sm:block">
            <div
              className="h-full bg-botanical-600 rounded-full transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2">
            {STAGES.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex
              const isCurrent = idx === currentStageIndex
              const Icon = stage.icon

              return (
                <div
                  key={stage.key}
                  className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-1.5"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-sm ${
                      isCurrent
                        ? 'bg-botanical-700 text-white ring-4 ring-botanical-100 dark:ring-botanical-900/40'
                        : isPassed
                          ? 'bg-botanical-600 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-botanical-950 dark:text-botanical-200'
                          : isPassed
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Botanical Packaging Shield Notice */}
      {tracking.moisture_shield_status && (
        <div className="rounded-xl bg-botanical-50/70 dark:bg-botanical-950/20 border border-botanical-200 dark:border-botanical-800/60 p-3 text-xs flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-botanical-700 shrink-0" />
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Botanical Moisture Shield: </strong>
            {tracking.moisture_shield_status}
          </p>
        </div>
      )}

      {/* Chronological Scan History */}
      {tracking.scans && tracking.scans.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Transit Events &amp; Hub Scans
          </h4>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {tracking.scans.map((scan, idx) => (
              <div key={idx} className="text-xs flex items-start justify-between gap-3 text-muted-foreground border-l-2 border-botanical-300 dark:border-botanical-700 pl-3 py-0.5">
                <div>
                  <p className="font-semibold text-foreground">{scan.activity}</p>
                  <p className="text-[11px] text-muted-foreground">{scan.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-mono">
                    {new Date(scan.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
