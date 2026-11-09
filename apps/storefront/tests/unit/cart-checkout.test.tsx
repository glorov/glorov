import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CartItemRow } from '../../src/components/cart/CartItemRow'
import { FreeShippingProgressBar } from '../../src/components/cart/FreeShippingProgressBar'
import { CouponVoucherCard } from '../../src/components/cart/CouponVoucherCard'
import { CartOrderSummary } from '../../src/components/cart/CartOrderSummary'
import { CheckoutAddressForm } from '../../src/components/checkout/CheckoutAddressForm'
import { ShippingMethodSelector } from '../../src/components/checkout/ShippingMethodSelector'
import { PaymentMethodSelector } from '../../src/components/checkout/PaymentMethodSelector'
import { CheckoutOrderSummary } from '../../src/components/checkout/CheckoutOrderSummary'
import type { CartItem } from '../../src/types/cart'
import { DEFAULT_SHIPPING_OPTIONS } from '../../src/context/StorefrontContext'

const mockCartItem: CartItem = {
  id: 'cart_item_1',
  productId: 'green-chilli-seeds',
  title: 'Green Chilli Seeds (Heirloom)',
  variantName: '100 Seeds Value Pack',
  price: 99,
  originalPrice: 149,
  quantity: 2,
  image: 'https://res.cloudinary.com/naodmm8w/image/upload/v1793571735/glorov/products/vegetable-seeds/green-chilli-seeds-1.png',
}

