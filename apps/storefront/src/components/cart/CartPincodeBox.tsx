'use client'

import React, { useState, useEffect } from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface CartPincodeBoxProps {
  onPincodeChange?: (pincode: string) => void
}

/**
 * GLOROV Shifted Interactive Delivery & Pincode Strip
 * 100% matched with Flutter `_buildPincodeBox`:
 * Express transit estimate, expandable 6-digit pincode validation,
 * green check button, and serviceability status alert.
 */
export const CartPincodeBox: React.FC<CartPincodeBoxProps> = ({ onPincodeChange }) => {
  const [activePincode, setActivePincode] = useState<string>('411001')
  const [inputPincode, setInputPincode] = useState<string>('411001')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean>(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('glorov_last_pincode')
      if (saved && saved.trim().length === 6) {
        setActivePincode(saved.trim())
        setInputPincode(saved.trim())
      }
    } catch {}
  }, [])

  const handleCheck = () => {
    const clean = inputPincode.trim()
    if (!clean) return

    setIsChecking(true)
    setTimeout(() => {
      setIsChecking(false)
      if (/^\d{6}$/.test(clean)) {
        setActivePincode(clean)
        setIsValid(true)
        setStatusMessage('Serviceable • Free Express Delivery in 2-3 business days')
        setIsExpanded(false)
        try {
          localStorage.setItem('glorov_last_pincode', clean)
          onPincodeChange?.(clean)
        } catch {}
      } else {
        setIsValid(false)
        setStatusMessage('Please enter a valid 6-digit Indian PIN code')
      }
    }, 400)
  }

  return (
    <div className="w-full px-3.5 py-2.75 rounded-[18px] bg-white border border-[#E5ECE8] transition-colors">
      <div className="flex items-center gap-2">
        {/* Truck Icon */}
        <div className="w-[26px] h-[26px] rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
          <GlorovCustomIcons.truck size={15} />
        </div>

        {/* Text */}
        <p className="flex-1 min-w-0 text-[12px] text-[#4B5563] truncate">
          <span>Deliver to </span>
          <span className="font-extrabold text-[#111827]">{activePincode}</span>
          <span className="font-semibold text-[#059669]"> • Free Express (2–3 Days)</span>
        </p>

        {/* Change/Close Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-0.75 rounded-[12px] bg-[#F0FDF4] border border-[#A7F3D0] text-[10.5px] font-extrabold text-[#0A4C36] hover:bg-[#DCFCE7] transition-colors active:scale-95"
        >
          {isExpanded ? 'Close' : 'Change'}
        </button>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <div className="mt-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCheck()
            }}
            className="h-[40px] flex rounded-[8px] border-[1.2px] border-[#CBD5E1] bg-white overflow-hidden focus-within:border-[#0A4C36]"
          >
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Pincode"
              className="flex-1 px-3 text-[13px] font-semibold text-[#111827] placeholder:text-[#9CA3AF] placeholder:text-[12px] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChecking || inputPincode.length !== 6}
              className="h-full px-4 bg-[#0A4C36] text-white text-[12px] font-extrabold tracking-wider hover:bg-[#135841] transition-colors disabled:opacity-50 active:scale-95"
            >
              {isChecking ? '...' : 'CHECK'}
            </button>
          </form>

          {statusMessage && (
            <p
              className={`mt-1.5 text-[11px] font-semibold ${
                isValid ? 'text-[#059669]' : 'text-[#DC2626]'
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
