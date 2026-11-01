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
import styles from './ShipmentTracker.module.css'

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
        className={`${styles.loadingContainer} ${className}`}
        data-testid="shipment-tracker-loading"
      >
        <Loader2 size={20} className={styles.spinner} />
        <span className={styles.loadingText}>
          Connecting to courier tracking gateway...
        </span>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div
        className={`${styles.errorContainer} ${className}`}
        data-testid="shipment-tracker-error"
      >
        <div className={styles.errorHeader}>
          <AlertCircle size={16} color="#d97706" />
          <span>Tracking Status Temporarily Unavailable</span>
        </div>
        <p className={styles.errorDesc}>
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
      className={`${styles.card} ${className}`}
      data-testid="shipment-tracker"
    >
      {/* Header with Status and Courier */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Live Shipment Tracking</h3>
            {currentStatus === 'delivered' ? (
              <span className={styles.badgeDelivered}>
                Delivered
              </span>
            ) : isRto ? (
              <span className={styles.badgeRto}>
                Return to Origin
              </span>
            ) : isException ? (
              <span className={styles.badgeException}>
                Delivery Rescheduled
              </span>
            ) : (
              <span className={styles.badgeProgress}>
                {currentStageIndex === 0 ? 'Packing in Progress' : 'In Transit'}
              </span>
            )}
          </div>
          <p className={styles.originText}>
            Dispatched from <strong>{tracking.origin || 'Pune Central Nursery Hub'}</strong>
          </p>
        </div>

        {/* AWB & Courier Badge */}
        {tracking.awb && (
          <div className={styles.awbBox}>
            <div className={styles.awbTextCol}>
              <p className={styles.courierLabel}>
                {tracking.courier_name || 'Carrier Partner'}
              </p>
              <p className={styles.awbValue}>{tracking.awb}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAwb(tracking.awb!)}
              className={styles.copyBtn}
              title="Copy AWB Number"
              aria-label="Copy AWB number"
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            </button>
            {tracking.tracking_url && (
              <a
                href={tracking.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.trackingLink}
                title="Open carrier tracking page"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Visual Timeline Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperLineTrack}>
          <div
            className={styles.stepperLineFill}
            style={{
              width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stepper Nodes */}
        <div className={styles.stepperGrid}>
          {STAGES.map((stage, idx) => {
            const isPassed = idx <= currentStageIndex
            const isCurrent = idx === currentStageIndex
            const Icon = stage.icon

            const circleClass = isCurrent
              ? `${styles.nodeCircle} ${styles.nodeCircleCurrent}`
              : isPassed
                ? `${styles.nodeCircle} ${styles.nodeCirclePassed}`
                : `${styles.nodeCircle} ${styles.nodeCirclePending}`

            const labelClass = isCurrent
              ? `${styles.nodeLabel} ${styles.nodeLabelCurrent}`
              : isPassed
                ? `${styles.nodeLabel} ${styles.nodeLabelPassed}`
                : `${styles.nodeLabel} ${styles.nodeLabelPending}`

            return (
              <div key={stage.key} className={styles.stepperNode}>
                <div className={circleClass}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className={labelClass}>{stage.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botanical Packaging Shield Notice */}
      {tracking.moisture_shield_status && (
        <div className={styles.shieldNotice}>
          <ShieldCheck size={16} className={styles.shieldIcon} />
          <p className={styles.shieldText}>
            <strong>Botanical Moisture Shield: </strong>
            {tracking.moisture_shield_status}
          </p>
        </div>
      )}

      {/* Chronological Scan History */}
      {tracking.scans && tracking.scans.length > 0 && (
        <div className={styles.scansSection}>
          <h4 className={styles.scansTitle}>
            Transit Events &amp; Hub Scans
          </h4>
          <div className={styles.scansList}>
            {tracking.scans.map((scan, idx) => (
              <div key={idx} className={styles.scanItem}>
                <div>
                  <p className={styles.scanActivity}>{scan.activity}</p>
                  <p className={styles.scanLocation}>{scan.location}</p>
                </div>
                <p className={styles.scanDate}>
                  {new Date(scan.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
