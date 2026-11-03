'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { OrderHistoryCard } from '../../../components/account/OrderHistoryCard'

type OrderFilter = 'all' | 'transit' | 'delivered'

export default function OrdersPage() {
  const { orders } = useCustomerAuth()
  const [filter, setFilter] = useState<OrderFilter>('all')

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    if (filter === 'transit') return order.status === 'pending' || order.status === 'processing' || order.status === 'shipped'
    if (filter === 'delivered') return order.status === 'delivered'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">Order History & Tracking</h1>
          <p className="text-xs text-stone-500 mt-1">
            Review past shipments, live botanical tracking, and transit quality logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('transit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === 'transit'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            In Transit
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === 'delivered'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-stone-700">No orders found in this view</p>
          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
            {filter === 'transit'
              ? 'You have no orders currently in botanical transit.'
              : 'Browse our nursery collection and begin your planting journey.'}
          </p>
          <Link
            href="/category/plants"
            className="mt-2 inline-block px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
          >
            Explore Plants & Seeds
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
