'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageContainer } from '../layout/PageContainer'
import { useToast, useCart } from '../../context/StorefrontContext'
import { MOCK_TRUST_BADGES } from '../../lib/mock-data'
import { cn } from '../../lib/utils/cn'

/**
 * Botanical Trust Icons matching Flutter `GlorovCustomTrustIcon`
 * Exact precision line-art vector paths.
 */
function TrustIcon({
  icon,
  size = 20,
  className = '',
}: {
  icon: string
  size?: number
  className?: string
}) {
  switch (icon) {
    case 'organic-shield':
    case 'shield':
    case 'soil':
      // 1. Organic Shield with checkmark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2.4L20.4 5.28C20.4 14.4 15.6 19.68 12 21.6C8.4 19.68 3.6 14.4 3.6 5.28Z" />
          <path d="M8.4 11.52L11.04 14.4L15.84 9.12" />
        </svg>
      )

    case 'transit-truck':
    case 'shipping':
      // 2. Transit Truck
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2.4 7.2H14.4V16.8H2.4Z" />
          <path d="M14.4 10.56H18L21.12 13.44V16.8H14.4" />
          <circle cx="6.24" cy="18.24" r="1.92" />
          <circle cx="17.76" cy="18.24" r="1.92" />
        </svg>
      )

    case 'replacement':
    case 'replacement-arrows':
      // 3. Free Replacement Loop Arrows
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )

    case 'support-hand':
    case 'support':
    default:
      // 4. Botanical Lifebuoy / Support Icon
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
        </svg>
      )
  }
}

/**
 * Botanical Offer Tag Icon for Offer Banner
 */
function BotanicalTagIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

export interface DynamicOfferBannerData {
  code?: string
  tag?: string
  description?: string
  bg_color?: string
  text_color?: string
  accent_color?: string
  is_active?: boolean
  is_highlighted?: boolean
  [key: string]: unknown
}

/**
 * GLOROV Dynamic Offer Banner component
 * Streamlined, clean, and perfectly proportioned across all devices.
 */
