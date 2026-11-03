'use client'

import React, { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { StorefrontProvider } from '../../context/StorefrontContext'
import { CustomerAuthProvider } from '../../context/CustomerAuthContext'
import { HeaderScrollProvider, useHeaderScroll } from '../../context/HeaderScrollContext'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { MobileMenuDrawer } from './MobileMenuDrawer'
import { MobileBottomNav } from './MobileBottomNav'
import { Footer } from './Footer'
import { ToastContainer } from '../feedback/Toast'
import { cn } from '../../lib/utils/cn'

export interface StorefrontLayoutProps {
  children: React.ReactNode
}

/**
 * Inner shell that consumes HeaderScrollContext for synchronized auto-hide behaviors,
 * route-aware header suppression (Cart, Account, Auth, Search), and page-specific bottom docks.
 * Uses internal page-scroll container (`#glorov-page-scroll`) with zero body scrolling.
 */
function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPath = pathname || ''
  const { isTopNavVisible } = useHeaderScroll()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Reset internal page scroll position to top whenever route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname])

  // 1. Storefront Top Navigation Bar visibility:
  // In Flutter GlorovStorefrontScaffold:
  // - CartScreen: showTopNav: false (Dedicated Cart Top Bar)
  // - AccountScreen: showTopNav: false (Dedicated Breadcrumb & Header)
  // - SearchScreen: uses dedicated Scaffold without storefront header
  // - LoginScreen / SignUpScreen / PasswordRecovery: clean auth screens without shopping header
  const isAuthPage = currentPath.startsWith('/auth')
  const isSearchPage = currentPath.startsWith('/search')
  const isCartPage = currentPath === '/cart'
  const isAccountPage = currentPath.startsWith('/account')
  const isCategoriesPage = currentPath === '/categories'

  const showHeader = !isAuthPage && !isSearchPage && !isCartPage && !isAccountPage

  // 2. Main Footer visibility:
  // In Flutter: Footer is in Home, Catalog, Categories, PDP, Policies, Checkout, Orders, Wishlist, Reviews.
  // Not in Cart, Account, Search, Auth.
  const showFooter = !isAuthPage && !isSearchPage && !isCartPage && !isAccountPage

  // 3. Mobile Bottom Navigation Dock (4-tab standard dock: Home, Categories, Cart, Account):
  // In Flutter:
  // - Product Details Screen: showBottomNav: false (uses MobileStickyPurchaseBar that animates on scroll down)
  // - Cart Screen: showBottomNav: false (uses MobileStickyCheckoutBar when items in cart)
  // - Checkout Screen: showBottomNav: false (distraction-free checkout)
  // - Search Screen: showBottomNav: false (distraction-free search)
  // - Auth Screens: showBottomNav: false
  const isProductPage = currentPath.startsWith('/products/')
  const isCheckoutPage = currentPath.startsWith('/checkout')

  const showStandardBottomNav =
    !isProductPage && !isCartPage && !isCheckoutPage && !isAuthPage && !isSearchPage

  // 4. In Flutter, Account and Policy screens have alwaysShowBottomNav: true
  const isAlwaysBottomNav = isAccountPage || currentPath.startsWith('/policies')

  // Extra height created when fixed header collapses (AnnouncementBar 34px + Category icons 24px ≈ 66px - 70px)
  const getExtraHeight = () => {
    if (typeof window === 'undefined') return 70
    return window.innerWidth >= 1024 ? 70 : 66
  }

  // Forward mouse wheel over floating header and auto-scroll the extra gap smoothly
  const handleHeaderWheel = (e: React.WheelEvent) => {
    const scrollEl = scrollContainerRef.current
    if (!scrollEl || !e.deltaY) return

    const extra = getExtraHeight()
    const currentTop = scrollEl.scrollTop

    // If at top and user wheels DOWN: auto-scroll the extra gap smoothly
    if (currentTop <= 4 && e.deltaY > 0) {
      e.preventDefault()
      scrollEl.scrollTo({ top: extra, behavior: 'smooth' })
      return
    }

    // If in the extra gap zone and user wheels UP: auto-scroll back to top smoothly
    if (currentTop <= extra + 4 && currentTop > 0 && e.deltaY < 0) {
      e.preventDefault()
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    scrollEl.scrollBy({ top: e.deltaY, behavior: 'instant' })
  }

  // Smooth auto-scroll to close the extra gap when the user scrolls near the top
  useEffect(() => {
    if (!showHeader) return
    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return

    let snapTimer: ReturnType<typeof setTimeout> | null = null
    let touchStartY = 0

    // Auto-scroll the extra gap on wheel events over the page container
    const handleContainerWheel = (e: WheelEvent) => {
      if (!e.deltaY) return
      const currentTop = scrollEl.scrollTop
      const extra = getExtraHeight()

      // If at top and user wheels DOWN: prevent tiny step and auto-scroll the extra gap smoothly
      if (currentTop <= 4 && e.deltaY > 0) {
        e.preventDefault()
        scrollEl.scrollTo({ top: extra, behavior: 'smooth' })
        return
      }

      // If in the extra gap zone and user wheels UP: prevent tiny step and auto-scroll back to top smoothly
      if (currentTop <= extra + 4 && currentTop > 0 && e.deltaY < 0) {
        e.preventDefault()
        scrollEl.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Touch gesture handling on mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (snapTimer) clearTimeout(snapTimer)
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return
      const currentTop = scrollEl.scrollTop
      const extra = getExtraHeight()
      const touchEndY = e.changedTouches[0].clientY
      const deltaTouch = touchStartY - touchEndY // > 0 means scrolled DOWN

      if (currentTop > 0 && currentTop < extra) {
        if (deltaTouch > 5 || currentTop >= extra * 0.4) {
          scrollEl.scrollTo({ top: extra, behavior: 'smooth' })
        } else if (deltaTouch < -5 || currentTop < extra * 0.4) {
          scrollEl.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }

    // Debounced settle snap in case user stopped inside the extra gap zone
    const scheduleSnap = () => {
      if (snapTimer) clearTimeout(snapTimer)
      snapTimer = setTimeout(() => {
        if (!scrollEl) return
        const currentTop = scrollEl.scrollTop
        const extra = getExtraHeight()

        if (currentTop > 0 && currentTop < extra) {
          if (currentTop >= extra * 0.4) {
            scrollEl.scrollTo({ top: extra, behavior: 'smooth' })
          } else {
            scrollEl.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }, 50)
    }

    const handleScroll = () => {
      const currentTop = scrollEl.scrollTop
      const extra = getExtraHeight()
      if (currentTop > 0 && currentTop < extra) {
        scheduleSnap()
      }
    }

    scrollEl.addEventListener('wheel', handleContainerWheel, { passive: false })
    scrollEl.addEventListener('touchstart', handleTouchStart, { passive: true })
    scrollEl.addEventListener('touchend', handleTouchEnd, { passive: true })
    scrollEl.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (snapTimer) clearTimeout(snapTimer)
      scrollEl.removeEventListener('wheel', handleContainerWheel)
      scrollEl.removeEventListener('touchstart', handleTouchStart)
      scrollEl.removeEventListener('touchend', handleTouchEnd)
      scrollEl.removeEventListener('scroll', handleScroll)
    }
  }, [showHeader])

  return (
    <div
      id="glorov-app-shell"
      className="fixed inset-0 w-full h-full flex flex-col bg-[#F9FAF8] text-[#111827] antialiased selection:bg-[#B7E4C7] selection:text-[#081C15] overflow-hidden"
    >
      {/* Fixed Floating Top Navigation Stack (Announcement Bar + Main Header) */}
      {showHeader && (
        <div
          onWheel={handleHeaderWheel}
          className={cn(
            'fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform',
            isTopNavVisible ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none',
            isCategoriesPage && 'hidden cat-desktop:block'
          )}
        >
          {/* Top Announcement Bar (collapses smoothly from 34px to 0px on initial scroll) */}
          <AnnouncementBar />

          {/* Main Header with Category Navigation Strip */}
          <Header />
        </div>
      )}

      {/* Left-side Navigation Drawer on Mobile */}
      <MobileMenuDrawer />

      {/* Primary Page Scrollable Viewport (Internal page scroll - zero body scroll) */}
      <div
        id="glorov-page-scroll"
        ref={scrollContainerRef}
        className={cn(
          'flex-1 w-full h-full relative overscroll-contain flex flex-col',
          isCategoriesPage
            ? 'overflow-hidden cat-desktop:overflow-y-auto cat-desktop:overflow-x-hidden'
            : 'overflow-y-auto overflow-x-hidden'
        )}
      >
        {/* Main Page Content with constant top padding when header is present */}
        <main
          className={cn(
            'flex-1 w-full',
            isCategoriesPage
              ? 'pt-0 cat-desktop:pt-[158px] cat-desktop:lg:pt-[166px] pb-14 cat-desktop:pb-0 h-full overflow-hidden cat-desktop:h-auto cat-desktop:overflow-visible'
              : showHeader
                ? 'pt-[158px] lg:pt-[166px]'
                : 'pt-0',
            !isCategoriesPage &&
              (showStandardBottomNav
                ? 'pb-16 md:pb-0'
                : isProductPage || isCartPage
                  ? 'pb-24 md:pb-0'
                  : 'pb-0')
          )}
        >
          <div className={cn('w-full', isCategoriesPage ? 'h-full cat-desktop:h-auto' : '')}>{children}</div>
        </main>

        {/* Site Footer inside internal scroll container */}
        {showFooter && (
          <div className={isCategoriesPage ? 'hidden cat-desktop:block' : ''}>
            <Footer />
          </div>
        )}
      </div>

      {/* Fixed Mobile Bottom Navigation Dock (Dynamic auto-hide / reveal / always-docked) */}
      {showStandardBottomNav && (
        <MobileBottomNav alwaysVisible={isAlwaysBottomNav || isCategoriesPage} />
      )}

      {/* Fixed Floating Botanical Toast Container */}
      <ToastContainer />
    </div>
  )
}

/**
 * @component StorefrontLayout
 *
 * @description
 * Primary application shell wrapper providing complete shared storefront components:
 * - Centralized HeaderScrollProvider coordinating smart auto-hide (Flutter model)
 * - Announcement Bar (Forest Deep with continuous marquee)
 * - Main Header (Logo, Pill Search, Badged Actions, Botanical Category Strip)
 * - Mobile Navigation Drawer
 * - Content Body (Zero Page Height Shift)
 * - Main Footer (Brand Mission, Botanical Offerings, Support, Newsletter)
 * - Fixed Mobile Bottom Dock (< 768px with Dynamic Scroll Visibility)
 * - Floating Botanical Toast Container
 * - Unified Storefront & Customer Authentication Contexts
 */
export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <StorefrontProvider>
      <CustomerAuthProvider>
        <HeaderScrollProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </HeaderScrollProvider>
      </CustomerAuthProvider>
    </StorefrontProvider>
  )
}
