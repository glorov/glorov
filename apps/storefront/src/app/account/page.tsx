'use client'

import React from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useWishlist } from '../../context/StorefrontContext'
import { OrderHistoryCard } from '../../components/account/OrderHistoryCard'
import { GlorovCustomIcons } from '../../components/common/GlorovIcons'

export default function AccountOverviewPage() {
  const { customer, orders, addresses } = useCustomerAuth()
  const { wishlistIds } = useWishlist()

  // Unauthenticated / Guest state matching Flutter _buildGuestOverview
  if (!customer) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {/* Welcome Card matching Flutter _buildGuestOverview */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-[#E8F5E9] border-1.5 border-[#86EFAC] flex items-center justify-center flex-shrink-0 text-[#1B4332]">
              <GlorovCustomIcons.guestUser size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                Welcome to GLOROV Botanicals
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Sign in to your customer profile to track parcels, manage delivery destinations, and access your botanical wishlist.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center gap-3 flex-wrap">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        {/* Quick Guest Support & Services Tiles matching Flutter */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs divide-y divide-stone-100">
          <Link
            href="/policies/shipping"
            className="flex items-center gap-3.5 py-3.5 hover:text-[#1B4332] transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#1B4332] transition">
                Shipping & Transit Shield Policy
              </h3>
              <p className="text-[11px] text-stone-500">
                Learn about cold-chain dispatch protocols & 48-Hour Live Arrival Guarantee
              </p>
            </div>
            <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/policies/privacy"
            className="flex items-center gap-3.5 py-3.5 hover:text-[#1B4332] transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#1B4332] transition">
                Privacy & Data Protection Policy
              </h3>
              <p className="text-[11px] text-stone-500">
                Zero-Sale Privacy Pledge under Digital Personal Data Protection Act 2023
              </p>
            </div>
            <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="mailto:support@glorov.in"
            className="flex items-center gap-3.5 py-3.5 hover:text-[#1B4332] transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#1B4332] transition">
                Customer Care & Concierge
              </h3>
              <p className="text-[11px] text-stone-500">
                Direct email assistance: support@glorov.in
              </p>
            </div>
            <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0]
  const recentOrder = orders[0]
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
  ).length

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome Banner with Rich Botanical Forest Dark Gradient */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#081C15] via-[#0A4C36] to-[#1B4332] text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white border border-white/20">
            Botanical Patron Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2.5 font-serif text-white tracking-tight">
            Welcome back, {customer?.firstName || 'Gardener'} 🌿
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed font-sans">
            Track your living plants in cold-chain transit, manage delivery coordinates, and review your botanical sanctuary collection.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row Matching Flutter App */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/account/orders"
          className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center hover:border-[#1B4332] transition group"
        >
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mb-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-2xl font-black text-[#1B4332]">{orders.length}</p>
          <p className="text-[11px] font-semibold text-stone-500 mt-0.5 group-hover:text-[#1B4332] transition">Total Orders</p>
        </Link>

        <Link
          href="/account/orders"
          className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center hover:border-amber-600 transition group"
        >
          <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-black text-amber-600">{activeOrdersCount}</p>
          <p className="text-[11px] font-semibold text-stone-500 mt-0.5 group-hover:text-amber-600 transition">In Transit</p>
        </Link>

        <Link
          href="/account/addresses"
          className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center hover:border-[#1B4332] transition group"
        >
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mb-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-2xl font-black text-[#1B4332]">{addresses.length}</p>
          <p className="text-[11px] font-semibold text-stone-500 mt-0.5 group-hover:text-[#1B4332] transition">Saved Addresses</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-center hover:border-rose-600 transition group"
        >
          <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-2xl font-black text-rose-600">{wishlistIds.length}</p>
          <p className="text-[11px] font-semibold text-stone-500 mt-0.5 group-hover:text-rose-600 transition">Wishlist Items</p>
        </Link>
      </div>

      {/* Recent Order Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider font-sans">
            Most Recent Order
          </h2>
          {orders.length > 1 && (
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {recentOrder ? (
          <OrderHistoryCard order={recentOrder} />
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-stone-200/90 text-center">
            <p className="text-xs text-stone-500">No orders placed yet.</p>
            <Link
              href="/categories"
              className="mt-3 inline-block px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition shadow-xs"
            >
              Start Gardening
            </Link>
          </div>
        )}
      </div>

      {/* Default Address & Account Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Default Shipping Address */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Primary Delivery Address
              </h3>
              <Link
                href="/account/addresses"
                className="text-[11px] font-bold text-[#1B4332] hover:underline"
              >
                Manage
              </Link>
            </div>
            {defaultAddress ? (
              <div className="text-xs space-y-1">
                <p className="font-bold text-stone-900">{defaultAddress.fullName}</p>
                <p className="text-stone-600">{defaultAddress.addressLine1}</p>
                {defaultAddress.addressLine2 && <p className="text-stone-500">{defaultAddress.addressLine2}</p>}
                <p className="text-stone-700">
                  {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                </p>
                <p className="text-stone-500 text-[11px]">Phone: +91 {defaultAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400">No saved addresses.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">Fast 1-click checkout enabled</span>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-[#1B4332] hover:underline"
            >
              Edit Address →
            </Link>
          </div>
        </div>

        {/* Botanical Care & Support Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800 mb-2">
              Botanical Concierge & Perks
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every living botanical from GLOROV arrives with our <strong>48-Hour Live Plant Arrival Guarantee</strong>.
              If your plant experiences transit distress or shock, our Pune nursery team provides an immediate free replacement.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Need plant advice?</span>
            <a
              href="mailto:support@glorov.in"
              className="font-bold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              <span>support@glorov.in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
