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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  cleanPincode,
  isValidIndianPincode,
  getStoredPincode,
  setStoredPincode,
  checkPincodeServiceability,
  type PincodeServiceabilityResponse,
} from '@/lib/shipping'

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
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all ${className}`}
      data-testid="pincode-checker"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-botanical-50 text-botanical-700 dark:bg-botanical-900/40 dark:text-botanical-300">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Delivery Availability & Timeline</h3>
            {!compact && (
              <p className="text-xs text-muted-foreground">
                Dispatches from Pune Nursery Hub (PIN 411001)
              </p>
            )}
          </div>
        </div>

        {result && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Check another PIN code"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span>Change</span>
          </Button>
        )}
      </div>

      {/* PIN Input Form */}
      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-botanical-600 disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          variant="botanical"
          size="sm"
          disabled={isLoading || pincode.length < 6}
          className="rounded-xl px-5 h-9 font-semibold shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              <span>Checking...</span>
            </>
          ) : (
            <span>Check Delivery</span>
          )}
        </Button>
      </form>

      {/* Client-side Validation Error */}
      {clientError && (
        <p
          id="pincode-error"
          role="alert"
          className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1.5"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{clientError}</span>
        </p>
      )}

      {/* Result Status Display */}
      {result && (
        <div className="mt-3.5 pt-3.5 border-t border-border/80" role="status" aria-live="polite">
          {/* 1. Confirmed Serviceable */}
          {result.serviceable && result.status === 'confirmed' && (
            <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-3 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Delivery Confirmed{' '}
                    {result.city ? `to ${result.city}${result.state ? `, ${result.state}` : ''}` : `to PIN ${result.pincode}`}
                  </span>
                </div>

                {result.rate_inr !== undefined && (
                  <Badge variant="outline" className="bg-background/80 text-[11px] font-semibold">
                    ₹{result.rate_inr} Shipping
                  </Badge>
                )}
              </div>

              {/* Delivery Speed Estimate */}
              {result.estimated_days && (
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium pl-5">
                  <Clock className="h-3.5 w-3.5 text-botanical-600 shrink-0" />
                  <span>
                    Estimated Delivery: <strong>{result.estimated_days} Business Days</strong>
                    {result.courier_name ? ` via ${result.courier_name}` : ''}
                  </span>
                </div>
              )}

              {/* COD & Payment Eligibility Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 pl-5">
                {result.cod_eligible ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-300 dark:border-emerald-700 bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-[11px] font-medium"
                  >
                    ✓ Cash on Delivery Available
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] font-medium"
                  >
                    Prepaid Orders Only
                  </Badge>
                )}

                <Badge variant="secondary" className="text-[11px] font-normal text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 mr-1 text-botanical-600" />
                  <span>Moisture-Shield Packaging</span>
                </Badge>
              </div>

              {/* Explanation if COD is restricted */}
              {!result.cod_eligible && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300 pl-5 leading-relaxed">
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
            <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 font-bold">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Delivery Unavailable to PIN {result.pincode}</span>
              </div>
              <p className="text-muted-foreground pl-5 leading-relaxed">
                Our logistics partners do not currently service this postal PIN code. We are
                expanding our express botanical transit corridors across India regularly.
              </p>
            </div>
          )}

          {/* 3. Undetermined / Provider API Outage */}
          {result.status === 'undetermined' && (
            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Logistics Verification Temporarily Unavailable</span>
              </div>
              <p className="text-muted-foreground pl-5 leading-relaxed">
                Could not connect to the courier serviceability gateway at this moment. You can
                proceed to checkout where delivery options will be verified directly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
