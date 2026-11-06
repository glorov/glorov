import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import type { CartItem } from '../types/cart'
import { CartProvider } from '../context/CartContext'

const mockCheckoutItems: CartItem[] = [
  {
    id: 'item_01',
    productId: 'prod_chilli',
    title: 'Desi Green Chilli Seeds',
    variantName: '100 Seeds Value Pack',
    price: 99,
    originalPrice: 149,
    quantity: 2,
    image: 'https://res.cloudinary.com/naodmm8w/image/upload/chilli.png',
  },
  {
    id: 'item_02',
    productId: 'prod_fiddle_leaf',
    title: 'Fiddle Leaf Fig Tree',
    variantName: '8-inch Nursery Pot',
    price: 899,
    originalPrice: 1099,
    quantity: 1,
    image: 'https://res.cloudinary.com/naodmm8w/image/upload/fig.png',
  },
]

describe('CheckoutSummary Component Tests (CheckoutSummary.test.tsx)', () => {
  const renderSummary = (props: Partial<React.ComponentProps<typeof CheckoutSummary>> = {}) => {
    const defaultProps: React.ComponentProps<typeof CheckoutSummary> = {
      items: mockCheckoutItems,
      subtotal: 1097, // (99*2) + 899 = 1097
      discountAmount: 0,
      shippingAmount: 0, // Free delivery for orders >= 499
      total: 1097,
      isSubmitting: false,
      isAddressValid: true,
      onPlaceOrder: vi.fn(),
      ...props,
    }

    return render(
      <CartProvider>
        <CheckoutSummary {...defaultProps} />
      </CartProvider>
    )
  }

  it('renders order summary header and item count', () => {
    renderSummary()

    expect(screen.getByText('ORDER SUMMARY')).toBeDefined()
    expect(screen.getAllByText(/2 items/i).length).toBeGreaterThan(0)
  })

  it('renders itemized products with titles, variant details, and quantities', () => {
    renderSummary()

    expect(screen.getByText('Desi Green Chilli Seeds')).toBeDefined()
    expect(screen.getByText(/100 Seeds Value Pack • Qty: 2/i)).toBeDefined()

    expect(screen.getByText('Fiddle Leaf Fig Tree')).toBeDefined()
    expect(screen.getByText(/8-inch Nursery Pot • Qty: 1/i)).toBeDefined()
  })

  it('shows correct subtotal, FREE shipping badge, and total payable', () => {
    renderSummary({
      subtotal: 1097,
      shippingAmount: 0,
      total: 1097,
    })

    expect(screen.getByText(/Subtotal \(2 items\)/i)).toBeDefined()
    expect(screen.getAllByText('₹1,097').length).toBe(2) // Subtotal and Grand Total
    expect(screen.getByText('Transit & Packing')).toBeDefined()
    expect(screen.getByText('FREE')).toBeDefined()
    expect(screen.getByText('Total Payable')).toBeDefined()
  })

  it('displays standard shipping fee when order is under ₹499', () => {
    renderSummary({
      items: [mockCheckoutItems[0]], // Only chilli seeds (₹198)
      subtotal: 198,
      shippingAmount: 99,
      total: 297, // 198 + 99
    })

    expect(screen.getByText(/Subtotal \(1 items\)/i)).toBeDefined()
    expect(screen.getAllByText('₹198').length).toBe(2) // Line item and Subtotal
    expect(screen.getByText('₹99')).toBeDefined()
    expect(screen.getByText('₹297')).toBeDefined()
  })

  it('shows applied coupon code and discount deduction when discount is active', () => {
    renderSummary({
      subtotal: 1097,
      discountAmount: 110,
      appliedCoupon: 'DIWALI10',
      total: 987, // 1097 - 110
    })

    expect(screen.getByText(/Promo Savings/i)).toBeDefined()
    expect(screen.getAllByText('DIWALI10').length).toBeGreaterThan(0)
    expect(screen.getByText('- ₹110')).toBeDefined()
    expect(screen.getByText('₹987')).toBeDefined()
  })

  it('enables place order button and calls onPlaceOrder when clicked', () => {
    const handlePlaceOrder = vi.fn()

    renderSummary({
      isAddressValid: true,
      isSubmitting: false,
      onPlaceOrder: handlePlaceOrder,
    })

    const placeOrderBtn = screen.getByRole('button', { name: /confirm & place order/i })
    expect(placeOrderBtn).toBeDefined()
    expect((placeOrderBtn as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(placeOrderBtn)
    expect(handlePlaceOrder).toHaveBeenCalledTimes(1)
  })

  it('disables place order button when address is incomplete or invalid', () => {
    renderSummary({
      isAddressValid: false,
      isSubmitting: false,
    })

    const placeOrderBtn = screen.getByRole('button', {
      name: /confirm & place order/i,
    })
    expect(placeOrderBtn).toBeDefined()
    expect((placeOrderBtn as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(/Please complete the required delivery address fields/i)).toBeDefined()
  })

  it('disables place order button and shows spinner state when isSubmitting is true', () => {
    renderSummary({
      isAddressValid: true,
      isSubmitting: true,
    })

    const placeOrderBtn = screen.getByRole('button', {
      name: /confirming order\.\.\./i,
    })
    expect(placeOrderBtn).toBeDefined()
    expect((placeOrderBtn as HTMLButtonElement).disabled).toBe(true)
  })
})
