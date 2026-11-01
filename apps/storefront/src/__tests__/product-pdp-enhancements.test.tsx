import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoreCatalogProduct } from '@glorov/types'
import { StickyAddToCartBar } from '@/components/catalog/StickyAddToCartBar'
import { ProductReviews } from '@/components/catalog/ProductReviews'

const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockOpenDrawer = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    isMutating: false,
    openDrawer: mockOpenDrawer,
  }),
}))

const mockProduct = {
  id: 'prod_test_lily',
  title: 'Peace Lily Plant',
  thumbnail: '/ugaoo-assets/peace-lily.webp',
  variants: [
    {
      id: 'var_test_lily_6',
      title: '6-inch Grower Pot',
      inventory_quantity: 15,
      prices: [
        {
          currency_code: 'inr',
          amount: 49900,
        },
      ],
    },
  ],
} as unknown as StoreCatalogProduct

describe('Product PDP Enhancements Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('StickyAddToCartBar', () => {
    it('1. Renders sticky add to cart bar with product details, formatted INR price, and action button', () => {
      render(<StickyAddToCartBar product={mockProduct} />)

      expect(screen.getByText('Peace Lily Plant')).toBeInTheDocument()
      expect(screen.getByText('6-inch Grower Pot')).toBeInTheDocument()
      expect(screen.getByText('₹499')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add.*to Cart/i })).toBeInTheDocument()
    })

    it('2. Triggers add to cart and opens cart drawer on button click', async () => {
      render(<StickyAddToCartBar product={mockProduct} />)

      const btn = screen.getByRole('button', { name: /Add.*to Cart/i })
      fireEvent.click(btn)

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith('var_test_lily_6', 1)
        expect(mockOpenDrawer).toHaveBeenCalled()
      })
    })
  })

  describe('ProductReviews', () => {
    it('3. Renders rating overview, breakdown bars, and review cards', () => {
      render(<ProductReviews productTitle="Peace Lily Plant" />)

      expect(screen.getByRole('heading', { level: 2, name: /Customer Reviews & Experiences/i })).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('86%')).toBeInTheDocument()
      expect(screen.getByText('Ananya Deshmukh')).toBeInTheDocument()
      expect(screen.getByText(/Arrived healthy and thriving with moisture-shield wrap!/i)).toBeInTheDocument()
    })

    it('4. Allows toggling review submission form and submitting a new review', () => {
      render(<ProductReviews productTitle="Peace Lily Plant" />)

      const writeBtn = screen.getByRole('button', { name: /Write a Botanical Review/i })
      fireEvent.click(writeBtn)

      expect(screen.getByLabelText(/Your Name \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Review Headline \*/i)).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText(/Your Name \*/i), { target: { value: 'Karan Joshi' } })
      fireEvent.change(screen.getByLabelText(/Review Headline \*/i), { target: { value: 'Superb germination and vigor!' } })
      fireEvent.change(screen.getByLabelText(/Your Experience & Plant Condition \*/i), {
        target: { value: 'Plant was very vibrant and hydrated on delivery.' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }))

      expect(screen.getByText(/Thank you! Your botanical review has been published/i)).toBeInTheDocument()
      expect(screen.getByText('Karan Joshi')).toBeInTheDocument()
    })

    it('5. Increments helpful count when helpful button is clicked', () => {
      render(<ProductReviews productTitle="Peace Lily Plant" />)

      const helpfulButtons = screen.getAllByRole('button', { name: /Helpful/i })
      const firstBtn = helpfulButtons[0]
      expect(firstBtn).toHaveTextContent('Helpful (24)')

      fireEvent.click(firstBtn)
      expect(firstBtn).toHaveTextContent('Helpful (25)')
    })
  })
})
