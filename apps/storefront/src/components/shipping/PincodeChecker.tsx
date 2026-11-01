'use client'

import React, { useState, useEffect } from 'react'
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import {
  cleanPincode,
  isValidIndianPincode,
  getStoredPincode,
  setStoredPincode,
  checkPincodeServiceability,
  type PincodeServiceabilityResponse,
} from '@/lib/shipping'
import styles from './PincodeChecker.module.css'

export interface PincodeCheckerProps {
  isPerishable?: boolean
  weightKg?: number
  declaredValueInr?: number
  compact?: boolean
  className?: string
  onServiceabilityChange?: (result: PincodeServiceabilityResponse | null) => void
}

export function PincodeChecker({
  isPerishable = false,
  weightKg = 0.5,
  declaredValueInr = 0,
  compact = false,
  className = '',
  onServiceabilityChange,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [result, setResult] = useState<PincodeServiceabilityResponse | null>(null)

  // Initialize with last checked PIN from localStorage if present
  useEffect(() => {
    const savedPin = getStoredPincode()
    if (savedPin) {
      setPincode(savedPin)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const cleaned = cleanPincode(rawVal)
    setPincode(cleaned)
    setClientError(null)

    // Immediate format check when 6 digits are typed
    if (cleaned.length > 0 && cleaned.startsWith('0')) {
      setClientError('Indian PIN codes cannot start with 0.')
    }
  }

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const clean = cleanPincode(pincode)
    setClientError(null)

    if (!clean) {
      setClientError('Please enter a 6-digit Indian PIN code.')
      return
    }

    if (clean.length < 6) {
      setClientError('Please enter all 6 digits of the PIN code.')
      return
    }

    if (!isValidIndianPincode(clean)) {
      setClientError('Invalid PIN code format. Must be 6 digits and cannot start with 0.')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const res = await checkPincodeServiceability({
        pincode: clean,
        is_perishable: isPerishable,
        weight_kg: weightKg,
        declared_value_inr: declaredValueInr,
      })

      setResult(res)
      if (res.serviceable) {
        setStoredPincode(clean)
      }
      onServiceabilityChange?.(res)
    } catch {
      const fallbackResult: PincodeServiceabilityResponse = {
        pincode: clean,
        serviceable: false,
        status: 'undetermined',
        prepaid_eligible: false,
        cod_available: false,
        cod_eligible: false,
        message: 'Could not connect to shipping gateway. Please retry.',
      }
      setResult(fallbackResult)
      onServiceabilityChange?.(fallbackResult)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPincode('')
    setResult(null)
    setClientError(null)
    onServiceabilityChange?.(null)
  }

  return (
    <div
      className={`${styles.card} ${className}`}
      data-testid="pincode-checker"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div className={styles.iconWrap}>
            <Truck size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Delivery Availability &amp; Timeline</h3>
            {!compact && (
              <p style={{ fontSize: '11px', color: 'var(--ugaoo-text-muted)', margin: '2px 0 0 0' }}>
                Dispatches from Pune Nursery Hub (PIN 411001)
              </p>
            )}
          </div>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--ugaoo-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Check another PIN code"
          >
            <RotateCcw size={12} />
            <span>Change</span>
          </button>
        )}
      </div>

      {/* PIN Input Form */}
      <form onSubmit={handleCheck} className={styles.inputGroup}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--ugaoo-text-muted)' }} />
          <input
            id="delivery-pincode-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={handleInputChange}
            placeholder="Enter 6-digit Indian PIN (e.g. 411001)"
            aria-label="Delivery Pincode"
            aria-invalid={Boolean(clientError)}
            aria-describedby={clientError ? 'pincode-error' : undefined}
            disabled={isLoading}
            className={styles.pinInput}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || pincode.length < 6}
          className={styles.checkBtn}
        >
          {isLoading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={14} className={styles.spinner} />
              <span>Checking...</span>
            </span>
          ) : (
            <span>Check Delivery</span>
          )}
        </button>
      </form>

      {/* Client-side Validation Error */}
      {clientError && (
        <p
          id="pincode-error"
          role="alert"
          className={styles.errorNotice}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{clientError}</span>
        </p>
      )}

      {/* Result Status Display */}
      {result && (
        <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ugaoo-border)' }} role="status" aria-live="polite">
          {/* 1. Confirmed Serviceable */}
          {result.serviceable && result.status === 'confirmed' && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'var(--ugaoo-cream-light)', border: '1px solid var(--ugaoo-border)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ugaoo-green)', fontWeight: 700 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--ugaoo-green)' }} />
                  <span>
                    Delivery Confirmed{' '}
                    {result.city ? `to ${result.city}${result.state ? `, ${result.state}` : ''}` : `to PIN ${result.pincode}`}
                  </span>
                </div>

                {result.rate_inr !== undefined && (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--ugaoo-white)', border: '1px solid var(--ugaoo-border)' }}>
                    ₹{result.rate_inr} Shipping
                  </span>
                )}
              </div>

              {/* Delivery Speed Estimate */}
              {result.estimated_days && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ugaoo-text-dark)', paddingLeft: '22px' }}>
                  <Clock size={14} style={{ color: 'var(--ugaoo-maroon)' }} />
                  <span>
                    Estimated Delivery: <strong>{result.estimated_days} Business Days</strong>
                    {result.courier_name ? ` via ${result.courier_name}` : ''}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px', paddingLeft: '22px' }}>
                {result.cod_eligible ? (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--ugaoo-cream)', color: 'var(--ugaoo-green)', border: '1px solid var(--ugaoo-border)' }}>
                    ✓ Cash on Delivery Available
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                    Prepaid Orders Only
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--ugaoo-white)', color: 'var(--ugaoo-text-muted)', border: '1px solid var(--ugaoo-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} style={{ color: 'var(--ugaoo-green)' }} />
                  <span>Moisture-Shield Packaging</span>
                </span>
              </div>

              {/* Explanation if COD is restricted */}
              {!result.cod_eligible && (
                <p style={{ fontSize: '11px', color: '#92400e', paddingLeft: '22px', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  {result.cod_restriction_reason === 'perishable_transit_guardrail'
                    ? 'Note: Live plants require prepaid express air transit to guarantee botanical viability upon arrival.'
                    : result.cod_restriction_reason === 'remote_corridor'
                      ? 'Note: Remote delivery corridors require prepaid dispatch via priority air carrier.'
                      : 'Note: Cash on Delivery is not supported by courier partners for this postal region.'}
                </p>
              )}
            </div>
          )}

          {/* 2. Confirmed Rejected (Out of Service Area) */}
          {!result.serviceable && result.status === 'rejected' && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#fff5f5', border: '1px solid #ffd0d0', color: 'var(--ugaoo-sale-red)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>Delivery Unavailable to PIN {result.pincode}</span>
              </div>
              <p style={{ margin: 0, paddingLeft: '22px', color: 'var(--ugaoo-text-muted)', fontSize: '11px', lineHeight: 1.5 }}>
                Our logistics partners do not currently service this postal PIN code. We are expanding our express botanical transit corridors across India regularly.
              </p>
            </div>
          )}

          {/* 3. Undetermined / Provider API Outage */}
          {result.status === 'undetermined' && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <AlertTriangle size={16} style={{ color: '#b45309', flexShrink: 0 }} />
                <span>Logistics Verification Temporarily Unavailable</span>
              </div>
              <p style={{ margin: 0, paddingLeft: '22px', color: '#78350f', fontSize: '11px', lineHeight: 1.5 }}>
                Could not connect to the courier serviceability gateway at this moment. You can proceed to checkout where delivery options will be verified directly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
