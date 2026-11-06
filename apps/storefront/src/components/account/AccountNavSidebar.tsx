'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { GlorovAccountIcon } from '../common/GlorovAccountIcon'

export interface AccountNavSidebarProps {
  className?: string
}

const NAV_LINKS = [
  {
    href: '/account',
    label: 'Account Overview',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/account/profile',
    label: 'Personal Profile',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/account/addresses',
    label: 'Delivery Addresses',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/account/orders',
    label: 'Order History & Tracking',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: '/account/wishlist',
    label: 'Botanical Wishlist',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    href: '/account/notifications',
    label: 'Notifications',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

export const AccountNavSidebar: React.FC<AccountNavSidebarProps> = ({ className = '' }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { customer, logout, notifications } = useCustomerAuth()
  const unreadNotifs = notifications ? notifications.filter((n) => !n.isRead).length : 0

  const handleSignOut = (): void => {
    logout()
    router.push('/auth/login')
  }

  const isGuest = !customer
  const displayName = customer
    ? `${customer.firstName} ${customer.lastName}`.trim() || customer.email
    : 'Guest Customer'
  const isSubPage = pathname !== '/account'

  return (
    <aside className={`w-full flex flex-col gap-3 sm:gap-4 ${className}`}>
      {/* Customer Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 flex items-center gap-3.5">
        <GlorovAccountIcon user={customer} size={48} showBadge={!isGuest} />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-stone-900 truncate">{displayName}</h2>
          <p className="text-xs text-stone-500 truncate">
            {customer?.email || 'Sign in to access your botanical profile'}
          </p>
          {customer ? (
            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {customer.memberSince ? `Member since ${customer.memberSince}` : 'Verified Botanical Patron'}
            </span>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block mt-1.5 text-[10px] font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] px-2.5 py-0.5 rounded-full border border-[#B7E4C7] transition"
            >
              Sign In / Register →
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Horizontal Pill Navigation / Desktop Vertical Navigation */}
      <nav
        aria-label="Account navigation"
        className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 sm:gap-2 pb-1 lg:pb-0 no-scrollbar p-1 lg:p-3 lg:rounded-3xl lg:bg-white lg:border lg:border-stone-200/90"
      >
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-2 lg:py-2.5 rounded-full lg:rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#0F281E] text-white'
                  : 'bg-white lg:bg-transparent border border-stone-200 lg:border-transparent text-stone-700 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-stone-500'}>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.href === '/account/notifications' && unreadNotifs > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {unreadNotifs}
                </span>
              )}
            </Link>
          )
        })}

        {/* Sign Out / Sign In Button (Desktop only in sidebar) */}
        {customer ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition whitespace-nowrap mt-2 pt-3 border-t border-stone-100"
          >
            <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1B4332] hover:bg-emerald-50 transition whitespace-nowrap mt-2 pt-3 border-t border-stone-100"
          >
            <svg className="w-4 h-4 text-[#1B4332] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In / Register</span>
          </Link>
        )}
      </nav>

      {/* Mobile Back to Overview Link if inside sub-page (matching Flutter!) */}
      {isSubPage && (
        <div className="lg:hidden px-1">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:text-[#0F281E] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Account Overview</span>
          </Link>
        </div>
      )}
    </aside>
  )
}
