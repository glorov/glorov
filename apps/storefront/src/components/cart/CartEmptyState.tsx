'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { GlorovImage } from '../ui/GlorovImage'
import { MOCK_PRODUCTS } from '../../lib/mock-data'
import { useCart } from '../../context/StorefrontContext'

/**
 * GLOROV Empty Botanical Cart State
 * 100% matched with Flutter `_buildEmptyCart`:
 * 84px green circular avatar with bespoke filled cart icon,
 * serif heading, botanical guidance subtitle, primary catalog CTA pill,
 * and high-craft popular botanical picks cards matching GLOROV design standards.
 */
export const CartEmptyState: React.FC = () => {
  const { addToCart, showToast } = useCart()
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const suggested = MOCK_PRODUCTS.slice(0, 4)

  const handleAddToCart = (e: React.MouseEvent, prod: (typeof suggested)[0]) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(prod, 1)
    setJustAddedId(prod.id)
    setTimeout(() => {
      setJustAddedId((curr) => (curr === prod.id ? null : curr))
    }, 1400)
    if (showToast) {
      showToast('success', `Added "${prod.title}" to cart!`)
    }
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto py-8 px-4 flex flex-col items-center text-center select-none">
      <div className="pt-4" />

      {/* 84px Circular Avatar with bespoke filled cart icon */}
      <div className="w-[84px] h-[84px] rounded-full bg-[#EAF5EE] flex items-center justify-center text-[#0A4C36] shadow-xs">
        <GlorovCustomIcons.cart size={40} isFilled className="text-[#0A4C36]" />
      </div>

      <h2 className="mt-4 font-serif text-[22px] font-extrabold text-[#0A4C36] tracking-tight">
        Your Botanical Bag is Empty
      </h2>

      <p className="mt-1.5 text-[13.5px] text-[#6B7280] max-w-md mx-auto leading-relaxed">
        Explore our heirloom seeds, rare houseplants, and artisanal planters to bring nature home.
      </p>

      {/* Explore Catalog CTA */}
      <div className="mt-6">
        <Link
          href="/categories/seeds"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white text-[13px] font-extrabold tracking-[0.6px] shadow-sm transition-all active:scale-95"
        >
          <GlorovCustomIcons.spa size={18} />
          <span>EXPLORE CATALOG</span>
        </Link>
      </div>

      <div className="mt-10 w-full">
        {/* Popular Botanical Picks Header */}
        <div className="text-left mb-4 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#EAF5EE] flex items-center justify-center text-[#0A4C36]">
            <GlorovCustomIcons.spa size={13} />
          </div>
          <h3 className="text-[13px] font-extrabold text-[#0A4C36] tracking-[0.6px] uppercase font-serif">
            POPULAR BOTANICAL PICKS FOR YOU
          </h3>
        </div>

        {/* 4-Item Grid (2 cols mobile, 4 cols desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          {suggested.map((prod) => {
            const effectivePrice = prod.discountPrice ?? prod.price
            const originalPrice = prod.discountPrice ? prod.price : undefined
            const hasDiscount = originalPrice !== undefined && originalPrice > effectivePrice
            const discountPercent =
              prod.discountPercent ??
              (hasDiscount && originalPrice
                ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
                : undefined)

            const badgeText = (() => {
              if (prod.badges && prod.badges.length > 0 && prod.badges[0].trim()) {
                return prod.badges[0].trim()
              }
              if (prod.isBestSeller) return 'BESTSELLER'
              if (discountPercent && discountPercent >= 20) return 'SUMMER SALE'
              if (prod.rating >= 4.8) return 'TOP RATED'
              return null
            })()

            const categoryTag = (() => {
              if (prod.category.toLowerCase().includes('seed')) return 'Heirloom Seeds'
              if (prod.category.toLowerCase().includes('plant')) return 'Rare Plant'
              if (prod.category.toLowerCase().includes('pot')) return 'Handcrafted Pot'
              if (prod.category.toLowerCase().includes('soil') || prod.category.toLowerCase().includes('care')) {
                return 'Organic Care'
              }
              return prod.category
            })()

            const isJustAdded = justAddedId === prod.id

            return (
              <div
                key={prod.id}
                className="rounded-[20px] bg-white border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.035)] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#0A4C36]/35 hover:shadow-[0_12px_24px_rgba(10,76,54,0.12)] hover:-translate-y-1 group relative"
              >
                {/* Media with Overlays */}
                <div className="relative w-full aspect-square bg-[#F4F7F4] overflow-hidden shrink-0 rounded-t-[20px]">
                  <Link href={`/products/${prod.slug || prod.id}`} className="block w-full h-full">
                    <GlorovImage
                      src={prod.primaryImage}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                      containerClassName="w-full h-full"
                      fallbackTitle={prod.title}
                    />
                  </Link>

                  {/* Top-Left Signature Flush Docked Tag with Golden Lightning Bolt */}
                  {badgeText && (
                    <div className="absolute top-0 left-0 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-[3px] bg-[#0C2340] text-white text-[9px] font-extrabold tracking-[0.4px] uppercase px-2 py-[3.5px] rounded-tl-[20px] rounded-tr-[7px] rounded-br-[7px] rounded-bl-0 shadow-[0_1px_4px_rgba(0,0,0,0.22)] select-none leading-none">
                        <svg
                          width={10}
                          height={10}
                          className="w-2.5 h-2.5 text-[#F9C74F] shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{badgeText}</span>
                      </span>
                    </div>
                  )}

                  {/* Bottom-Left Solid Frosted Glass Rating Badge */}
                  <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded-[6px] bg-white/92 backdrop-blur-md border border-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-1 text-[#0F172A] leading-none select-none z-10">
                    <span className="text-[11px] font-extrabold text-[#0F172A]">{prod.rating.toFixed(1)}</span>
                    <GlorovCustomIcons.star size={11} className="text-[#16A34A] fill-current" />
                    <span className="text-[#CBD5E1] text-[9.5px]">|</span>
                    <span className="text-[10px] font-semibold text-[#475569]">{prod.reviewCount}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 flex-1 flex flex-col justify-between min-h-[110px]">
                  <div>
                    {/* Category Micro-tag */}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#16A34A] truncate block leading-tight mb-0.5">
                      {categoryTag}
                    </span>

                    {/* Editorial Fraunces serif title */}
                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      title={prod.title}
                      className="font-serif font-bold text-[13px] sm:text-[13.5px] text-[#0F2F24] line-clamp-2 leading-[1.25] h-[34px] flex items-start overflow-hidden group-hover:text-[#16A34A] transition-colors"
                    >
                      {prod.title}
                    </Link>
                  </div>

                  {/* Price & Circular Quick-Add Button Row */}
                  <div className="flex items-center justify-between gap-1 mt-auto pt-1">
                    <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                      <span className="font-serif text-[15px] sm:text-[15.5px] font-extrabold text-[#0A4C36] leading-none">
                        ₹{Math.round(effectivePrice)}
                      </span>
                      {hasDiscount && originalPrice && (
                        <span className="text-[11px] text-[#94A3B8] line-through leading-none font-medium">
                          ₹{Math.round(originalPrice)}
                        </span>
                      )}
                      {discountPercent && discountPercent > 0 && (
                        <span className="text-[9px] font-extrabold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1 py-0.5 rounded leading-none shrink-0">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, prod)}
                      aria-label={`Add ${prod.title} to cart`}
                      title="Add to cart"
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(10,76,54,0.18)] cursor-pointer active:scale-90 hover:scale-105 transition-all ${
                        isJustAdded
                          ? 'bg-[#15803D] text-white scale-105 ring-2 ring-emerald-200'
                          : 'bg-[#0A4C36] hover:bg-[#135841] text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white animate-in zoom-in-75 duration-150"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <GlorovCustomIcons.cart size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
