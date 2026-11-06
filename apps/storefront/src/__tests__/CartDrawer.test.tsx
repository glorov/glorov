import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CartDrawer } from '../components/cart/CartDrawer'
import type { CartItem } from '../types/cart'

const mockCartItems: CartItem[] = [
  {
    id: 'cart_item_01',
    productId: 'prod_tomato_seeds',
    title: 'Desi Pusa Ruby Tomato Seeds',
    variantName: '50 Seeds Packet',
    price: 49,
    originalPrice: 79,
    quantity: 2,
    image: 'https://res.cloudinary.com/naodmm8w/image/upload/tomato.png',
  },
  {
    id: 'cart_item_02',
    productId: 'prod_peace_lily',
    title: 'Peace Lily Air Purifier',
    variantName: 'White Self-Watering Planter',
    price: 499,
    originalPrice: 599,
    quantity: 1,
    image: 'https://res.cloudinary.com/naodmm8w/image/upload/peace-lily.png',
  },
]

describe('CartDrawer Component Tests (CartDrawer.test.tsx)', () => {
  it('renders cart drawer when isOpen is true', () => {
    const handleClose = vi.fn()

    render(
      <CartDrawer
        isOpen={true}
        onClose={handleClose}
        items={mockCartItems}
        subtotal={597}
        total={597}
      />
    )

    expect(screen.getByText('Your Cart')).toBeDefined()
    expect(screen.getByTestId('drawer-cart-count').textContent).toBe('3 items')
  })

  it('does not render visible drawer content when isOpen is false', () => {
    render(
      <CartDrawer
        isOpen={false}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597}
        total={597}
      />
    )

    expect(screen.queryByTestId('drawer-cart-count')).toBeNull()
  })

  it('renders all cart items with title, variant, price, and quantities', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597}
        total={597}
      />
    )

    // Verify first item
    expect(screen.getByText('Desi Pusa Ruby Tomato Seeds')).toBeDefined()
    expect(screen.getByText('50 Seeds Packet')).toBeDefined()
    expect(screen.getByTestId('drawer-qty-val-cart_item_01').textContent).toBe('2')

    // Verify second item
    expect(screen.getByText('Peace Lily Air Purifier')).toBeDefined()
    expect(screen.getByText('White Self-Watering Planter')).toBeDefined()
    expect(screen.getByTestId('drawer-qty-val-cart_item_02').textContent).toBe('1')
  })

  it('displays correct subtotal, shipping status, and estimated total', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597} // >= 499, free shipping
        total={597}
      />
    )

    // Subtotal: ₹597
    expect(screen.getByTestId('drawer-subtotal').textContent).toBe('₹597')

    // Free delivery unlocked
    expect(screen.getByTestId('drawer-shipping').textContent).toBe('FREE')

    // Total: ₹597
    expect(screen.getByTestId('drawer-total').textContent).toBe('₹597')
  })

  it('displays delivery charge of ₹99 when subtotal is below ₹499 threshold', () => {
    const lowValueItems: CartItem[] = [
      {
        id: 'cart_item_low',
        productId: 'prod_seeds',
        title: 'Coriander Seeds',
        price: 99,
        quantity: 1,
        image: 'https://res.cloudinary.com/naodmm8w/image/upload/coriander.png',
      },
    ]

    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={lowValueItems}
        subtotal={99}
        total={198} // 99 + 99 shipping
      />
    )

    expect(screen.getByTestId('drawer-subtotal').textContent).toBe('₹99')
    expect(screen.getByTestId('drawer-shipping').textContent).toBe('₹99')
    expect(screen.getByTestId('drawer-total').textContent).toBe('₹198')
  })

  it('triggers onUpdateQuantity when quantity stepper buttons (+/-) are clicked', () => {
    const handleUpdateQuantity = vi.fn()

    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597}
        total={597}
        onUpdateQuantity={handleUpdateQuantity}
      />
    )

    // Increase quantity of tomato seeds (from 2 to 3)
    const incBtn = screen.getByTestId('drawer-qty-inc-cart_item_01')
    fireEvent.click(incBtn)
    expect(handleUpdateQuantity).toHaveBeenCalledWith('cart_item_01', 3)

    // Decrease quantity of tomato seeds (from 2 to 1)
    const decBtn = screen.getByTestId('drawer-qty-dec-cart_item_01')
    fireEvent.click(decBtn)
    expect(handleUpdateQuantity).toHaveBeenCalledWith('cart_item_01', 1)
  })

  it('triggers onRemoveItem when Remove link is clicked', () => {
    const handleRemoveItem = vi.fn()

    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597}
        total={597}
        onRemoveItem={handleRemoveItem}
      />
    )

    const removeBtn = screen.getByTestId('drawer-remove-cart_item_01')
    fireEvent.click(removeBtn)

    expect(handleRemoveItem).toHaveBeenCalledWith('cart_item_01')
  })

  it('displays empty state when cart has no items', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={[]}
        subtotal={0}
        total={0}
      />
    )

    expect(screen.getByTestId('drawer-empty-state')).toBeDefined()
    expect(screen.getByText('Your cart is empty')).toBeDefined()
    expect(screen.getByTestId('drawer-shop-now-btn')).toBeDefined()
  })

  it('handles checkout callback when Proceed to Checkout button is clicked', () => {
    const handleCheckout = vi.fn()

    render(
      <CartDrawer
        isOpen={true}
        onClose={vi.fn()}
        items={mockCartItems}
        subtotal={597}
        total={597}
        onCheckout={handleCheckout}
      />
    )

    const checkoutBtn = screen.getByTestId('drawer-checkout-btn')
    fireEvent.click(checkoutBtn)

    expect(handleCheckout).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close icon button is clicked', () => {
    const handleClose = vi.fn()

    render(
      <CartDrawer
        isOpen={true}
        onClose={handleClose}
        items={mockCartItems}
        subtotal={597}
        total={597}
      />
    )

    const closeBtn = screen.getByRole('button', { name: /close drawer/i })
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
