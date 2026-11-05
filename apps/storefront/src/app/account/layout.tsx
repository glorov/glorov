'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { BotanicalLoadingState } from '../../components/feedback/BotanicalLoadingState'
import { AccountNavSidebar } from '../../components/account/AccountNavSidebar'

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading } = useCustomerAuth()

  const subPageTitles: Record<string, string> = {
    '/account/profile': 'Customer Profile',
    '/account/addresses': 'Delivery Addresses',
    '/account/orders': 'Order History & Tracking',
    '/account/wishlist': 'Botanical Wishlist',
    '/account/notifications': 'Notifications',
  }

  const currentSubTitle = pathname ? subPageTitles[pathname] : undefined

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <BotanicalLoadingState
          label="GLOROV ACCOUNT"
          sublabel="Loading your green sanctuary..."
        />
      </div>
    )
  }

  return (
    <div className="bg-[#F9FAF8] min-h-[85vh] py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Strip matching Flutter */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone-500 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 font-semibold text-[#0F281E] hover:text-[#1B4332] transition"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <span className="text-stone-300">/</span>
          <Link href="/" className="hover:text-[#1B4332] transition">
            Home
          </Link>
          <span className="text-stone-300">/</span>
          {currentSubTitle ? (
            <>
              <Link href="/account" className="hover:text-[#1B4332] transition">
                My Account
              </Link>
              <span className="text-stone-300">/</span>
              <span className="font-bold text-[#0F281E]">{currentSubTitle}</span>
            </>
          ) : (
            <span className="font-bold text-[#0F281E]">My Account</span>
          )}
        </nav>

        {/* 2-Column Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">
          {/* Navigation Sidebar / Horizontal Tab Bar */}
          <AccountNavSidebar className="lg:w-72 flex-shrink-0" />

          {/* Subpage Content Panel */}
          <main className="flex-1 w-full min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
