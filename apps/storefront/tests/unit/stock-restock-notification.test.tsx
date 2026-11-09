import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductCard } from '../../src/components/product/ProductCard'
import { CartProvider } from '../../src/context/CartContext'
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

  it('renders "Only 1 stock remaining" inside the card when stockQuantity is 1', () => {
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

    expect(screen.getByText('Only 1 stock remaining')).toBeDefined()
  })

  it('renders "Only 2 stocks remaining" inside the card when stockQuantity is 2', () => {
    const lowStockProduct: GlorovProductItem = {
      ...baseMockProduct,
      inStock: true,
      stockQuantity: 2,
    }

    render(
      <CartProvider>
        <ProductCard product={lowStockProduct} />
      </CartProvider>
    )

    expect(screen.getByText('Only 2 stocks remaining')).toBeDefined()
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
