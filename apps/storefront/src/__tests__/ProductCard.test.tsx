import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductCard } from '../components/product/ProductCard'
import type { GlorovProductItem } from '../types/storefront'
import { CartProvider } from '../context/CartContext'

const mockProduct: GlorovProductItem = {
  id: 'prod_monstera_deliciosa',
  slug: 'monstera-deliciosa',
  title: 'Monstera Deliciosa (Swiss Cheese Plant)',
  botanicalName: 'Monstera deliciosa Liebm.',
  shortDescription: 'Hardy tropical indoor climbing vine with fenestrated split leaves.',
  category: 'Live Houseplants',
  price: 799,
  discountPrice: 599,
  rating: 4.8,
  reviewCount: 32,
  imageUrls: [
    'https://res.cloudinary.com/naodmm8w/image/upload/v1793571735/glorov/products/plants/monstera-1.png',
  ],
  primaryImage:
    'https://res.cloudinary.com/naodmm8w/image/upload/v1793571735/glorov/products/plants/monstera-1.png',
  inStock: true,
  isBestSeller: true,
  badges: ['Best Seller', 'Air Purifying'],
  variants: [
    {
      id: 'var_monstera_white',
      name: 'White Ceramic Pot (6 inch)',
      price: 799,
      discountPrice: 599,
      inStock: true,
    },
  ],
}

describe('ProductCard Component Tests (ProductCard.test.tsx)', () => {
  const renderCard = (props: Partial<React.ComponentProps<typeof ProductCard>> = {}) => {
    return render(
      <CartProvider>
        <ProductCard product={mockProduct} {...props} />
      </CartProvider>
    )
  }

  it('renders product information including title, link, and promotional badges', () => {
    renderCard()

    expect(screen.getByText('Monstera Deliciosa (Swiss Cheese Plant)')).toBeDefined()
    expect(screen.getByText('Best Seller')).toBeDefined()

    const link = screen.getByRole('link', {
      name: /view details for monstera deliciosa/i,
    })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/products/monstera-deliciosa')
  })

  it('renders pricing with discounted selling price and original price strike-through', () => {
    renderCard()

    // Selling price: ₹599
    expect(screen.getByText('₹599')).toBeDefined()

    // Original strike-through price: ₹799
    const originalPrice = screen.getByText('₹799')
    expect(originalPrice).toBeDefined()
    expect(originalPrice.className).toContain('line-through')

    // Calculated discount badge: (799-599)/799 = ~25% OFF
    expect(screen.getByText(/25% OFF/i)).toBeDefined()
  })

  it('renders rating badge and review count', () => {
    renderCard()

    expect(screen.getByText('4.8')).toBeDefined()
    expect(screen.getByText('32')).toBeDefined()
  })

  it('renders botanical subtitle when showSubtitle is true and shortDescription exists', () => {
    renderCard({ showSubtitle: true })

    expect(
      screen.getByText('Hardy tropical indoor climbing vine with fenestrated split leaves.')
    ).toBeDefined()
  })

  it('renders AddToCartButton and allows clicking add to cart', () => {
    renderCard()

    const addBtns = screen.getAllByRole('button', { name: /add.*cart/i })
    expect(addBtns.length).toBeGreaterThan(0)

    fireEvent.click(addBtns[0])
  })

  it('renders wishlist button when showWishlist is true', () => {
    renderCard({ showWishlist: true })

    const wishlistBtn = screen.getByRole('button', { name: /wishlist/i })
    expect(wishlistBtn).toBeDefined()
  })

  it('reflects out of stock state for unavailable products', () => {
    const outOfStockProduct: GlorovProductItem = {
      ...mockProduct,
      inStock: false,
      badges: ['Out of Stock'],
    }

    render(
      <CartProvider>
        <ProductCard product={outOfStockProduct} />
      </CartProvider>
    )

    expect(screen.getByText('Out of Stock')).toBeDefined()
  })
})
