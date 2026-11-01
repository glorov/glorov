import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoreCatalogProduct } from '@glorov/types'
import { FrequentlyBoughtTogether } from '@/components/catalog/FrequentlyBoughtTogether'

const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockOpenDrawer = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    openDrawer: mockOpenDrawer,
    isMutating: false,
  }),
}))

const mockMainProduct = {
  id: 'prod_peace_lily',
  title: 'Peace Lily Plant',
  thumbnail: '/ugaoo-assets/cat-plants.webp',
  variants: [
    {
      id: 'var_lily_01',
      title: '6-inch Nursery Grower Pot',
      inventory_quantity: 10,
      prices: [{ currency_code: 'inr', amount: 50000 }], // ₹500
    },
  ],
} as unknown as StoreCatalogProduct

const mockCompanionProduct = {
  id: 'prod_tulsi_seeds',
  title: 'Desi Krishna Tulsi Seeds',
  thumbnail: '/ugaoo-assets/cat-seeds.webp',
  variants: [
    {
      id: 'var_tulsi_01',
      title: 'Standard Seed Packet',
      inventory_quantity: 50,
      prices: [{ currency_code: 'inr', amount: 10000 }], // ₹100
    },
  ],
} as unknown as StoreCatalogProduct

describe('FrequentlyBoughtTogether Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. Renders titles, checkboxes, and bundle discount badge when both are selected', () => {
    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        companionProduct={mockCompanionProduct}
      />
    )

    expect(
      screen.getByRole('heading', { level: 2, name: /Frequently Sown & Grown Together/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Peace Lily Plant')).toBeInTheDocument()
    expect(screen.getByText('Desi Krishna Tulsi Seeds')).toBeInTheDocument()
    expect(screen.getByText(/Save 10% Bundle Discount/i)).toBeInTheDocument()

    // 500 + 100 = 600 - 10% = ₹540
    expect(screen.getByText('₹540')).toBeInTheDocument()
    expect(screen.getByText('₹600')).toBeInTheDocument() // Strikethrough
  })

  it('2. Dynamically recalculates total without bundle discount when companion is unchecked', () => {
    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        companionProduct={mockCompanionProduct}
      />
    )

    const companionCheckbox = screen.getByLabelText(/Select Desi Krishna Tulsi Seeds/i)
    fireEvent.click(companionCheckbox) // uncheck

    // Now only main product is selected: ₹500, no discount
    expect(screen.getAllByText('₹500').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Total for 1 Item/i)).toBeInTheDocument()
    expect(screen.queryByText(/Save 10% Bundle Discount/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add selected item to cart/i })).toBeInTheDocument()
  })

  it('3. Triggers addToCart for both items and opens cart drawer on bundle submit', async () => {
    render(
      <FrequentlyBoughtTogether
        mainProduct={mockMainProduct}
        companionProduct={mockCompanionProduct}
      />
    )

    const bundleBtn = screen.getByRole('button', { name: /Add both items to cart/i })
    fireEvent.click(bundleBtn)

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('var_lily_01', 1)
      expect(mockAddToCart).toHaveBeenCalledWith('var_tulsi_01', 1)
      expect(mockOpenDrawer).toHaveBeenCalled()
    })
  })
})
