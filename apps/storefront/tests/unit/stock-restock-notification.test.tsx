import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductCard } from '../../src/components/product/ProductCard'
import { ProductDetailView } from '../../src/components/product/ProductDetailView'
import { CartProvider } from '../../src/context/CartContext'
import { StorefrontProvider } from '../../src/context/StorefrontContext'
import type { GlorovProductItem } from '../../src/types/storefront'

const baseMockProduct: GlorovProductItem = {
  id: 'test-plant-01',
  slug: 'test-peace-lily',
  title: 'Peace Lily Plant',
  price: 299,
  discountPrice: 249,
  discountPercent: 17,
  rating: 4.8,
  reviewCount: 15,
  category: 'Live Plants',
  subcategory: 'Indoor Plants',
  productType: 'plants',
  imageUrls: ['/test-image.jpg'],
  primaryImage: '/test-image.jpg',
  inStock: true,
  stockQuantity: 10,
}

describe('Stock Handling & Restock Notification Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('does NOT render low stock warning on ProductCard to keep the card clean', () => {
    const lowStockProduct: GlorovProductItem = {
      ...baseMockProduct,
      inStock: true,
      stockQuantity: 1,
    }

    render(
      <CartProvider>
        <ProductCard product={lowStockProduct} />
      </CartProvider>
    )

    // ProductCard should keep the listing clean - no low stock text
    expect(screen.queryByText(/remaining/i)).toBeNull()
    expect(screen.queryByText(/Only 1/i)).toBeNull()
    expect(screen.getByText('Peace Lily Plant')).toBeDefined()
  })

  it('renders low stock warning ONLY inside the product detail page when opened', () => {
    const lowStockProduct: GlorovProductItem = {
      ...baseMockProduct,
      inStock: true,
      stockQuantity: 1,
    }

    render(
      <StorefrontProvider>
        <CartProvider>
          <ProductDetailView product={lowStockProduct} />
        </CartProvider>
      </StorefrontProvider>
    )

    // Inside product page: shows urgency banner and stock status
    expect(screen.getAllByText(/Only 1 stock remaining in our nursery/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Only 1 stock left/i).length).toBeGreaterThan(0)
  })

  it('renders Sold Out badge on top card and Out of Stock in body when inStock is false', () => {
    const soldOutProduct: GlorovProductItem = {
      ...baseMockProduct,
      inStock: false,
      stockQuantity: 0,
    }

    render(
      <CartProvider>
        <ProductCard product={soldOutProduct} />
      </CartProvider>
    )

    expect(screen.getByText('Sold Out')).toBeDefined()
    expect(screen.getByText('Out of Stock')).toBeDefined()
    expect(screen.getAllByText('Notify Me').length).toBeGreaterThan(0)
  })

  it('renders circular Notify button when forceCircularAction is true on sold out product', () => {
    const soldOutProduct: GlorovProductItem = {
      ...baseMockProduct,
      inStock: false,
      stockQuantity: 0,
    }

    render(
      <CartProvider>
        <ProductCard product={soldOutProduct} forceCircularAction={true} />
      </CartProvider>
    )

    const notifyBtn = screen.getByRole('button', { name: /notify me when peace lily plant is restocked/i })
    expect(notifyBtn).toBeDefined()
  })
})
