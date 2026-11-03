'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../lib/utils/cn'

export interface FooterProps {
  className?: string
}

/**
 * @component Footer
 *
 * @description
 * Faithful 1:1 migration of Flutter `GlorovFooter`:
 * - Background: Forest Dark (#081C15).
 * - Desktop (>= 900px): Clean 3-column layout (Brand & Mission 6 cols, Collections 3 cols, Growing Support 3 cols).
 *   Includes white SVG logo (32px), mission text, certified organic shield, category links, and growing support.
 * - Mobile (< 900px): Compact header row (logo 20px + sage dot + slogan), subtitle, 2-column compact links grid,
 *   and centered legal policies.
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      aria-label="Site Footer"
      className={cn('w-full bg-[#081C15] text-white', className)}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 pb-16 py-4 md:pb-12 md:py-12">
        <div className="max-w-[1360px] mx-auto">
          {/* ================================================================= */}
          {/* Desktop Footer (>= 900px)                                         */}
          {/* ================================================================= */}
          <div className="hidden lg:grid grid-cols-12 gap-8 xl:gap-16 pb-12">
            {/* Col 1: Brand & Mission Column (6 cols) */}
            <div className="col-span-6 space-y-4">
              <Link href="/" aria-label="GLOROV Home" className="inline-block">
                <div className="relative h-8 w-28 brightness-0 invert">
                  <Image
                    src="/logo/glorov-logo.svg"
                    alt="GLOROV"
                    fill
                    unoptimized
                    className="object-contain object-left"
                  />
                </div>
              </Link>

              <p className="text-[13px] text-white/70 leading-[1.6] font-normal max-w-lg">
                <strong className="text-white font-semibold block mb-0.5">
                  Grow More. Live Greener.
                </strong>
                GLOROV is an organic seed sanctuary and live plant nursery dedicated to bringing vibrant
                botanical sanctuaries into homes and gardens across India.
              </p>

              <div className="flex items-center gap-2 pt-2 text-[#52B788]">
                <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[12px] font-semibold text-white tracking-tight">
                  Certified Organic • 100% Non-GMO
                </span>
              </div>
            </div>

            {/* Col 2: Collections Column (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="text-[14px] font-bold tracking-[0.4px] text-white uppercase">
                Collections
              </h3>
              <ul className="space-y-1.5 text-[13px] text-white/70">
                <li>
                  <Link href="/categories/vegetables" className="hover:text-white transition-colors block py-0.5">
                    Vegetable Seeds
                  </Link>
                </li>
                <li>
                  <Link href="/categories/flowering" className="hover:text-white transition-colors block py-0.5">
                    Heirloom Flower Seeds
                  </Link>
                </li>
                <li>
                  <Link href="/categories/live-plants" className="hover:text-white transition-colors block py-0.5">
                    Indoor Houseplants
                  </Link>
                </li>
                <li>
                  <Link href="/categories/herbs" className="hover:text-white transition-colors block py-0.5">
                    Culinary Herb Seeds
                  </Link>
                </li>
                <li>
                  <Link href="/categories/planters" className="hover:text-white transition-colors block py-0.5">
                    Terracotta Planters
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Support Column (3 cols) */}
            <div className="col-span-3 space-y-3">
              <h3 className="text-[14px] font-bold tracking-[0.4px] text-white uppercase">
                Growing Support
              </h3>
              <ul className="space-y-1.5 text-[13px] text-white/70">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors block py-0.5">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors block py-0.5">
                    Seed Sowing Guides
                  </Link>
                </li>
                <li>
                  <Link href="/policies/shipping" className="hover:text-white transition-colors block py-0.5">
                    Plant Care & Transit Shield
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="hover:text-white transition-colors block py-0.5">
                    Track Plant Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors block py-0.5">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* ================================================================= */}
          {/* Mobile Footer (< 900px)                                           */}
          {/* ================================================================= */}
          <div className="block lg:hidden space-y-3 pb-4">
            {/* Brand Header: Compact Row with Logo & Slogan */}
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-20 brightness-0 invert shrink-0">
                <Image
                  src="/logo/glorov-logo.svg"
                  alt="GLOROV"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] shrink-0" />
              <span className="text-[11px] font-semibold text-[#52B788] truncate">
                Grow More. Live Greener.
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-[11px] text-white/70 leading-[1.35]">
              Certified organic seeds & safe live plant delivery across India.
            </p>

            {/* Compact 2-Column Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {/* Column 1: Popular Collections */}
              <div className="space-y-1">
                <h4 className="text-[12px] font-bold text-white uppercase tracking-tight">
                  Collections
                </h4>
                <div className="flex flex-col space-y-1 text-[11.5px] text-white/70 pt-0.5">
                  <Link href="/categories/vegetables" className="hover:text-white transition-colors">
                    Vegetable Seeds
                  </Link>
                  <Link href="/categories/flowering" className="hover:text-white transition-colors">
                    Flower Seeds
                  </Link>
                  <Link href="/categories/live-plants" className="hover:text-white transition-colors">
                    Live Houseplants
                  </Link>
                  <Link href="/categories/plant-care" className="hover:text-white transition-colors">
                    Gardening Care
                  </Link>
                </div>
              </div>

              {/* Column 2: Growing Support */}
              <div className="space-y-1">
                <h4 className="text-[12px] font-bold text-white uppercase tracking-tight">
                  Growing Support
                </h4>
                <div className="flex flex-col space-y-1 text-[11.5px] text-white/70 pt-0.5">
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Help & FAQs
                  </Link>
                  <Link href="/policies/shipping" className="hover:text-white transition-colors">
                    Plant Care & Transit
                  </Link>
                  <Link href="/account/orders" className="hover:text-white transition-colors">
                    Track Delivery
                  </Link>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-white/10 my-2 md:my-6" />

          {/* ================================================================= */}
          {/* Bottom Bar: Copyright & Legal Policies                            */}
          {/* ================================================================= */}
          {/* Desktop Bottom Bar (>= 900px) */}
          <div className="hidden lg:flex items-center justify-between text-[12px] text-white/55 pt-2">
            <span>© 2026 GLOROV Botanical E-Commerce. All rights reserved.</span>
            <div className="flex items-center gap-4 text-[11px] text-white/70">
              <Link href="/policies/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="underline hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/policies/shipping" className="underline hover:text-white transition-colors">
                Shipping & Transit Policy
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Bar (< 900px) */}
          <div className="block lg:hidden text-center space-y-1.5 pt-1 text-[11px] text-white/70">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Link href="/policies/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/25 text-[10px]">•</span>
              <Link href="/policies/terms" className="underline hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-white/25 text-[10px]">•</span>
              <Link href="/policies/shipping" className="underline hover:text-white transition-colors">
                Shipping & Transit Policy
              </Link>
            </div>
            <p className="text-[10.5px] text-white/40">
              © 2026 GLOROV Botanical E-Commerce. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
