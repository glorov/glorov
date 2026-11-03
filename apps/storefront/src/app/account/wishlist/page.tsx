'use client'

import React from 'react'
import Link from 'next/link'
import { useWishlist } from '../../../context/StorefrontContext'
import { MOCK_PRODUCTS } from '../../../lib/mock-data'
import { ProductCard } from '../../../components/product/ProductCard'

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist()

  // Find products corresponding to wishlistIds
  const wishlistProducts = MOCK_PRODUCTS.filter((p) => wishlistIds.includes(p.id))

  const handleSeedWishlist = () => {
    // Add first 3 products to wishlist
    MOCK_PRODUCTS.slice(0, 3).forEach((p) => {
      if (!wishlistIds.includes(p.id)) {
        toggleWishlist(p.id)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">Botanical Wishlist</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/60">
              {wishlistIds.length} {wishlistIds.length === 1 ? 'Plant' : 'Plants'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Curated garden additions saved for your balcony, indoor space, or seasonal beds.
          </p>
        </div>

        {wishlistIds.length > 0 && (
          <Link
            href="/category/plants"
            className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Continue Browsing</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Wishlist Grid */}
      {wishlistProducts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-stone-800">Your Botanical Wishlist is Empty</h3>
            <p className="text-xs text-stone-500 mt-1">
              Tap the heart icon on any plant, ceramic pot, or seed pack to save it to your personal wishlist.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              href="/category/plants"
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-emerald-700 transition"
            >
              Explore Living Plants
            </Link>
            <button
              type="button"
              onClick={handleSeedWishlist}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
            >
              Add Popular Plants to Wishlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