export function GlorovOfferBanner({
  offer,
}: {
  offer?: DynamicOfferBannerData | null
}) {
  const { showToast } = useToast()
  const { applyCoupon, cartCount, welcomeBannerOffer } = useCart()
  const [isCopied, setIsCopied] = useState(false)

  // Only render when an offer is active and explicitly set as the banner
  const activeBanner = (offer !== undefined ? offer : welcomeBannerOffer) as DynamicOfferBannerData | null

  if (!activeBanner || !activeBanner.is_active || !activeBanner.is_highlighted) {
    return null
  }

  const code = activeBanner.code || ''
  const tag = activeBanner.tag || 'SPECIAL WELCOME OFFER'
  const description = activeBanner.description || 'Special promotional discount'
  const bgColor = activeBanner.bg_color || '#EAF4EE'
  const textColor = activeBanner.text_color || '#1B3B2B'
  const accentColor = activeBanner.accent_color || '#1E3D2F'

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setIsCopied(true)
    showToast('success', `Coupon code ${code} copied to clipboard!`, {
      title: 'Discount Copied',
    })

    if (cartCount > 0) {
      applyCoupon(code)
    }

    setTimeout(() => {
      setIsCopied(false)
    }, 2500)
  }

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderColor: isCopied ? accentColor : `${accentColor}40`,
      }}
      className={cn(
        'w-full transition-colors duration-200 border',
        'rounded-[10px] sm:rounded-xl',
        'px-2.5 py-1.5 sm:px-5 sm:py-2.5'
      )}
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Circular Accent Badge */}
        <div
          style={{ backgroundColor: accentColor }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-white"
        >
          <span className="sm:hidden">
            <BotanicalTagIcon size={14} />
          </span>
          <span className="hidden sm:inline-block">
            <BotanicalTagIcon size={17} />
          </span>
        </div>

        {/* Text Details: Short, crisp, and compact */}
        <div className="flex-1 min-w-0">
          <p
            style={{ color: accentColor }}
            className="text-[8.5px] sm:text-[9.5px] font-extrabold tracking-[0.5px] uppercase truncate leading-none"
          >
            {tag}
          </p>
          <p
            style={{ color: textColor }}
            className="text-[10.5px] sm:text-[12.5px] font-semibold truncate mt-0.5 leading-tight"
          >
            {description}
          </p>
        </div>

        {/* Interactive Coupon Pill: Code + Copy Icon only (no redundant 'COPY' text) */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={isCopied ? `Coupon code ${code} copied` : `Copy coupon code ${code}`}
          title={isCopied ? 'Copied to clipboard' : 'Click to copy code'}
          style={{
            borderColor: isCopied ? accentColor : `${accentColor}4D`,
            backgroundColor: isCopied ? `${accentColor}26` : 'rgba(255, 255, 255, 0.95)',
          }}
          className="rounded-md sm:rounded-lg border px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all hover:bg-white active:scale-95"
        >
          <span
            style={{ color: accentColor }}
            className="text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.6px]"
          >
            {code}
          </span>
          {isCopied ? (
            <svg
              style={{ color: accentColor }}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              style={{ color: accentColor }}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * @component ValuePropsRibbon
 *
 * @description
 * Botanical Trust Guarantees Ribbon and Offer Section matching Flutter Web style.
 * Features:
 * - Dynamic botanical offer banner with streamlined short title and clean code pill with copy icon.
 * - Unified 4-pillar trust ribbon in signature GLOROV botanical green (#2D6A4F).
 * - Circular white icon badges with custom line-art botanical icons.
 * - Clean, focused guarantee titles without subtitles for an uncluttered, modern look.
 * - Clean, responsive horizontal ribbon across mobile and desktop.
 */
export function ValuePropsRibbon({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white py-1.5 sm:py-2 md:py-2.5', className)}>
      <PageContainer className="space-y-2 sm:space-y-2.5">
        {/* 1. Dynamic Botanical Offer Welcome Banner */}
        <GlorovOfferBanner />

        {/* 2. The Unified Trust Ribbon Bar (Forest Medium #2D6A4F) - Compact & Elegant */}
        <div
          role="region"
          aria-label="GLOROV botanical trust guarantees and policies"
          className="w-full bg-[#2D6A4F] text-white rounded-xl sm:rounded-2xl px-2.5 py-2.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3 shadow-[0_4px_16px_rgba(45,106,79,0.12)]"
        >
          <div className="flex items-center justify-between w-full">
            {MOCK_TRUST_BADGES.map((badge, idx) => {
              const itemContent = (
                <div className="flex-1 min-w-0 flex flex-col md:flex-row items-center justify-center text-center md:text-left px-0.5 sm:px-1 md:px-2 lg:px-3 group gap-1 sm:gap-1.5 md:gap-2.5 lg:gap-3">
                  {/* Circular White Badge */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-8.5 md:h-8.5 lg:w-9.5 lg:h-9.5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                    <span className="text-[#2D6A4F] flex items-center justify-center">
                      <span className="md:hidden">
                        <TrustIcon icon={badge.icon} size={15} />
                      </span>
                      <span className="hidden md:inline-block lg:hidden">
                        <TrustIcon icon={badge.icon} size={17} />
                      </span>
                      <span className="hidden lg:inline-block">
                        <TrustIcon icon={badge.icon} size={19} />
                      </span>
                    </span>
                  </div>

                  {/* Title: Clean, balanced typography without distracting subtitles */}
                  <h3 className="text-[9.5px] sm:text-[10.5px] md:text-[12px] lg:text-[13px] font-semibold text-white tracking-tight leading-[1.2] text-center md:text-left max-w-[140px] md:max-w-none">
                    {badge.title}
                  </h3>
                </div>
              )

              return (
                <React.Fragment key={badge.id}>
                  {idx > 0 && (
                    <div
                      aria-hidden="true"
                      className="w-[1px] bg-white/20 h-5 sm:h-5.5 md:h-6 shrink-0 mx-0.5 sm:mx-1 md:mx-1.5"
                    />
                  )}

                  {badge.ctaRoute ? (
                    <Link
                      href={badge.ctaRoute}
                      className="flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div className="flex-1 min-w-0">{itemContent}</div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
