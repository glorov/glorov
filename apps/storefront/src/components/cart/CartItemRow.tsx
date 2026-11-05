'use client'

import React from 'react'
import type { CartItem } from '../../types/cart'
import { GlorovImage } from '../ui/GlorovImage'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { QuantitySelector } from '../common/QuantitySelector'

export interface CartItemRowProps {
  item: CartItem
  appliedCoupon?: string | null
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  onMoveToWishlist?: () => void
}

/**
 * GLOROV Compact Cart Item Card
 * 100% matched with Flutter `_buildCompactCartItemCard`:
 * 56px square thumbnail with 10px rounded corners, serif title, variant chip,
 * active promo badge, save-for-later link, original price strikethrough + discount pill,
 * and compact botanical green outlined pill stepper.
 */
export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  appliedCoupon,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist: _onMoveToWishlist,
}) => {
  const effectivePrice = item.price
  const originalPrice = item.originalPrice || item.price
  const hasDiscount = originalPrice > effectivePrice
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0

  return (
    <div className="w-full px-2.5 py-2 rounded-[14px] bg-white border border-[#E5ECE8] shadow-[0_1.5px_6px_rgba(0,0,0,0.02)] mb-[7px] transition-all hover:border-[#D0DDD5]">
      <div className="flex items-center gap-2.5">
        {/* 56px Square Thumbnail with 10px rounded corners */}
        <div className="relative w-[56px] h-[56px] rounded-[10px] overflow-hidden bg-[#F3F4F6] flex-shrink-0 border border-[#EFEFEF]">
          {item.image ? (
            <GlorovImage
              src={item.image}
              alt={item.title}
              fill
              sizes="56px"
              className="object-cover object-center"
              containerClassName="w-full h-full"
              fallbackTitle={item.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#16A34A] bg-[#F3F7F5]">
              <GlorovCustomIcons.spa size={22} />
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Row 1: Title and Top-Right Trash Button */}
          <div className="flex items-start justify-between gap-1">
            <h3
              title={item.title}
              className="font-serif text-[13px] font-bold text-[#111827] truncate leading-tight flex-1"
            >
              {item.title}
            </h3>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.title}`}
              className="p-0.5 text-[#9CA3AF] hover:text-[#DC2626] transition-colors rounded active:scale-90"
            >
              <GlorovCustomIcons.trash size={16} />
            </button>
          </div>

          {/* Row 2: Variant chip + applied promo badge */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-[1.5px] rounded-[4px] bg-[#F3F4F6] text-[10px] font-semibold text-[#4B5563] leading-none">
              {item.variantName || '1 gm'}
            </span>

            {appliedCoupon && (
              <span className="flex items-center gap-0.5 px-1.5 py-[1.5px] rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[9px] font-extrabold text-[#047857] leading-none">
                <GlorovCustomIcons.bolt size={9} className="text-[#059669]" />
                <span>{appliedCoupon}</span>
              </span>
            )}
          </div>

          {/* Row 3: Price on Left, Compact Forest Green Stepper on Right */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            {/* Price Stack with Emerald Discount Pill */}
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-[14.5px] font-extrabold text-[#0A4C36] leading-none">
                ₹{Math.round(effectivePrice)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-[11px] font-medium text-[#9CA3AF] line-through leading-none">
                    ₹{Math.round(originalPrice)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="px-1 py-[1px] rounded-[4px] bg-[#E8F5E9] text-[8.5px] font-extrabold text-[#0A4C36] leading-none">
                      {discountPercent}% off
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Compact Botanical Green Outlined Pill Stepper [- 2 +] */}
            <QuantitySelector
              value={item.quantity}
              onChange={onUpdateQuantity}
              min={1}
              max={20}
              size="sm"
              variant="cart"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
