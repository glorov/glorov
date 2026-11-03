'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Drawer } from '../ui/Drawer'
import { useStorefront, useWishlist } from '../../context/StorefrontContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { GlorovAccountIcon } from '../common/GlorovAccountIcon'
import { CATEGORY_NAV_ITEMS } from '../../lib/mock-data'

export function MobileMenuDrawer() {
  const { isMobileMenuOpen, closeMobileMenu } = useStorefront()
  const { wishlistIds } = useWishlist()
  const { customer, isAuthenticated, logout } = useCustomerAuth()

  const displayName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email
    : ''

  return (
    <Drawer
      isOpen={isMobileMenuOpen}
      onClose={closeMobileMenu}
      placement="left"
      title={
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-24">
            <Image
              src="/logo/glorov-logo.svg"
              alt="GLOROV"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>
      }
      footer={
        <div className="text-center w-full">
          <p className="text-xs text-text-muted">
            Botanical Helpline: support@glorov.in
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">
            100% Transit Safe Botanical Guarantee
          </p>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* 1. Botanical Categories */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 mb-2">
            Categories
          </p>
          <ul className="space-y-1">
            {CATEGORY_NAV_ITEMS.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={cat.route}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-3 py-2.5 rounded-glorov-sm text-text-primary hover:bg-surface-cream hover:text-brand-primary active:bg-mint-surface transition-colors font-medium text-sm"
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      {cat.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Customer Account & Orders */}
        <div className="border-t border-border-default pt-4">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 mb-2">
            My Account
          </p>

          {isAuthenticated ? (
            <div className="space-y-2">
              {/* User Profile Summary */}
              <Link
                href="/account"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-2 rounded-xl bg-surface-cream hover:bg-mint-surface transition-colors"
              >
                <GlorovAccountIcon user={customer} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-primary truncate">{displayName}</p>
                  <p className="text-[10px] text-text-muted truncate">{customer?.email}</p>
                </div>
              </Link>

              <ul className="space-y-1">
                <li>
                  <Link
                    href="/account/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-glorov-sm text-text-primary hover:bg-surface-cream transition-colors text-xs font-medium"
                  >
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Personal Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-glorov-sm text-text-primary hover:bg-surface-cream transition-colors text-xs font-medium"
                  >
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Orders & Tracking</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/addresses"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-glorov-sm text-text-primary hover:bg-surface-cream transition-colors text-xs font-medium"
                  >
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Delivery Addresses</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2 rounded-glorov-sm text-text-primary hover:bg-surface-cream transition-colors text-xs font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Botanical Wishlist</span>
                    </div>
                    {wishlistIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-[10px] font-bold">
                        {wishlistIds.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-glorov-sm text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium text-left"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2 px-1">
              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-xs"
              >
                <GlorovAccountIcon user={null} size={18} />
                <span>Sign In / Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. Growing Trust & Policies */}
        <div className="border-t border-border-default pt-4">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 mb-2">
            Trust & Support
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/policies/shipping"
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-glorov-sm text-text-secondary hover:text-brand-primary text-xs font-medium"
              >
                Shipping & Plant Transit Shield
              </Link>
            </li>
            <li>
              <Link
                href="/policies/terms"
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-glorov-sm text-text-secondary hover:text-brand-primary text-xs font-medium"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/policies/privacy"
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-glorov-sm text-text-secondary hover:text-brand-primary text-xs font-medium"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Drawer>
  )
}
