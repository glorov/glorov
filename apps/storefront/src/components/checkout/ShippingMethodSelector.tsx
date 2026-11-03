'use client'

import React from 'react'
import type { ShippingOption } from '../../types/cart'
import { DEFAULT_SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from '../../context/StorefrontContext'
import { formatINR } from '../product/ProductPrice'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface ShippingMethodSelectorProps {
  selectedOptionId: string
  onSelectOption: (option: ShippingOption) => void
  subtotal: number
}

export const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  selectedOptionId,
  onSelectOption,
  subtotal,
}) => {
  const isFreeEligible = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] shadow-[0_1.5px_6px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      {/* Step Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F2]">
        <div className="w-7 h-7 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
          <GlorovCustomIcons.truck size={15} />
        </div>
        <div>
          <h2 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wider">
            2. Delivery Speed & Packaging
          </h2>
          <p className="text-[11px] text-[#6B7280]">
            Custom botanical moisture and temperature packaging
          </p>
        </div>
      </div>

      {/* Options List */}
      <div role="radiogroup" aria-label="Shipping options" className="flex flex-col gap-2.5">
        {DEFAULT_SHIPPING_OPTIONS.map((opt) => {
          const isSelected = opt.id === selectedOptionId
          const effectiveAmount = !opt.isExpress && isFreeEligible ? 0 : opt.amount

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectOption(opt)}
              className={`flex items-start justify-between p-3.5 sm:p-4 rounded-[14px] border text-left transition-all ${
                isSelected
                  ? 'border-[#0A4C36] bg-[#F2FAF5] ring-2 ring-[#0A4C36]/15 shadow-xs'
                  : 'border-[#E5ECE8] hover:border-[#CBD5E1] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio Circle */}
                <span
                  className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-[#0A4C36] bg-[#0A4C36]' : 'border-[#D1D5DB]'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-bold text-[#111827]">{opt.name}</span>
                    {opt.isExpress && (
                      <span className="text-[9.5px] font-extrabold text-[#78350F] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Fastest Transit
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-[#4B5563] mt-0.5 leading-snug">{opt.description}</p>
                  <p className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1 font-medium">
                    <GlorovCustomIcons.clock size={12} className="text-[#059669]" />
                    <span>Estimated arrival: {opt.estimatedDays}</span>
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0 pl-3">
                {effectiveAmount === 0 ? (
                  <span className="text-[13px] font-black text-[#0A4C36] uppercase">FREE</span>
                ) : (
                  <span className="text-[13.5px] font-extrabold text-[#111827]">
                    {formatINR(effectiveAmount)}
                  </span>
                )}
                {!opt.isExpress && isFreeEligible && (
                  <span className="block text-[10px] font-bold text-[#059669]">Free over ₹499</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
