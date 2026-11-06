'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../context/StorefrontContext'
import { useHeaderScroll } from '../../context/HeaderScrollContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { GlorovAccountIcon } from '../common/GlorovAccountIcon'
import { cn } from '../../lib/utils/cn'

export interface MobileBottomNavProps {
  className?: string
  alwaysVisible?: boolean
}

/**
 * @component MobileBottomNav
 *
 * @description
 * GLOROV Mobile Storefront Bottom Navigation Dock migrated directly from Flutter `GlorovMobileBottomNav`.
 * Fixed bottom navigation bar for mobile storefront screens (< 768px).
 * Houses 4 essential actions:
 * 1. Home
 * 2. Categories
 * 3. Cart (with live reactive badge count)
 * 4. Account
 *
 * Dynamic Scroll Behavior (Flutter / Amazon model):
 * - At page top (pixels <= 180): Hidden so hero section remains clean and un-obscured.
 * - Scrolling DOWN: Slides UP into view (appears on mobile).
 * - Scrolling UP: Slides DOWN out of view (hides on mobile).
 * - Near bottom / footer (within 240px): Stays docked so navigation is always accessible.
 * - On Account & Policy pages: Always docked (alwaysVisible = true).
 */
export function MobileBottomNav({ className, alwaysVisible = false }: MobileBottomNavProps) {
  const pathname = usePathname()
  const currentPath = pathname || ''
  const { cartCount } = useCart()
  const { isBottomNavVisible } = useHeaderScroll()
  const { customer, isAuthenticated } = useCustomerAuth()

  const isVisible = alwaysVisible || isBottomNavVisible

  interface NavItem {
    id: string
    label: string
    href: string
    isActive: boolean
    icon: React.ReactNode
    badge?: number
    onClick?: () => void
  }

  const isAccountActive = currentPath.startsWith('/account') || currentPath.startsWith('/auth')

  const navItems: NavItem[] = [
    {
      id: 'nav-home',
      label: 'Home',
      href: '/',
      isActive: currentPath === '/' || currentPath === '/home',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'nav-categories',
      label: 'Categories',
      href: '/categories',
      isActive: currentPath.startsWith('/categories'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'nav-cart',
      label: 'Cart',
      href: '/cart',
      isActive: currentPath === '/cart',
      badge: cartCount > 0 ? cartCount : undefined,
      icon: <GlorovCustomIcons.cart size={20} isFilled={currentPath === '/cart'} />,
    },
    {
      id: 'nav-account',
      label: isAuthenticated ? 'Account' : 'Sign In',
      href: isAuthenticated ? '/account' : '/auth/login',
      isActive: isAccountActive,
      icon: (
        <GlorovAccountIcon
          user={isAuthenticated ? customer : null}
          size={22}
          isActive={isAccountActive}
        />
      ),
    },
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={cn(
        'cat-desktop:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform',
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-[120%] opacity-0 pointer-events-none',
        className
      )}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const content = (
            <div
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 select-none transition-colors relative',
                item.isActive
                  ? 'text-[#1B4332] font-bold'
                  : 'text-[#64748B] font-medium hover:text-[#1B4332]'
              )}
            >
              <div className="relative flex items-center justify-center">
                {/* Active mint pill wash matching Flutter _BottomNavItem */}
                <div
                  className={cn(
                    'px-3.5 py-0.5 rounded-full transition-colors flex items-center justify-center',
                    item.isActive ? 'bg-[#D8F3DC]' : 'bg-transparent'
                  )}
                >
                  {item.icon}
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1B4332] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {item.label}
              </span>
            </div>
          )

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className="focus:outline-none"
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="focus:outline-none"
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
