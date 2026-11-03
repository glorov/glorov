'use client'

import React, { useState } from 'react'
import type { PaymentMethodType, PaymentOption } from '../../types/checkout'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType
  onSelectMethod: (method: PaymentMethodType) => void
  totalAmount?: number
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cod',
    providerId: 'pp_cod_cod',
    title: 'Cash on Delivery (COD)',
    subtitle: 'Pay safely upon doorstep delivery via cash or courier UPI QR code.',
    icon: 'cod',
    isAvailable: true,
  },
  {
    id: 'upi',
    providerId: 'pp_upi_instant',
    title: 'UPI Instant Transfer',
    subtitle: 'Pay seamlessly via Google Pay, PhonePe, Paytm, or BHIM.',
    icon: 'upi',
    isAvailable: true,
  },
  {
    id: 'card',
    providerId: 'pp_card_simulated',
    title: 'Credit / Debit Card (Simulated)',
    subtitle: 'Demonstration card preview (Visa, MasterCard, RuPay).',
    icon: 'card',
    isAvailable: true,
  },
]

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  totalAmount = 0,
}) => {
  const [upiId, setUpiId] = useState<string>('priya@okhdfcbank')
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242')
  const [cardExpiry, setCardExpiry] = useState<string>('12/28')
  const [cardCvv, setCardCvv] = useState<string>('888')

  const isCodRestricted = totalAmount > 5000

  return (
    <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] shadow-[0_1.5px_6px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      {/* Step Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F2]">
        <div className="w-7 h-7 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
          <GlorovCustomIcons.creditCard size={15} />
        </div>
        <div>
          <h2 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wider">
            3. Payment Method (Demonstration)
          </h2>
          <p className="text-[11px] text-[#6B7280]">
            Secure checkout simulation with zero financial risk
          </p>
        </div>
      </div>

      {/* Flutter Mint Badge Notice */}
      <div className="p-3 rounded-[12px] bg-[#D8F3DC] border border-[#B7E4C7] flex items-start gap-2.5 text-[#0A4C36]">
        <GlorovCustomIcons.info size={16} className="text-[#0A4C36] flex-shrink-0 mt-0.5" />
        <div className="text-[11.5px] font-semibold leading-relaxed">
          <span className="font-extrabold">Simulated Demonstration:</span> No real money, payment gateway credentials, or OTP verification required.
        </div>
      </div>

      {/* Payment Options Radio List */}
      <div role="radiogroup" aria-label="Payment methods" className="flex flex-col gap-2.5">
        {PAYMENT_OPTIONS.map((opt) => {
          const isSelected = opt.id === selectedMethod
          const isOptionRestricted = opt.id === 'cod' && isCodRestricted

          return (
            <div
              key={opt.id}
              className={`rounded-[14px] border transition-all overflow-hidden ${
                isOptionRestricted
                  ? 'border-[#FCA5A5] bg-[#FEF2F2] opacity-75'
                  : isSelected
                  ? 'border-[#0A4C36] bg-[#F2FAF5] ring-2 ring-[#0A4C36]/15 shadow-xs'
                  : 'border-[#E5ECE8] hover:border-[#CBD5E1] bg-white'
              }`}
            >
              <button
                type="button"
                role="radio"
                disabled={isOptionRestricted}
                aria-checked={isSelected}
                aria-disabled={isOptionRestricted}
                onClick={() => {
                  if (!isOptionRestricted) {
                    onSelectMethod(opt.id)
                  }
                }}
                className={`w-full flex items-start gap-3 p-3.5 sm:p-4 text-left ${
                  isOptionRestricted ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {/* Radio Circle */}
                <span
                  className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOptionRestricted
                      ? 'border-[#EF4444] bg-white'
                      : isSelected
                      ? 'border-[#0A4C36] bg-[#0A4C36]'
                      : 'border-[#D1D5DB]'
                  }`}
                >
                  {isSelected && !isOptionRestricted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap justify-between">
                    <span className={`text-[13.5px] font-bold ${isOptionRestricted ? 'text-[#991B1B]' : 'text-[#111827]'}`}>
                      {opt.title}
                    </span>

                    {/* Method Icon / Pill */}
                    <div className="flex items-center gap-1.5">
                      {opt.id === 'cod' && (
                        isOptionRestricted ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#991B1B] bg-[#FEE2E2] border border-[#FCA5A5] px-2 py-0.5 rounded-full">
                            <span>MAX ₹5,000</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                            <GlorovCustomIcons.cash size={12} />
                            <span>NO ADVANCE</span>
                          </span>
                        )
                      )}
                      {opt.id === 'upi' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#1E3A8A] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
                          <GlorovCustomIcons.upi size={11} className="text-[#2563EB]" />
                          <span>GPay • PhonePe • BHIM</span>
                        </div>
                      )}
                      {opt.id === 'card' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#4B5563] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-full">
                          <GlorovCustomIcons.creditCard size={11} />
                          <span>Visa • MC • RuPay</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11.5px] text-[#4B5563] mt-0.5 leading-snug">
                    {isOptionRestricted
                      ? 'Unavailable: Cash on Delivery is restricted to orders up to ₹5,000 for buyer & courier safety. Please select UPI or Card.'
                      : opt.subtitle}
                  </p>
                </div>
              </button>

              {/* Collapsible Details when Selected */}
              {isSelected && opt.id === 'upi' && (
                <div className="px-4 pb-4 pt-1 border-t border-[#DDECE4] flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#374151]">
                    Simulated UPI ID / VPA:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="flex-1 px-3 py-1.5 rounded-[8px] border border-[#D1D5DB] bg-white text-[12px] font-mono text-[#111827] focus:outline-none focus:border-[#0A4C36]"
                    />
                    <span className="px-2.5 py-1.5 rounded-[8px] bg-[#0A4C36] text-white text-[11px] font-bold flex items-center gap-1">
                      <GlorovCustomIcons.check size={12} />
                      <span>Verified</span>
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#059669] flex items-center gap-1">
                    <GlorovCustomIcons.check size={11} />
                    <span>Instant demo authentication enabled. No OTP requested.</span>
                  </p>
                </div>
              )}

              {isSelected && opt.id === 'card' && (
                <div className="px-4 pb-4 pt-1 border-t border-[#DDECE4] flex flex-col gap-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                        Card Number (Demo)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[8px] border border-[#D1D5DB] bg-white text-[12px] font-mono text-[#111827] focus:outline-none focus:border-[#0A4C36]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#374151] mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-[8px] border border-[#D1D5DB] bg-white text-[12px] font-mono text-center text-[#111827] focus:outline-none focus:border-[#0A4C36]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#374151] mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-[8px] border border-[#D1D5DB] bg-white text-[12px] font-mono text-center text-[#111827] focus:outline-none focus:border-[#0A4C36]"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#059669] flex items-center gap-1">
                    <GlorovCustomIcons.shieldCheck size={12} />
                    <span>256-Bit SSL sandbox encryption. Test card pre-approved.</span>
                  </p>
                </div>
              )}

              {isSelected && opt.id === 'cod' && (
                <div className="px-4 pb-3.5 pt-1 border-t border-[#DDECE4]">
                  <p className="text-[11px] text-[#059669] font-medium flex items-center gap-1.5">
                    <GlorovCustomIcons.check size={12} className="text-[#059669]" />
                    <span>No advance charge. Inspect plants at doorstep and pay via cash or UPI QR.</span>
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
