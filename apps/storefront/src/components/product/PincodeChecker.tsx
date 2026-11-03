'use client'

import React, { useState } from 'react'

export interface PincodeCheckerProps {
  initialPincode?: string
  onValidated?: (pincode: string) => void
}

/**
 * GLOROV PincodeChecker
 * Indian pincode delivery estimator matching Flutter `_buildDeliveryEstimatePincode()`.
 */
export const PincodeChecker: React.FC<PincodeCheckerProps> = ({
  initialPincode = '',
  onValidated,
}) => {
  const [pincode, setPincode] = useState<string>(initialPincode)
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [deliveryDate, setDeliveryDate] = useState<string>('')
  const [cityInfo, setCityInfo] = useState<string>('')

  const handleCheck = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault()
    const cleanPin = pincode.trim()

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setStatus('invalid')
      return
    }

    setStatus('checking')

    try {
      const res = await fetch(`/api/pincode?pincode=${cleanPin}`)
      const data = await res.json()

      const days = data?.estimated_days || 3
      const now = new Date()
      const estDate = new Date(now.setDate(now.getDate() + days))
      const formatted = estDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      setDeliveryDate(formatted)
      if (data?.city) {
        setCityInfo(data.state ? `${data.city}, ${data.state}` : data.city)
      } else {
        setCityInfo('')
      }
      setStatus('valid')
      if (onValidated) {
        onValidated(cleanPin)
      }
    } catch {
      const now = new Date()
      const estDate = new Date(now.setDate(now.getDate() + 3))
      const formatted = estDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      setDeliveryDate(formatted)
      setStatus('valid')
      if (onValidated) {
        onValidated(cleanPin)
      }
    }
  }

  const handleReset = (): void => {
    setPincode('')
    setStatus('idle')
    setDeliveryDate('')
    setCityInfo('')
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg
          width={18}
          height={18}
          className="w-[18px] h-[18px] text-[#1B4332] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
        <span className="text-[13.5px] font-bold text-[#111827]">
          Delivery Estimate
        </span>
      </div>

      {status !== 'valid' ? (
        <form
          onSubmit={handleCheck}
          className={`h-11 rounded-lg border bg-white flex items-center overflow-hidden transition-colors ${
            status === 'invalid'
              ? 'border-[#EA580C]'
              : 'border-[#D1D5DB] focus-within:border-[#1B4332]'
          }`}
          style={{ borderWidth: '1.2px' }}
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ''))
              if (status === 'invalid') setStatus('idle')
            }}
            placeholder="Enter 6-digit Pincode"
            className="flex-1 h-full px-3.5 text-[13.5px] font-semibold text-[#111827] outline-none border-none placeholder:text-[12.5px] placeholder:text-[#94A3B8] placeholder:font-normal bg-transparent"
            aria-label="Enter 6-digit Pincode"
          />
          <button
            type="submit"
            disabled={status === 'checking' || pincode.length !== 6}
            className="h-full px-5 text-xs font-bold bg-[#758A80] hover:bg-[#63756C] text-white tracking-[0.5px] uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 cursor-pointer"
          >
            {status === 'checking' ? 'CHECKING...' : 'CHECK'}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-xs">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#16A34A] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-bold text-[#111827]">
                Delivering to <span className="underline">{pincode}</span>
                {cityInfo && <span className="text-stone-600 font-medium ml-1">({cityInfo})</span>}
              </p>
              <p className="text-[11px] text-[#16A34A] font-medium">
                Estimated delivery by <span className="font-bold">{deliveryDate}</span> • Free Shipping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-[#1B4332] underline hover:text-[#0F2F24] font-bold"
          >
            Change
          </button>
        </div>
      )}

      {status === 'invalid' && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please enter a valid 6-digit Indian pincode.
        </p>
      )}
    </div>
  )
}
