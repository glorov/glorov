'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart, useWishlist } from '../../context/StorefrontContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useHeaderScroll } from '../../context/HeaderScrollContext'
import { CategoryIcons, GlorovCustomIcons } from '../common/GlorovIcons'
import { GlorovAccountIcon } from '../common/GlorovAccountIcon'
import { cn } from '../../lib/utils/cn'

const DESKTOP_SEARCH_HINTS = [
  'Search for plants, seeds, fertilizers & pots...',
  'Search "Desi Heirloom & Hybrid Seeds"...',
  'Search "Air Purifying Live Houseplants"...',
  'Search "Artisan Ceramic & Clay Planters"...',
  'Search "Organic Plant Food & Vermicompost"...',
  'Search "Fresh Kitchen Herbs & Mint"...',
  'Search "Seasonal Flower Seeds & Bulbs"...',
  'Search "Garden Tools & Pruning Shears"...',
]

const MOBILE_SEARCH_HINTS = [
  'Search for plants, seeds, pots...',
  'Search "Heirloom Seeds"...',
  'Search "Indoor Plants"...',
  'Search "Ceramic Pots"...',
  'Search "Organic Fertilizer"...',
  'Search "Kitchen Herbs"...',
  'Search "Flower Seeds"...',
  'Search "Garden Tools"...',
]

interface NavCategory {
  id: string
  label: string
  route: string
  categoryFilter: string
  iconKey: keyof typeof CategoryIcons
}

interface SearchRotatingPlaceholderProps {
  hints: string[]
  isDesktop?: boolean
  visible: boolean
  isPaused?: boolean
}

/**
 * Animated rotating search placeholder component.
 * Exact 1:1 translation of Flutter's `AnimatedSwitcher` + `SlideTransition`:
 * - Exiting placeholder moves bottom-to-top (`translateY(0%) -> translateY(-120%)`) with `easeInCubic` & fades out.
 * - Incoming placeholder moves bottom-to-top (`translateY(120%) -> translateY(0%)`) with `easeOutCubic` & fades in.
 * - Exactly one placeholder is visible in static state.
 * - Hardware accelerated 380ms transition duration matching Flutter duration.
 */