describe('Cart — CartItemRow', () => {
  it('renders product details, variant, price and stepper', () => {
    const onUpdate = vi.fn()
    const onRemove = vi.fn()

    render(
      <CartItemRow
        item={mockCartItem}
        onUpdateQuantity={onUpdate}
        onRemove={onRemove}
      />
    )

    expect(screen.getByText('Green Chilli Seeds (Heirloom)')).toBeDefined()
    expect(screen.getByText('100 Seeds Value Pack')).toBeDefined()
    expect(screen.getByText('₹99')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()

    const removeBtn = screen.getByLabelText(/Remove Green Chilli Seeds \(Heirloom\)/i)
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe('Cart — FreeShippingProgressBar', () => {
  it('displays remaining amount when under ₹499 threshold', () => {
    render(<FreeShippingProgressBar subtotal={200} />)
    expect(screen.getByText(/Add/i)).toBeDefined()
    expect(screen.getByText('free delivery')).toBeDefined()
  })

  it('displays unlocked celebration when above ₹499 threshold', () => {
    render(<FreeShippingProgressBar subtotal={550} />)
    expect(screen.getByText(/10% off/i)).toBeDefined()
  })
})

describe('Cart — CouponVoucherCard', () => {
  it('renders available milestone offers and allows applying a code', () => {
    const onApply = vi.fn().mockReturnValue(true)
    const onRemove = vi.fn()

    const testOffers = [
      {
        code: 'DIWALI10',
        title: '10% OFF',
        description: '10% OFF On orders above ₹499',
        discountPercent: 10,
        minSpend: 499,
      },
    ]

    render(
      <CouponVoucherCard
        appliedCoupon={null}
        onApplyCoupon={onApply}
        onRemoveCoupon={onRemove}
        subtotal={500}
        availableOffers={testOffers}
      />
    )

    expect(screen.getByText(/DIWALI10/i)).toBeDefined()

    const applyBtn = screen.getByRole('button', { name: /^APPLY$/i })
    fireEvent.click(applyBtn)
    expect(onApply).toHaveBeenCalledWith('DIWALI10')
  })

  it('renders applied voucher with remove button', () => {
    const onApply = vi.fn()
    const onRemove = vi.fn()

    render(
      <CouponVoucherCard
        appliedCoupon="DIWALI10"
        onApplyCoupon={onApply}
        onRemoveCoupon={onRemove}
        subtotal={500}
      />
    )

    expect(screen.getAllByText('DIWALI10').length).toBeGreaterThan(0)
    expect(screen.getByText('Remove')).toBeDefined()

    const removeBtn = screen.getByText('Remove')
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('does not recommend a lower coupon as BETTER when a 20% offer is active', () => {
    render(
      <CouponVoucherCard
        appliedCoupon="DIWALI20"
        onApplyCoupon={vi.fn()}
        onRemoveCoupon={vi.fn()}
        subtotal={869}
      />
    )

    // Should NOT show any "BETTER" upgrade badge or "10% OFF Special Unlocked" when 20% is active
    expect(screen.queryByText(/BETTER/i)).toBeNull()
    expect(screen.queryByText(/10% OFF Special Unlocked/i)).toBeNull()
  })

  it('enforces active milestone coupon thresholds and excludes inactive coupons', () => {
    import('../../src/context/StorefrontContext').then(({ MILESTONE_COUPONS }) => {
      const winter20 = MILESTONE_COUPONS.find((c) => c.code === 'WINTER20')
      const diwali20 = MILESTONE_COUPONS.find((c) => c.code === 'DIWALI20')
      const thunder15 = MILESTONE_COUPONS.find((c) => c.code === 'THUNDER15')
      const diwali15 = MILESTONE_COUPONS.find((c) => c.code === 'DIWALI15')
      const diwali10 = MILESTONE_COUPONS.find((c) => c.code === 'DIWALI10')

      // Active configured coupons
      expect(diwali20?.minSpend).toBe(2299)
      expect(diwali15?.minSpend).toBe(1599)
      expect(diwali10?.minSpend).toBe(999)

      // Inactive coupons must not be present in storefront active milestone tiers
      expect(winter20).toBeUndefined()
      expect(thunder15).toBeUndefined()
    })
  })
})

describe('Cart — CartOrderSummary', () => {
  it('renders itemized subtotal, discount, shipping, and grand total', () => {
    render(
      <CartOrderSummary
        subtotal={600}
        discountAmount={60}
        shippingAmount={0}
        total={540}
        appliedCoupon="GLOROV10"
        itemCount={3}
      />
    )

    expect(screen.getByText(/ORDER SUMMARY \(3 items\)/i)).toBeDefined()
    expect(screen.getByText('₹600')).toBeDefined()
    expect(screen.getByText('-₹60')).toBeDefined()
    expect(screen.getByText('FREE')).toBeDefined()
    expect(screen.getByText('₹540')).toBeDefined()
  })
})

describe('Checkout — CheckoutAddressForm', () => {
  it('validates required fields and reports validity', () => {
    const onChange = vi.fn()
    render(<CheckoutAddressForm initialAddress={null} onChange={onChange} />)

    const nameInput = screen.getByPlaceholderText(/Recipient full name/i)
    const phoneInput = screen.getByPlaceholderText(/9876543210/i)
    const emailInput = screen.getByPlaceholderText(/name@example.com/i)
    const addressInput = screen.getByPlaceholderText(/Flat 402/i)
    const cityInput = screen.getByPlaceholderText(/Bengaluru/i)
    const stateSelect = screen.getByLabelText(/State/i)
    const pincodeInput = screen.getByLabelText(/PIN Code/i)

    fireEvent.change(nameInput, { target: { value: 'Rohit Verma' } })
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    fireEvent.change(emailInput, { target: { value: 'rohit@example.com' } })
    fireEvent.change(addressInput, { target: { value: 'House 14, Lotus Enclave' } })
    fireEvent.change(cityInput, { target: { value: 'Bengaluru' } })
    fireEvent.change(stateSelect, { target: { value: 'Karnataka' } })
    fireEvent.change(pincodeInput, { target: { value: '560034' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fullName: 'Rohit Verma',
        phoneNumber: '9876543210',
        email: 'rohit@example.com',
        pincode: '560034',
      }),
      true
    )
  })
})

describe('Checkout — ShippingMethodSelector', () => {
  it('allows selecting shipping speed', () => {
    const onSelect = vi.fn()
    render(
      <ShippingMethodSelector
        selectedOptionId="so_standard"
        onSelectOption={onSelect}
        subtotal={500}
      />
    )

    expect(screen.getByText('Standard Botanical Delivery')).toBeDefined()
    expect(screen.getByText('Express Climate-Controlled Delivery')).toBeDefined()

    fireEvent.click(screen.getByText('Express Climate-Controlled Delivery'))
    expect(onSelect).toHaveBeenCalledWith(DEFAULT_SHIPPING_OPTIONS[1])
  })
})

describe('Checkout — PaymentMethodSelector', () => {
  it('renders COD and UPI options and handles selection', () => {
    const onSelect = vi.fn()
    render(
      <PaymentMethodSelector
        selectedMethod="cod"
        onSelectMethod={onSelect}
      />
    )

    expect(screen.getByText('Cash on Delivery (COD)')).toBeDefined()
    expect(screen.getByText(/UPI Instant Transfer/i)).toBeDefined()

    fireEvent.click(screen.getByText(/UPI Instant Transfer/i))
    expect(onSelect).toHaveBeenCalledWith('upi')
  })
})

describe('Checkout — CheckoutOrderSummary', () => {
  it('renders ordered items and triggers order placement', () => {
    const onPlace = vi.fn()

    render(
      <CheckoutOrderSummary
        items={[mockCartItem]}
        subtotal={198}
        discountAmount={0}
        shippingAmount={49}
        total={247}
        isSubmitting={false}
        isAddressValid={true}
        onPlaceOrder={onPlace}
      />
    )

    expect(screen.getByText(/ORDER SUMMARY/i)).toBeDefined()
    expect(screen.getByText('₹247')).toBeDefined()

    const submitBtn = screen.getByRole('button', { name: /CONFIRM & PLACE ORDER/i })
    expect(submitBtn).not.toHaveProperty('disabled', true)

    fireEvent.click(submitBtn)
    expect(onPlace).toHaveBeenCalledTimes(1)
  })
})
