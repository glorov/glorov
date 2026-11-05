'use client'

import React, { useState } from 'react'
import { PageContainer } from '../../../components/layout/PageContainer'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { ProductCard } from '../../../components/product/ProductCard'
import { ProductPrice } from '../../../components/product/ProductPrice'
import { RatingStars } from '../../../components/product/RatingStars'
import { ProductBadge } from '../../../components/product/ProductBadge'
import { QuantitySelector } from '../../../components/common/QuantitySelector'
import { Pagination } from '../../../components/common/Pagination'
import { Button } from '../../../components/ui/Button'
import { useToast, useCart, useWishlist, useStorefront } from '../../../context/StorefrontContext'
import { MOCK_PRODUCTS } from '../../../lib/mock-data'

export default function SharedComponentsShowcasePage() {
  const { showToast } = useToast()
  const { cartCount, cartTotal, clearCart } = useCart()
  const { wishlistIds } = useWishlist()
  const { openMobileMenu } = useStorefront()

  const [quantity, setQuantity] = useState(2)
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="w-full bg-[#F9FAF8] py-6 sm:py-10 space-y-8 sm:space-y-12">
      <PageContainer>
        {/* Showcase Header */}
        <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                Prompt 4 Migration Showcase
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#081C15]">
                Shared Storefront Components
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openMobileMenu}
                className="md:hidden"
              >
                Test Mobile Drawer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  showToast('success', 'Botanical cart synchronized successfully!', {
                    title: 'Live Notification',
                  })
                }
              >
                Test Botanical Toast
              </Button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            Comprehensive gallery of migrated shared components conforming to Flutter styling, strict TypeScript, responsive 350px-first safety, and zero horizontal overflow.
          </p>
        </div>

        {/* Live Reactive State Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-glorov-md border border-[#E5E7EB] shadow-sm text-xs">
          <div>
            <span className="text-[#6B7280] block">Cart Item Count</span>
            <strong className="text-base text-[#1B4332] font-extrabold">{cartCount} items</strong>
          </div>
          <div>
            <span className="text-[#6B7280] block">Cart Total Value</span>
            <strong className="text-base text-[#1B4332] font-extrabold">₹{cartTotal}</strong>
          </div>
          <div>
            <span className="text-[#6B7280] block">Wishlist Saved</span>
            <strong className="text-base text-[#85102F] font-extrabold">{wishlistIds.length} items</strong>
          </div>
          <div className="flex items-center justify-end">
            {cartCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Reset Cart
              </Button>
            )}
          </div>
        </div>
      </PageContainer>

      {/* 1. Breadcrumbs Section */}
      <section className="space-y-3">
        <PageContainer>
          <h2 className="text-lg font-bold text-[#081C15]">1. Breadcrumbs Navigation</h2>
        </PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Seeds', href: '/categories/seeds' },
            { label: 'Vegetable Seeds', href: '/categories/vegetables' },
            { label: 'Green Chilli Seeds (Heirloom)' },
          ]}
        />
      </section>

      {/* 2. Product Card Grid (Botanical Catalog) */}
      <section className="space-y-4">
        <PageContainer>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#081C15]">2. Product Cards (Responsive Botanical Grid)</h2>
              <p className="text-xs text-[#6B7280]">
                Ported from Flutter GlorovProductCard with frosted rating glass, tag badges, and quick-add actions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4">
            {MOCK_PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 3. Product Sub-Components Catalog */}
      <PageContainer className="space-y-8">
        {/* Pricing & Badging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-glorov-md border border-[#E5E7EB] shadow-sm">
          {/* Price Component Variants */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
              3. Product Pricing Displays
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-text-muted block">Large (PDP)</span>
                <ProductPrice price={899} originalPrice={1299} size="lg" showDiscountBadge />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block">Medium (Card Default)</span>
                <ProductPrice price={499} originalPrice={699} size="md" showDiscountBadge />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block">Small (Compact List)</span>
                <ProductPrice price={149} originalPrice={199} size="sm" />
              </div>
            </div>
          </div>

          {/* Rating Displays */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
              4. Botanical Rating Displays
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-text-muted block">Large Green Stars</span>
                <RatingStars rating={4.8} reviewCount={64} size="lg" color="green" />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block">Medium Amber Stars</span>
                <RatingStars rating={4.5} reviewCount={32} size="md" color="amber" />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block">Compact Stars</span>
                <RatingStars rating={5.0} reviewCount={12} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Badges Catalog */}
        <div className="bg-white p-5 rounded-glorov-md border border-[#E5E7EB] shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
            5. Domain Badges & Indicators
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <ProductBadge variant="promotional">HEIRLOOM</ProductBadge>
            <ProductBadge variant="promotional">BESTSELLER</ProductBadge>
            <ProductBadge variant="organic">100% ORGANIC</ProductBadge>
            <ProductBadge variant="sale">25% OFF</ProductBadge>
            <ProductBadge variant="in-stock">In Stock</ProductBadge>
            <ProductBadge variant="low-stock">Low Stock</ProductBadge>
            <ProductBadge variant="out-of-stock">Sold Out</ProductBadge>
          </div>
        </div>

        {/* Stepper & Pagination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-glorov-md border border-[#E5E7EB] shadow-sm">
          {/* Quantity Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
              6. Quantity Stepper
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-[11px] text-text-muted block mb-1">Large (PDP)</span>
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={10} size="lg" />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block mb-1">Medium (Standard)</span>
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={10} size="md" />
              </div>
              <div>
                <span className="text-[11px] text-text-muted block mb-1">Small (Cart Pill)</span>
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={10} size="sm" variant="cart" />
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
              7. Pagination Control
            </h3>
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Botanical Toast Triggers */}
        <div className="bg-white p-5 rounded-glorov-md border border-[#E5E7EB] shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332]">
            8. Botanical Toast Notifications
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                showToast('success', 'Rare heirloom seeds added to your bag.', {
                  actionLabel: 'VIEW BAG',
                  onAction: () => {
                    if (typeof window !== 'undefined') window.location.href = '/cart'
                  },
                })
              }
            >
              Show Success Toast
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                showToast('warning', 'Limited nursery stock: Only 3 saplings remain.')
              }
            >
              Show Warning Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                showToast('error', 'Invalid promo code. Please check spelling.')
              }
            >
              Show Error Toast
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                showToast('info', 'Express botanical shipping active for your area.')
              }
            >
              Show Info Toast
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
