'use client'

import React from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { FREE_SHIPPING_THRESHOLD } from '../../context/StorefrontContext'
import {
  buildDynamicMilestoneRoadmap,
  RawOfferLike,
  RoadmapNode,
} from '../../lib/roadmap-utils'

export interface FreeShippingProgressBarProps {
  subtotal: number
  appliedCoupon?: string | null
  onOpenOffers?: () => void
  onApplyCoupon?: (code: string) => void
  onShowNotice?: (msg: string) => void
  offers?: RawOfferLike[]
  className?: string
  hideViewOffersLink?: boolean
}

/**
 * GLOROV Dynamic Milestone Progress Meter
 * 100% matched with Flutter `_buildMilestoneProgressBar` and design reference:
 * Continuous dynamic milestone roadmap generated from active backend database offers,
 * automated collision de-duplication, real-time dynamic shortfall headline,
 * active green gradient fill, and interactive node tapping.
 */
export const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({
  subtotal,
  appliedCoupon,
  onOpenOffers,
  onApplyCoupon,
  onShowNotice,
  offers,
  className = '',
  hideViewOffersLink = false,
}) => {
  // Dynamically compute the roadmap from active database offers
  const roadmap = buildDynamicMilestoneRoadmap(
    offers,
    subtotal,
    appliedCoupon,
    FREE_SHIPPING_THRESHOLD
  )

  const { headline, progressFraction, nodes } = roadmap

  const handleNodeClick = (node: RoadmapNode) => {
    if (node.type === 'free_shipping') {
      if (!node.isReached) {
        const needed = Math.max(0, Math.round(node.minSpend - subtotal))
        onShowNotice?.(`Add ₹${needed} more to unlock Free Express Delivery!`)
      } else {
        onShowNotice?.('🎉 Free Express Delivery is unlocked for this order!')
      }
      return
    }

    if (!node.isReached) {
      const needed = Math.max(0, Math.round(node.minSpend - subtotal))
      onShowNotice?.(`Add ₹${needed} more to unlock ${node.title} (${node.code})`)
      return
    }

    if (node.isApplied) {
      onShowNotice?.(`${node.title} (${node.code}) is currently active!`)
      return
    }

    onApplyCoupon?.(node.code)
  }

  return (
    <div
      onClick={onOpenOffers}
      className={`w-full px-3.5 py-2.25 sm:px-3.5 sm:py-2.25 rounded-[16px] bg-[#F2FAF5] border border-[#C7EBD8] cursor-pointer select-none transition-colors hover:border-[#A3DCBF] ${className}`}
    >
      {/* Top Row: Dynamic Headline on left, View Offers link on right */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-[#1F2937] truncate">
          <span>{headline.prefix}</span>
          <span className="font-extrabold text-[#0A4C36]">{headline.highlight}</span>
        </p>

        {!hideViewOffersLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenOffers?.()
            }}
            className="flex items-center gap-0.5 text-[11px] font-bold text-[#0A4C36] flex-shrink-0 hover:underline"
          >
            <span>View Offers</span>
            <GlorovCustomIcons.chevronRight size={10} className="stroke-[3]" />
          </button>
        )}
      </div>

      {/* Continuous Horizontal Roadmap Track with Dynamic Milestone Nodes */}
      <div className="relative w-full h-[27px] mt-1.5 flex items-center">
        {/* Base Track Line */}
        <div className="absolute left-[12.5px] right-[12.5px] h-[3px] bg-[#D6EAE0] rounded-full" />

        {/* Active Filled Gradient Track Line */}
        <div
          className="absolute left-[12.5px] h-[3px] bg-gradient-to-r from-[#008C4B] to-[#0A4C36] rounded-full transition-all duration-300"
          style={{
            width: `calc(${progressFraction} * (100% - 25px))`,
          }}
        />

        {/* Dynamic Milestone Nodes along the continuous track */}
        {nodes.map((node) => {
          const isRightEdge = node.positionFraction >= 0.99

          return (
            <div
              key={node.id}
              className={`absolute cursor-pointer z-10 transition-transform active:scale-90 ${
                isRightEdge ? 'right-0' : '-translate-x-1/2'
              }`}
              style={
                isRightEdge
                  ? undefined
                  : { left: `calc(12.5px + ${node.positionFraction} * (100% - 25px))` }
              }
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(node)
              }}
              title={`${node.title} — ${node.description} (Min Spend: ₹${node.minSpend})`}
            >
              <div
                className={`w-[25px] h-[25px] rounded-full flex items-center justify-center p-0.5 transition-colors ${
                  node.isApplied
                    ? 'bg-[#0A4C36] text-white border-[1.8px] border-[#0A4C36]'
                    : node.isUpgrade
                      ? 'bg-[#D97706] text-white border-[1.8px] border-[#B45309]'
                      : node.isReached
                        ? 'bg-[#0A4C36] text-white border-[1.4px] border-[#0A4C36]'
                        : 'bg-white text-[#0A4C36] border-[1.4px] border-[#0A4C36]'
                }`}
              >
                <span
                  className={`${
                    node.label.length > 3 ? 'text-[8px]' : 'text-[9.5px]'
                  } font-black tracking-tight leading-none text-center`}
                >
                  {node.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