function SearchRotatingPlaceholder({
  hints,
  isDesktop = false,
  visible,
  isPaused = false,
}: SearchRotatingPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!visible || isPaused) {
      setPrevIndex(null)
      return
    }

    const interval = setInterval(() => {
      setPrevIndex(currentIndex)
      setCurrentIndex((prev) => (prev + 1) % hints.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [visible, isPaused, currentIndex, hints.length])

  // Clear exiting slide after the 380ms transition completes
  useEffect(() => {
    if (prevIndex === null) return
    const timer = setTimeout(() => {
      setPrevIndex(null)
    }, 380)
    return () => clearTimeout(timer)
  }, [prevIndex])

  if (!visible) return null

  return (
    <div className="relative w-full h-[20px] overflow-hidden pointer-events-none select-none pl-1 [contain:paint]">
      {prevIndex !== null && (
        <span
          key={`prev-${prevIndex}`}
          className={cn(
            'absolute inset-0 flex items-center text-[#9CA3AF] truncate leading-none will-change-transform will-change-opacity animate-hint-out',
            isDesktop ? 'text-[13.5px]' : 'text-[12.5px]'
          )}
        >
          {hints[prevIndex % hints.length]}
        </span>
      )}
      <span
        key={`curr-${currentIndex}`}
        className={cn(
          'absolute inset-0 flex items-center text-[#9CA3AF] truncate leading-none will-change-transform will-change-opacity',
          isDesktop ? 'text-[13.5px]' : 'text-[12.5px]',
          prevIndex !== null ? 'animate-hint-in' : ''
        )}
      >
        {hints[currentIndex % hints.length]}
      </span>
    </div>
  )
}

const CATEGORIES: NavCategory[] = [
  { id: 'cat-seeds', label: 'Seeds', route: '/categories/seeds', categoryFilter: 'Seeds', iconKey: 'seeds' },
  { id: 'cat-live-plants', label: 'Live Plants', route: '/categories/live-plants', categoryFilter: 'Live Plants', iconKey: 'livePlants' },
  { id: 'cat-planters', label: 'Planters', route: '/categories/planters', categoryFilter: 'Planters & Pots', iconKey: 'planters' },
  { id: 'cat-plant-care', label: 'Plant Care', route: '/categories/plant-care', categoryFilter: 'Plant Care & Soil', iconKey: 'plantCare' },
  { id: 'cat-flowering', label: 'Flowering', route: '/categories/flowering', categoryFilter: 'Flowering Plants', iconKey: 'flowering' },
  { id: 'cat-herbs', label: 'Herbs', route: '/categories/herbs', categoryFilter: 'Fruit & Herb Seeds', iconKey: 'herbs' },
  { id: 'cat-vegetables', label: 'Vegetables', route: '/categories/vegetables', categoryFilter: 'Vegetable Seeds', iconKey: 'vegetables' },
  { id: 'cat-offers', label: 'Offers', route: '/offers', categoryFilter: 'Offers', iconKey: 'offers' },
]

export interface HeaderProps {
  currentCategory?: string
  className?: string
}

/**
 * @component Header
 *
 * @description
 * Faithful 1:1 migration of Flutter `GlorovHeader`:
 * 1. Top 3px emerald accent strip (#1B4332).
 * 2. Sticky behavior: Full height with centered category icons when at page top (showIcons = true),
 *    smoothly collapses to sleek compact mode (38px strip without icons) on scroll down (showIcons = false).
 * 3. Desktop top row: Brand SVG Logo (36px) + Central Search Pill (42px) with 8 rotating botanical hints
 *    + User Avatar (Initials with verified badge if logged in, custom Guest SVG if not)
 *    + Wishlist with sage badge (#52B788) + Custom Botanical Cart Tote with deep forest badge (#1B4332).
 * 4. Mobile top row (< 900px): Left Brand Logo (25px) + Expanded Search Pill (38px) + Cart Icon (21px).
 * 5. Category Navigation Bar: 8 botanical categories with custom SVG icons, rounded mint active pills (#D8F3DC),
 *    soft hover wash (#F0FDF4), and animated bottom active indicator bar (#1B4332).
 */
export function Header({ currentCategory, className }: HeaderProps) {
  const pathname = usePathname()
  const { cartCount } = useCart()
  const { wishlistIds } = useWishlist()
  const { customer, isAuthenticated } = useCustomerAuth()
  const { showIcons, selectedCategory, setSelectedCategory } = useHeaderScroll()

  const wishlistCount = wishlistIds.length

  // Strictly prevent vertical scrolling on the category navigation strip
  const handleCategoryScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop !== 0) {
      e.currentTarget.scrollTop = 0
    }
  }, [])

  // Map vertical mouse wheel gestures over category bar to page scroll (Y-scroll pass-through)
  const handleCategoryWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0) {
      const pageScroll = document.getElementById('glorov-page-scroll') || document.documentElement || document.body
      pageScroll.scrollTop += e.deltaY
    }
  }, [])

  return (
    <header
      className={cn(
        'w-full bg-white border-b border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]',
        className
      )}
    >
      {/* 1. Desktop Top Row (>= 900px) */}
      <div className="hidden lg:block w-full bg-white px-6 py-1.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8">
          {/* GLOROV Brand SVG Logo (Exact 90px x 36px aspect ratio) */}
          <Link
            href="/"
            aria-label="GLOROV Home"
            onClick={() => setSelectedCategory('')}
            className="flex items-center shrink-0 rounded-lg p-1 hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          >
            <div className="relative h-9 w-[90px] shrink-0">
              <Image
                src="/logo/glorov-logo.svg"
                alt="GLOROV"
                width={90}
                height={36}
                priority
                unoptimized
                className="h-9 w-[90px] object-contain select-none"
              />
            </div>
          </Link>

          {/* Central Rounded Pill Search Bar with Bottom-to-Top Rotating Hints */}
          <Link
            href="/search"
            prefetch={true}
            aria-label="Search nursery catalog"
            className="flex-1 max-w-2xl min-w-0 cursor-pointer group"
          >
            <div
              className={cn(
                'flex items-center h-[42px] bg-[#F4F4F5] rounded-[22px] border px-3 transition-all overflow-hidden',
                'border-[#E5E7EB] group-hover:border-[#D1D5DB] group-hover:bg-[#ECEEF0]'
              )}
            >
              {/* Left Search Icon */}
              <span
                aria-hidden="true"
                className="text-[#1B4332] p-1.5 shrink-0 group-hover:scale-105 transition-transform"
              >
                <GlorovCustomIcons.search size={20} />
              </span>

              {/* Dynamic Animated Rotating Placeholder */}
              <div className="relative flex-1 min-w-0 h-full flex items-center overflow-hidden">
                <SearchRotatingPlaceholder
                  hints={DESKTOP_SEARCH_HINTS}
                  isDesktop={true}
                  visible={true}
                  isPaused={false}
                />
              </div>
            </div>
          </Link>

          {/* Badged Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Action 1: User / Profile */}
            {isAuthenticated ? (
              <Link
                href="/account"
                aria-label="Customer Account"
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F3F4F6] active:scale-90 transition-transform"
                title={customer?.firstName ? `Account (${customer.firstName})` : 'Customer Account'}
              >
                <GlorovAccountIcon user={customer} size={26} />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                aria-label="Sign In / Register"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F3F4F6] active:scale-90 transition-transform text-[#1E293B]"
                title="Sign In / Register"
              >
                <GlorovAccountIcon user={null} size={22} />
              </Link>
            )}

            {/* Action 2: Wishlist */}
            <Link
              href="/account/wishlist"
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F3F4F6] active:scale-90 transition-transform text-[#1E293B]"
              title="Wishlist"
            >
              <GlorovCustomIcons.heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#52B788] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Action 3: Botanical Cart */}
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F3F4F6] active:scale-90 transition-transform text-[#1E293B]"
              title="Cart"
            >
              <GlorovCustomIcons.cart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1B4332] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Mobile Top Row (< 1024px) */}
      <div className="block lg:hidden w-full bg-white px-3.5 py-[7px]">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left Slot: Brand Logo (Balanced 66px width to ensure search input is perfectly centered) */}
          <div className="w-[66px] flex items-center justify-start shrink-0">
            <Link
              href="/"
              aria-label="GLOROV Home"
              onClick={() => setSelectedCategory('')}
              className="flex items-center shrink-0 rounded p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1B4332]"
            >
              <div className="relative h-[25px] w-[63px] shrink-0">
                <Image
                  src="/logo/glorov-logo.svg"
                  alt="GLOROV"
                  width={63}
                  height={25}
                  priority
                  unoptimized
                  className="h-[25px] w-[63px] object-contain object-left select-none"
                />
              </div>
            </Link>
          </div>

          {/* Middle: Centered Rounded Search Pill with Bottom-to-Top Rotating Hints */}
          <Link
            href="/search"
            prefetch={true}
            aria-label="Search nursery catalog"
            className="flex-1 min-w-0 cursor-pointer group"
          >
            <div
              className={cn(
                'flex items-center h-[38px] bg-[#F4F4F5] rounded-[20px] border px-2.5 transition-all overflow-hidden',
                'border-[#E5E7EB] active:bg-[#ECEEF0]'
              )}
            >
              <span aria-hidden="true" className="text-[#1B4332] p-1 shrink-0">
                <GlorovCustomIcons.search size={18} />
              </span>

              <div className="relative flex-1 min-w-0 h-full flex items-center overflow-hidden">
                <SearchRotatingPlaceholder
                  hints={MOBILE_SEARCH_HINTS}
                  isDesktop={false}
                  visible={true}
                  isPaused={false}
                />
              </div>
            </div>
          </Link>

          {/* Right Slot: Cart Button with Live Badge (Balanced 66px width matching left slot) */}
          <div className="w-[66px] flex items-center justify-end shrink-0">
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className="relative flex items-center justify-center w-9 h-9 rounded-full text-[#1E293B] hover:bg-[#F3F4F6] active:scale-90 transition-transform shrink-0"
            >
              <GlorovCustomIcons.cart size={21} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-[#1B4332] text-white text-[9.5px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="h-[1px] w-full bg-[#F3F4F6]" />

      {/* 3. Category Navigation Strip (Centered on Tablet & Desktop, Free-Scrolling on Mobile) */}
      <nav
        aria-label="Product Categories"
        onScroll={handleCategoryScroll}
        onWheel={handleCategoryWheel}
        className={cn(
          'w-full bg-white overflow-x-auto overflow-y-hidden touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-[height] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] select-none overscroll-x-contain overscroll-y-none',
          showIcons ? 'h-[62px]' : 'h-[38px]'
        )}
      >
        <div className="max-w-[1360px] mx-auto h-full flex items-center justify-start sm:justify-center px-2 sm:px-3 lg:px-4 gap-1 sm:gap-2 lg:gap-3 min-w-full overflow-y-hidden">
          {CATEGORIES.map((cat) => {
            const IconComponent = CategoryIcons[cat.iconKey]
            const isHome = pathname === '/' || pathname === '/home' || pathname === ''
            const isActive =
              !isHome &&
              (selectedCategory === cat.label ||
                pathname === cat.route ||
                (currentCategory && currentCategory.toLowerCase() === cat.categoryFilter.toLowerCase()))

            return (
              <Link
                key={cat.id}
                href={cat.route}
                onClick={() => setSelectedCategory(cat.label)}
                className="group relative flex flex-col items-center justify-center px-2 sm:px-2 md:px-2 lg:px-4 py-0.5 rounded-[14px] transition-all duration-200 select-none active:scale-95 shrink-0"
              >
                {/* Icon Mode (Smoothly collapses without unmounting) */}
                <div
                  className={cn(
                    'transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden flex items-center justify-center',
                    showIcons
                      ? 'h-[27px] opacity-100 scale-100 mb-0.5'
                      : 'h-0 opacity-0 scale-75 mb-0 pointer-events-none'
                  )}
                >
                  <div
                    className={cn(
                      'px-2.5 sm:px-3 py-0.5 rounded-[12px] transition-all duration-200 flex items-center justify-center',
                      isActive
                        ? 'bg-[#D8F3DC] text-[#1B4332]'
                        : 'bg-transparent text-[#4B5563] group-hover:bg-[#F0FDF4] group-hover:text-[#1B4332]'
                    )}
                  >
                    <IconComponent
                      size={19}
                      className={cn(
                        'transition-colors duration-150',
                        isActive
                          ? 'text-[#1B4332]'
                          : 'text-[#4B5563] group-hover:text-[#1B4332]'
                      )}
                    />
                  </div>
                </div>

                {/* Category Label Text */}
                <span
                  className={cn(
                    'text-center transition-all duration-200 leading-tight whitespace-nowrap',
                    showIcons
                      ? 'text-[11px] sm:text-[11.5px] lg:text-[12px]'
                      : 'text-[12.5px]',
                    isActive
                      ? 'font-extrabold text-[#0F5132]'
                      : 'font-semibold text-[#4B5563] group-hover:font-bold group-hover:text-[#111827]'
                  )}
                >
                  {cat.label}
                </span>

                {/* Animated Bottom Active Indicator Bar */}
                <span
                  className={cn(
                    'mt-0.5 h-[2.5px] rounded-full transition-all duration-200',
                    isActive
                      ? 'w-6 bg-[#1B4332]'
                      : 'w-0 group-hover:w-3.5 group-hover:bg-[#86EFAC]'
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
