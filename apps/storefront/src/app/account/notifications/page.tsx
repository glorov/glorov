'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import type { CustomerNotification } from '../../../types/account'

type NotifCategoryFilter = 'all' | 'order' | 'gardening_tip' | 'wishlist'

export default function NotificationsPage() {
  const {
    customer,
    notifications,
    markNotificationAsRead,
    notificationPreferences,
    updateNotificationPreferences,
  } = useCustomerAuth()
  const [filter, setFilter] = useState<NotifCategoryFilter>('all')
  const [showPreferences, setShowPreferences] = useState(false)
  const [isUpdatingPref, setIsUpdatingPref] = useState<string | null>(null)

  const handleTogglePref = async (key: keyof typeof notificationPreferences) => {
    setIsUpdatingPref(key)
    try {
      await updateNotificationPreferences({ [key]: !notificationPreferences[key] })
    } finally {
      setIsUpdatingPref(null)
    }
  }

  const handleMarkAllRead = () => {
    notifications.filter((n) => !n.isRead).forEach((n) => markNotificationAsRead(n.id))
  }

  if (!customer) {
    return (
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F5E9] border-1.5 border-[#86EFAC] text-[#1B4332] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">Sign In to View Notifications</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Please sign in to view dispatch milestones, temperature warnings, and cultivation alerts.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/auth/login?redirect=/account/notifications"
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition"
          >
            Sign In to GLOROV
          </Link>
          <Link
            href="/auth/signup?redirect=/account/notifications"
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  const filteredNotifs = notifications.filter((notif) => {
    if (filter === 'all') return true
    return notif.category === filter
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getCategoryIcon = (category: CustomerNotification['category']) => {
    switch (category) {
      case 'order':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-brand-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        )
      case 'gardening_tip':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )
      case 'wishlist':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dispatch milestones, temperature warnings, and seasonal cultivation alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPreferences((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                showPreferences
                  ? 'bg-[#1B4332] text-white'
                  : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{showPreferences ? 'Close Preferences' : 'Preferences'}</span>
            </button>
          </div>
        </div>

        {/* Notification Preferences Drawer / Accordion */}
        {showPreferences && (
          <div className="pt-4 border-t border-stone-100 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Notification &amp; Channel Preferences
                </h3>
                <p className="text-[11px] text-stone-500">
                  Choose which alerts and communication types you want to receive across SMS and email.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Order Updates */}
              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-900">Order Milestones</p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Confirmation, nursery preparation, and packing updates
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUpdatingPref === 'order_updates'}
                  onClick={() => handleTogglePref('order_updates')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    notificationPreferences.order_updates ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle order milestone notifications"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPreferences.order_updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Shipping Alerts */}
              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-900">Transit &amp; Delivery</p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Live courier tracking, out-for-delivery, and arrival alerts
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUpdatingPref === 'shipping_alerts'}
                  onClick={() => handleTogglePref('shipping_alerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    notificationPreferences.shipping_alerts ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle shipping and delivery notifications"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPreferences.shipping_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Gardening Tips */}
              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-900">Seasonal Care Guidance</p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Sowing calendars, watering tips, and pruning advice
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUpdatingPref === 'botanical_tips'}
                  onClick={() => handleTogglePref('botanical_tips')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    notificationPreferences.botanical_tips ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle seasonal care guidance"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPreferences.botanical_tips ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Promotions */}
              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-900">Exclusive Offers</p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Private sales, free transit vouchers, and seasonal coupons
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUpdatingPref === 'promotions'}
                  onClick={() => handleTogglePref('promotions')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    notificationPreferences.promotions ? 'bg-[#1B4332]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle promotional notifications"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPreferences.promotions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('order')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'order' ? 'bg-white text-brand-primary' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setFilter('gardening_tip')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'gardening_tip' ? 'bg-white text-amber-700' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Care Tips
          </button>
          <button
            type="button"
            onClick={() => setFilter('wishlist')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'wishlist' ? 'bg-white text-rose-700' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Wishlist
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-xs font-bold text-stone-700">No notifications in this category</p>
          <p className="text-[11px] text-stone-500">You are completely up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl bg-white border transition-colors cursor-pointer flex items-start gap-3.5 ${
                notif.isRead
                  ? 'border-stone-200/80 opacity-80'
                  : 'border-emerald-200 bg-emerald-50/20'
              }`}
            >
              {getCategoryIcon(notif.category)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">
                    {notif.date}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <Link
                    href={notif.link}
                    className="inline-block mt-2 text-[11px] font-bold text-brand-primary hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
