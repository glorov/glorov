import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createMedusaCart,
  setMedusaShippingMethod,
  initMedusaPaymentSession,
  completeMedusaCart,
  verifyRazorpayPayment,
  fetchMedusaOrder,
  transformMedusaOrderToReceipt,
  isCodAmountEligible,
} from '../../src/lib/api/checkout'
import type { CartItem } from '../../src/types/cart'
import type { DeliveryAddress } from '../../src/types/checkout'

describe('Medusa v2 Checkout Flow Client (lib/api/checkout.ts)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const mockCartItem: CartItem = {
    id: 'item_1',
    productId: 'prod_monstera',
    variantId: 'variant_monstera_std',
    title: 'Monstera Deliciosa',
    variantName: '6-inch Nursery Pot',
    price: 148,
    originalPrice: 199,
    quantity: 1,
    image: 'https://cdn.glorov.com/monstera.png',
  }

  const mockDeliveryAddress: DeliveryAddress = {
    fullName: 'Priya Nair',
    phoneNumber: '9876543210',
    email: 'priya@example.com',
    addressLine1: 'Flat 402, Green Meadows',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    countryCode: 'in',
  }

  it('createMedusaCart creates a cart, adds line items, and updates delivery address', async () => {
    global.fetch = vi.fn()
      // 1. POST /store/carts
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart_01JMEDUSA123456789' } }),
      })
      // 2. POST /store/carts/:id/line-items
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      // 3. POST /store/carts/:id (address update)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart_01JMEDUSA123456789' } }),
      })

    const cart = await createMedusaCart({
      items: [mockCartItem],
      address: mockDeliveryAddress,
    })

    expect(cart.id).toBe('cart_01JMEDUSA123456789')
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('createMedusaCart reuses existing active cart with items and skips redundant line-item creation', async () => {
    global.fetch = vi.fn()
      // 1. GET /store/carts/:id (check existing cart)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart_existing_123',
            items: [{ variant_id: 'variant_monstera_std', quantity: 1 }],
          },
        }),
      })
      // 2. POST /store/carts/:id (address update directly)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart_existing_123' } }),
      })

    const cart = await createMedusaCart({
      items: [mockCartItem],
      address: mockDeliveryAddress,
      existingCartId: 'cart_existing_123',
    })

    expect(cart.id).toBe('cart_existing_123')
    // Skips POST /store/carts and POST line-items! Only 2 calls: GET existing cart + POST address update
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('setMedusaShippingMethod discovers shipping options and calls POST /store/carts/:id/shipping-methods', async () => {
    global.fetch = vi.fn()
      // 1. GET /store/shipping-options?cart_id=...
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          shipping_options: [
            { id: 'so_express', name: 'Express Climate-Controlled Delivery' },
            { id: 'so_standard', name: 'Standard Botanical Delivery' },
          ],
        }),
      })
      // 2. POST /store/carts/:id/shipping-methods
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: { id: 'cart_01JMEDUSA123456789' },
        }),
      })

    const result = (await setMedusaShippingMethod('cart_01JMEDUSA123456789', true)) as any
    expect(result.cart.id).toBe('cart_01JMEDUSA123456789')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/store/carts/cart_01JMEDUSA123456789/shipping-methods'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ option_id: 'so_express' }),
      })
    )
  })

  it('initMedusaPaymentSession creates payment-collection then payment-session', async () => {
    const mockPaymentCollection = {
      id: 'pay_col_01JMEDUSA001',
      cart_id: 'cart_01JMEDUSA123456789',
      payment_sessions: [],
    }

    const mockSession = {
      id: 'ps_01JMEDUSA_RZP',
      provider_id: 'pp_razorpay_razorpay',
      amount: 14800,
      currency_code: 'inr',
      data: {
        razorpay_order_id: 'order_RZP123456789',
        amount: 14800,
        currency: 'INR',
      },
    }

    global.fetch = vi.fn()
      // First call: POST /store/payment-collections
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payment_collection: mockPaymentCollection }),
      })
      // Second call: POST /store/payment-collections/:id/payment-sessions
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payment_collection: {
            ...mockPaymentCollection,
            payment_sessions: [mockSession],
          },
        }),
      })

    const result = await initMedusaPaymentSession(
      'cart_01JMEDUSA123456789',
      'pp_razorpay_razorpay'
    )

    expect(result.paymentCollectionId).toBe('pay_col_01JMEDUSA001')
    expect(result.session.id).toBe('ps_01JMEDUSA_RZP')
    expect(result.razorpayOrderId).toBe('order_RZP123456789')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('completeMedusaCart calls POST /store/carts/:id/complete and returns real order', async () => {
    const mockCompletedOrder = {
      id: 'order_01JMEDUSA_REAL_ORDER',
      display_id: 1042,
      status: 'pending',
      fulfillment_status: 'not_fulfilled',
      payment_status: 'captured',
      currency_code: 'inr',
      total: 14800,
      subtotal: 14800,
      shipping_total: 0,
      discount_total: 0,
      tax_total: 0,
      email: 'priya@example.com',
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'item_1',
          title: 'Monstera Deliciosa',
          variant_title: '6-inch Nursery Pot',
          quantity: 1,
          unit_price: 14800,
          thumbnail: 'https://cdn.glorov.com/monstera.png',
        },
      ],
      shipping_address: {
        first_name: 'Priya',
        last_name: 'Nair',
        address_1: 'Flat 402, Green Meadows',
        city: 'Bengaluru',
        province: 'Karnataka',
        postal_code: '560001',
        phone: '9876543210',
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'order',
        order: mockCompletedOrder,
      }),
    })

    const result = await completeMedusaCart('cart_01JMEDUSA123456789')
    expect(result.type).toBe('order')
    expect(result.order.id).toBe('order_01JMEDUSA_REAL_ORDER')
    expect(result.order.display_id).toBe(1042)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/store/carts/cart_01JMEDUSA123456789/complete'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('verifyRazorpayPayment sends signature and IDs to backend', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        verified: true,
        razorpay_payment_id: 'pay_RZP_SUCCESS_99',
      }),
    })

    const res = await verifyRazorpayPayment({
      razorpay_order_id: 'order_RZP123',
      razorpay_payment_id: 'pay_RZP_SUCCESS_99',
      razorpay_signature: 'abc123mocksignature',
      cart_id: 'cart_01JMEDUSA123456789',
    })

    expect(res.verified).toBe(true)
    expect(res.razorpay_payment_id).toBe('pay_RZP_SUCCESS_99')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/store/payment/razorpay/verify'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_RZP123',
          razorpay_payment_id: 'pay_RZP_SUCCESS_99',
          razorpay_signature: 'abc123mocksignature',
          cart_id: 'cart_01JMEDUSA123456789',
        }),
      })
    )
  })

  it('fetchMedusaOrder retrieves authoritative order details and returns PlacedOrderReceipt', async () => {
    const mockOrder = {
      id: 'order_01JREAL_ORDER',
      display_id: 1045,
      status: 'pending',
      currency_code: 'inr',
      total: 25000,
      subtotal: 25000,
      shipping_total: 0,
      discount_total: 0,
      tax_total: 0,
      created_at: '2026-11-06T00:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ order: mockOrder }),
    })

    const receipt = await fetchMedusaOrder('order_01JREAL_ORDER', 'fake-jwt-token')
    expect(receipt).not.toBeNull()
    expect(receipt?.id).toBe('order_01JREAL_ORDER')
    expect(receipt?.displayId).toBe('GLR-1045')
    expect(receipt?.totalAmount).toBe(250)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/store/orders/order_01JREAL_ORDER'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-jwt-token',
        }),
      })
    )
  })

  it('transformMedusaOrderToReceipt properly converts amounts from paise to rupees and preserves Medusa IDs', () => {
    const rawOrder = {
      id: 'order_01JMEDUSA_REAL_ORDER',
      display_id: 1088,
      status: 'completed',
      fulfillment_status: 'shipped',
      payment_status: 'captured',
      currency_code: 'inr',
      total: 19900, // ₹199.00
      subtotal: 14900,
      shipping_total: 5000,
      discount_total: 0,
      tax_total: 0,
      email: 'customer@example.com',
      created_at: '2026-11-06T07:00:00Z',
      items: [
        {
          id: 'item_1',
          title: 'Fiddle Leaf Fig',
          variant_title: 'Standard',
          quantity: 1,
          unit_price: 14900,
          thumbnail: 'https://cdn.glorov.com/fig.png',
        },
      ],
      shipping_address: {
        first_name: 'Ananya',
        last_name: 'Deshmukh',
        address_1: 'Plot 12, Baner Road',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411045',
        phone: '9822000000',
      },
    }

    const receipt = transformMedusaOrderToReceipt(rawOrder, {
      paymentMethodTitle: 'Razorpay Online (UPI, Cards & NetBanking)',
    })
    expect(receipt.id).toBe('order_01JMEDUSA_REAL_ORDER')
    expect(receipt.displayId).toBe('GLR-1088')
    expect(receipt.totalAmount).toBe(199)
    expect(receipt.subtotal).toBe(149)
    expect(receipt.shippingAmount).toBe(50)
    expect(receipt.paymentMethodTitle).toBe('Razorpay Online (UPI, Cards & NetBanking)')
    expect(receipt.shippingAddress.fullName).toBe('Ananya Deshmukh')
    expect(receipt.shippingAddress.pincode).toBe('411045')
    expect(receipt.items).toHaveLength(1)
    expect(receipt.items[0].price).toBe(149)
    // Verify no fake random IDs are generated
    expect(receipt.id).not.toMatch(/^ord_\d+$/)
    expect(receipt.displayId).not.toMatch(/^GLR-[A-Z0-9]{6}$/)
  })

  it('validates Cash on Delivery threshold eligibility in paise and rupees (GLOROV-COD-001)', () => {
    // ₹4,999 order (499,900 paise) -> Allowed
    expect(isCodAmountEligible(499900, 'paise')).toBe(true)
    expect(isCodAmountEligible(4999, 'rupees')).toBe(true)

    // ₹5,000 order (500,000 paise) -> Allowed (Exact Boundary)
    expect(isCodAmountEligible(500000, 'paise')).toBe(true)
    expect(isCodAmountEligible(5000, 'rupees')).toBe(true)

    // ₹5,001 order (500,100 paise) -> Rejected (Exceeds limit)
    expect(isCodAmountEligible(500100, 'paise')).toBe(false)
    expect(isCodAmountEligible(5001, 'rupees')).toBe(false)

    // Non-positive amounts -> Rejected
    expect(isCodAmountEligible(0, 'paise')).toBe(false)
    expect(isCodAmountEligible(-100, 'paise')).toBe(false)
  })
})
