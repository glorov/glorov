'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { OrderHistoryCard } from '../../../components/account/OrderHistoryCard'
import { fetchOrderById } from '../../../lib/api/orders'
import { reportError } from '../../../lib/error-reporter'
import type { CustomerOrder } from '../../../types/account'

type OrderFilter = 'all' | 'transit' | 'delivered' | 'cancelled'

export default function OrdersPage() {
  const { customer, orders, refreshOrders, isLoading: isAuthLoading } = useCustomerAuth()
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Guest order lookup states
  const [guestOrderId, setGuestOrderId] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isLookingUpGuest, setIsLookingUpGuest] = useState(false)
  const [guestLookupError, setGuestLookupError] = useState<string | null>(null)
  const [guestVerifiedOrder, setGuestVerifiedOrder] = useState<CustomerOrder | null>(null)

  // Trigger orders refresh when authenticated
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setOrdersError(null)
    try {
      await refreshOrders()
    } catch (err: unknown) {
      reportError(err, { page: '/account/orders', action: 'refresh-orders' })
      setOrdersError('Unable to refresh order history. Please check your connection.')
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshOrders])

  useEffect(() => {
    if (customer && orders.length === 0) {
      handleRefresh()
    }
  }, [customer, orders.length, handleRefresh])

  // Guest order lookup handler
  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuestLookupError(null)
    setGuestVerifiedOrder(null)

    const cleanId = guestOrderId.trim()
    const cleanEmail = guestEmail.trim().toLowerCase()

    if (!cleanId) {
      setGuestLookupError('Please enter a valid Order ID (e.g. GLR-1001 or order_...)')
      return
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setGuestLookupError('Please enter the email address used during order checkout.')
      return
    }

    setIsLookingUpGuest(true)
    try {
      const res = await fetchOrderById(cleanId, undefined, cleanEmail)
      if (res.success && res.order) {
        setGuestVerifiedOrder(res.order)
      } else {
        setGuestLookupError(
          res.error ||
            'Order not found. Please verify your Order ID and billing/shipping email address.'
        )
      }
    } catch (err: unknown) {
      reportError(err, { page: '/account/orders', action: 'guest-lookup' })
      setGuestLookupError('Unable to connect to order verification service. Please try again.')
    } finally {
      setIsLookingUpGuest(false)
    }
  }

  // -------------------------------------------------------------
  // GUEST STATE (Unauthenticated)
  // -------------------------------------------------------------
  if (!customer && !isAuthLoading) {
    return (
      <div className="space-y-6">
        {/* Guest Overview Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] border-1.5 border-[#86EFAC] text-[#1B4332] flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Track Your Botanical Order</h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md">
                Sign in to view your complete order history, or look up a guest order with your order reference and email.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/auth/login?redirect=/account/orders"
              className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition"
            >
              Sign In to Account
            </Link>
            <Link
              href="/auth/signup?redirect=/account/orders"
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Guest Order Lookup Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              Guest Order Lookup
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif mt-2">
              Find Order by ID & Verified Email
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your Order Reference number and the email address specified at checkout.
            </p>
          </div>

          <form onSubmit={handleGuestLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guest-order-id" className="block text-xs font-bold text-stone-700 mb-1.5">
                  Order ID or Display Number
                </label>
                <input
                  id="guest-order-id"
                  type="text"
                  value={guestOrderId}
                  onChange={(e) => setGuestOrderId(e.target.value)}
                  placeholder="e.g. GLR-1001 or order_01..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="guest-order-email" className="block text-xs font-bold text-stone-700 mb-1.5">
                  Checkout Email Address
                </label>
                <input
                  id="guest-order-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. patron@glorov.in"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {guestLookupError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{guestLookupError}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isLookingUpGuest}
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/95 transition flex items-center gap-2 disabled:opacity-60"
              >
                {isLookingUpGuest ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Locating Order...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find & Track Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Verified Guest Order Result */}
          {guestVerifiedOrder && (
            <div className="pt-6 border-t border-stone-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-800">
                    Order Found & Ownership Verified ({guestEmail})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGuestVerifiedOrder(null)}
                  className="text-[11px] font-semibold text-stone-500 hover:text-stone-800"
                >
                  Clear Result
                </button>
              </div>

              <OrderHistoryCard order={guestVerifiedOrder} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // AUTHENTICATED CUSTOMER ORDERS VIEW
  // -------------------------------------------------------------
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredOrders = orders.filter((order) => {
    // Filter by tab
    const status = (order.status || 'pending').toLowerCase()
    if (filter === 'transit') {
      const inTransit =
        status === 'pending' ||
        status === 'processing' ||
        status === 'shipped' ||
        order.fulfillmentStatus === 'partially_shipped' ||
        order.fulfillmentStatus === 'shipped'
      if (!inTransit) return false
    } else if (filter === 'delivered') {
      if (status !== 'delivered' && order.fulfillmentStatus !== 'delivered') return false
    } else if (filter === 'cancelled') {
      if (status !== 'canceled' && status !== 'cancelled') return false
    }

    // Filter by search query
    if (normalizedQuery) {
      const matchesDisplayId = order.displayId.toLowerCase().includes(normalizedQuery)
      const matchesId = order.id.toLowerCase().includes(normalizedQuery)
      const matchesItem = order.items.some((it) =>
        it.title.toLowerCase().includes(normalizedQuery)
      )
      if (!matchesDisplayId && !matchesId && !matchesItem) return false
    }

    return true
  })

  const inTransitCount = orders.filter((o) => {
    const s = (o.status || 'pending').toLowerCase()
    return (
      s === 'pending' ||
      s === 'processing' ||
      s === 'shipped' ||
      o.fulfillmentStatus === 'shipped' ||
      o.fulfillmentStatus === 'partially_shipped'
    )
  }).length

  const deliveredCount = orders.filter((o) => {
    const s = (o.status || '').toLowerCase()
    return s === 'delivered' || o.fulfillmentStatus === 'delivered'
  }).length

  const canceledCount = orders.filter((o) => {
    const s = (o.status || '').toLowerCase()
    return s === 'canceled' || s === 'cancelled'
  }).length

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
              Order History & Tracking
            </h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh order history"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review past shipments, live botanical tracking, and transit quality logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('transit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'transit'
                ? 'bg-white text-brand-primary'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            In Transit ({inTransitCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'delivered'
                ? 'bg-white text-emerald-800'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Delivered ({deliveredCount})
          </button>
          {canceledCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filter === 'cancelled'
                  ? 'bg-white text-rose-800'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Canceled ({canceledCount})
            </button>
          )}
        </div>
      </div>

      {/* Optional Search Bar */}
      {orders.length > 2 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or specimen title..."
            className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Error Banner */}
      {ordersError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <span>{ordersError}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isRefreshing && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-stone-200/80 animate-pulse space-y-3">
              <div className="h-4 bg-stone-200 rounded w-1/3" />
              <div className="h-12 bg-stone-100 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-stone-700">No orders found in this view</p>
          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Clear your search to see all orders.`
              : filter === 'transit'
              ? 'You have no orders currently in botanical transit.'
              : filter === 'cancelled'
              ? 'You have no canceled orders.'
              : 'Browse our nursery collection and begin your planting journey.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 inline-block px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50"
            >
              Clear Search Filter
            </button>
          ) : (
            <Link
              href="/categories"
              className="mt-2 inline-block px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
            >
              Explore Plants & Seeds
            </Link>
          )}
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderHistoryCard key={order.id} order={order} onRefresh={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  )
}
