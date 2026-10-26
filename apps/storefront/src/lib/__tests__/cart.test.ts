import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  indianAddressSchema,
  indianPincodeSchema,
  indianPhoneSchema,
  type IndianAddressInput,
} from '@glorov/types'
import {
  getCart,
  createCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  getCartShippingOptions,
  selectShippingMethod,
  updateCartCustomerAndAddress,
  completeCartCheckout,
  type StoreCart,
  type StoreShippingOption,
  type StoreOrder,
} from '../cart'
import { medusaClient } from '../medusa-client'
import { formatINR } from '../utils'
import { FREE_SHIPPING_THRESHOLD_INR } from '../constants'

vi.mock('../medusa-client', () => ({
  medusaClient: {
    store: {
      cart: {
        retrieve: vi.fn(),
        create: vi.fn(),
        createLineItem: vi.fn(),
        updateLineItem: vi.fn(),
        deleteLineItem: vi.fn(),
        addShippingMethod: vi.fn(),
        update: vi.fn(),
        complete: vi.fn(),
      },
      fulfillment: {
        listCartOptions: vi.fn(),
      },
      payment: {
        initiatePaymentSession: vi.fn(),
      },
      order: {
        retrieve: vi.fn(),
      },
    },
  },
}))

describe('Storefront Cart & Checkout System Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Indian Address & Contact Validation (Zod Schemas)', () => {
    it('accepts valid 6-digit Indian PIN codes across metros and tier-2/3 cities', () => {
      const validPins = ['411001', '560001', '110001', '400001', '600001', '700001', '380001']
      for (const pin of validPins) {
        const result = indianPincodeSchema.safeParse(pin)
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid Indian PIN codes (starts with 0, letters, wrong length)', () => {
      const invalidPins = [
        '012345', // Starts with 0
        '41100', // 5 digits
        '4110001', // 7 digits
        '41100A', // Alphanumeric
        '', // Empty
        '   ', // Whitespace
      ]
      for (const pin of invalidPins) {
        const result = indianPincodeSchema.safeParse(pin)
        expect(result.success).toBe(false)
      }
    })

    it('accepts valid 10-digit Indian cellular phone numbers (prefixes 6, 7, 8, 9)', () => {
      const validPhones = ['9876543210', '8765432109', '7654321098', '6543210987']
      for (const phone of validPhones) {
        const result = indianPhoneSchema.safeParse(phone)
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid Indian mobile numbers (prefixes 1-5, wrong length, non-digits)', () => {
      const invalidPhones = [
        '5123456789', // Invalid prefix 5
        '1234567890', // Invalid prefix 1
        '987654321', // 9 digits
        '98765432100', // 11 digits
        '987654321a', // Alphanumeric
      ]
      for (const phone of invalidPhones) {
        const result = indianPhoneSchema.safeParse(phone)
        expect(result.success).toBe(false)
      }
    })

    it('validates a complete authentic Indian delivery address', () => {
      const validAddress: IndianAddressInput = {
        first_name: 'Priya',
        last_name: 'Sharma',
        address_1: 'Flat 402, Green Meadows',
        address_2: 'Near Botanical Garden, Baner',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411045',
        phone: '9876543210',
        country_code: 'in',
      }
      const result = indianAddressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    it('fails address validation when required fields are missing or too short', () => {
      const incompleteAddress = {
        first_name: '',
        last_name: 'Sharma',
        address_1: 'No', // Too short (< 5 chars)
        city: '',
        province: '',
        postal_code: '011001', // Invalid PIN
        phone: '123', // Invalid phone
        country_code: 'in',
      }
      const result = indianAddressSchema.safeParse(incompleteAddress)
      expect(result.success).toBe(false)
    })
  })

  describe('2. Currency Formatting & Pricing Math', () => {
    it('formats Indian rupee amounts correctly with paise precision', () => {
      expect(formatINR(4900)).toBe('₹49')
      expect(formatINR(9900)).toBe('₹99')
      expect(formatINR(17900)).toBe('₹179')
      expect(formatINR(0)).toBe('₹0')
    })

    it('evaluates free shipping threshold correctly against ₹499 benchmark', () => {
      expect(FREE_SHIPPING_THRESHOLD_INR).toBe(499)
      const belowSubtotalINR = 350
      const atSubtotalINR = 499
      const aboveSubtotalINR = 650

      expect(belowSubtotalINR >= FREE_SHIPPING_THRESHOLD_INR).toBe(false)
      expect(atSubtotalINR >= FREE_SHIPPING_THRESHOLD_INR).toBe(true)
      expect(aboveSubtotalINR >= FREE_SHIPPING_THRESHOLD_INR).toBe(true)
    })
  })

  describe('3. Storefront Cart Client API (cart.ts)', () => {
    it('getCart retrieves cart successfully', async () => {
      const mockCart = { id: 'cart_123', total: 4900, items: [] }
      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const res = await getCart('cart_123')
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('cart_123')
      expect(medusaClient.store.cart.retrieve).toHaveBeenCalledWith(
        'cart_123',
        expect.objectContaining({ fields: expect.any(String) })
      )
    })

    it('getCart handles network error gracefully', async () => {
      vi.mocked(medusaClient.store.cart.retrieve).mockRejectedValueOnce(
        new Error('Network error')
      )

      const res = await getCart('cart_123')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Network error')
    })

    it('createCart initiates a cart for Indian sales channel', async () => {
      const mockCart = { id: 'cart_new', currency_code: 'inr' }
      vi.mocked(medusaClient.store.cart.create).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const res = await createCart()
      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('cart_new')
      expect(medusaClient.store.cart.create).toHaveBeenCalledWith({})
    })

    it('addLineItem rejects quantity < 1 before calling Medusa client', async () => {
      const res = await addLineItem('cart_123', 'variant_123', 0)
      expect(res.success).toBe(false)
      expect(res.error).toContain('at least 1')
      expect(medusaClient.store.cart.createLineItem).not.toHaveBeenCalled()
    })

    it('addLineItem sends variant and quantity to Medusa Store API', async () => {
      const mockCart = { id: 'cart_123', items: [{ variant_id: 'var_tomato_20', quantity: 2 }] }
      vi.mocked(medusaClient.store.cart.createLineItem).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const res = await addLineItem('cart_123', 'var_tomato_20', 2)
      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.createLineItem).toHaveBeenCalledWith('cart_123', {
        variant_id: 'var_tomato_20',
        quantity: 2,
      })
    })

    it('updateLineItem calls deleteLineItem if quantity <= 0', async () => {
      const mockParent = { id: 'cart_123', items: [] }
      vi.mocked(medusaClient.store.cart.deleteLineItem).mockResolvedValueOnce({
        id: 'line_123',
        object: 'line-item',
        deleted: true,
        parent: mockParent as unknown as StoreCart,
      })

      const res = await updateLineItem('cart_123', 'line_123', 0)
      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.deleteLineItem).toHaveBeenCalledWith('cart_123', 'line_123')
      expect(medusaClient.store.cart.updateLineItem).not.toHaveBeenCalled()
    })

    it('updateLineItem updates quantity when > 0', async () => {
      const mockCart = { id: 'cart_123', items: [{ id: 'line_123', quantity: 3 }] }
      vi.mocked(medusaClient.store.cart.updateLineItem).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const res = await updateLineItem('cart_123', 'line_123', 3)
      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.updateLineItem).toHaveBeenCalledWith(
        'cart_123',
        'line_123',
        { quantity: 3 }
      )
    })

    it('removeLineItem delegates to medusaClient deleteLineItem', async () => {
      const mockParent = { id: 'cart_123', items: [] }
      vi.mocked(medusaClient.store.cart.deleteLineItem).mockResolvedValueOnce({
        id: 'line_123',
        object: 'line-item',
        deleted: true,
        parent: mockParent as unknown as StoreCart,
      })

      const res = await removeLineItem('cart_123', 'line_123')
      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.deleteLineItem).toHaveBeenCalledWith('cart_123', 'line_123')
    })

    it('getCartShippingOptions retrieves shipping options for cart', async () => {
      const mockOptions = [
        { id: 'so_std', name: 'Standard Delivery (India)', amount: 4900 },
        { id: 'so_exp', name: 'Express Botanical Delivery (Air)', amount: 9900 },
      ]
      vi.mocked(medusaClient.store.fulfillment.listCartOptions).mockResolvedValueOnce({
        shipping_options: mockOptions as unknown as StoreShippingOption[],
      })

      const res = await getCartShippingOptions('cart_123')
      expect(res.success).toBe(true)
      expect(res.options).toHaveLength(2)
      expect(res.options[0].name).toBe('Standard Delivery (India)')
    })

    it('selectShippingMethod adds selected option to cart', async () => {
      const mockCart = { id: 'cart_123', shipping_methods: [{ shipping_option_id: 'so_std' }] }
      vi.mocked(medusaClient.store.cart.addShippingMethod).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const res = await selectShippingMethod('cart_123', 'so_std')
      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.addShippingMethod).toHaveBeenCalledWith('cart_123', {
        option_id: 'so_std',
      })
    })

    it('updateCartCustomerAndAddress formats and sends normalized Indian address payload', async () => {
      const mockCart = { id: 'cart_123', email: 'priya@glorov.in' }
      vi.mocked(medusaClient.store.cart.update).mockResolvedValueOnce({
        cart: mockCart as unknown as StoreCart,
      })

      const addressInput: IndianAddressInput = {
        first_name: 'Priya',
        last_name: 'Nair',
        address_1: '12 Gardenia Avenue',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411001',
        phone: '9876543210',
        country_code: 'in',
      }

      const res = await updateCartCustomerAndAddress('cart_123', {
        email: 'Priya@Glorov.in',
        shippingAddress: addressInput,
      })

      expect(res.success).toBe(true)
      expect(medusaClient.store.cart.update).toHaveBeenCalledWith('cart_123', {
        email: 'priya@glorov.in',
        shipping_address: expect.objectContaining({
          first_name: 'Priya',
          last_name: 'Nair',
          city: 'Pune',
          postal_code: '411001',
          country_code: 'in',
        }),
        billing_address: expect.objectContaining({
          first_name: 'Priya',
          postal_code: '411001',
          country_code: 'in',
        }),
      })
    })
  })

  describe('4. Checkout Completion Workflow Boundaries (completeCartCheckout)', () => {
    it('fails checkout cleanly when cart is empty', async () => {
      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: { id: 'cart_empty', items: [] } as unknown as StoreCart,
      })

      const res = await completeCartCheckout('cart_empty')
      expect(res.success).toBe(false)
      expect(res.error).toContain('empty')
      expect(medusaClient.store.cart.complete).not.toHaveBeenCalled()
    })

    it('fails checkout cleanly when shipping address is missing', async () => {
      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: {
          id: 'cart_no_addr',
          items: [{ id: 'item_1' }],
          shipping_address: null,
        } as unknown as StoreCart,
      })

      const res = await completeCartCheckout('cart_no_addr')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Shipping address is required')
      expect(medusaClient.store.cart.complete).not.toHaveBeenCalled()
    })

    it('fails checkout cleanly when shipping method is not selected', async () => {
      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: {
          id: 'cart_no_sm',
          items: [{ id: 'item_1' }],
          shipping_address: { address_1: '123 Main' },
          shipping_methods: [],
        } as unknown as StoreCart,
      })

      const res = await completeCartCheckout('cart_no_sm')
      expect(res.success).toBe(false)
      expect(res.error).toContain('shipping method')
      expect(medusaClient.store.cart.complete).not.toHaveBeenCalled()
    })

    it('initiates payment session and completes order successfully', async () => {
      const validCart = {
        id: 'cart_ready',
        items: [{ id: 'item_1', unit_price: 4900, quantity: 1 }],
        shipping_address: { address_1: '123 Main', postal_code: '411001' },
        shipping_methods: [{ id: 'sm_1', amount: 4900 }],
        payment_collection: null,
      }

      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: validCart as unknown as StoreCart,
      })
      vi.mocked(medusaClient.store.payment.initiatePaymentSession).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof medusaClient.store.payment.initiatePaymentSession>>
      )
      vi.mocked(medusaClient.store.cart.complete).mockResolvedValueOnce({
        type: 'order',
        order: {
          id: 'order_123',
          display_id: 1,
          total: 9800,
          currency_code: 'inr',
        } as unknown as StoreOrder,
      })

      const res = await completeCartCheckout('cart_ready', 'pp_system_default')
      expect(res.success).toBe(true)
      expect(res.type).toBe('order')
      expect(res.order?.id).toBe('order_123')
      expect(medusaClient.store.payment.initiatePaymentSession).toHaveBeenCalledWith(
        validCart,
        { provider_id: 'pp_system_default' }
      )
      expect(medusaClient.store.cart.complete).toHaveBeenCalledWith('cart_ready')
    })

    it('returns order idempotently without re-initiating payment when cart is already completed', async () => {
      const alreadyCompletedCart = {
        id: 'cart_done',
        completed_at: '2026-10-26T00:00:00.000Z',
        items: [{ id: 'item_1', unit_price: 4900, quantity: 1 }],
      }

      vi.mocked(medusaClient.store.cart.retrieve).mockResolvedValueOnce({
        cart: alreadyCompletedCart as unknown as StoreCart,
      })
      vi.mocked(medusaClient.store.cart.complete).mockResolvedValueOnce({
        type: 'order',
        order: {
          id: 'order_existing',
          display_id: 42,
          total: 4900,
        } as unknown as StoreOrder,
      })

      const res = await completeCartCheckout('cart_done', 'pp_system_default')
      expect(res.success).toBe(true)
      expect(res.type).toBe('order')
      expect(res.order?.id).toBe('order_existing')
      // Must NOT re-initiate payment session on already completed cart
      expect(medusaClient.store.payment.initiatePaymentSession).not.toHaveBeenCalled()
      expect(medusaClient.store.cart.complete).toHaveBeenCalledWith('cart_done')
    })
  })

  describe('5. Indian Phone Sanitization & Dynamic Breakdown Math', () => {
    it('sanitizes mobile numbers with spaces, hyphens, and +91 prefix to standard 10-digit format', () => {
      const inputs = [
        '+91 98765 43210',
        '+91-98765-43210',
        '09876543210',
        '9876543210',
      ]
      for (const raw of inputs) {
        const cleaned = raw.replace(/\D/g, '').slice(-10)
        expect(cleaned).toBe('9876543210')
        expect(indianPhoneSchema.safeParse(cleaned).success).toBe(true)
      }
    })

    it('calculates grand total accurately with item subtotal, discounts, shipping, and taxes', () => {
      const subtotal = 9800 // ₹98
      const discount = 2000 // ₹20 discount
      const shipping = 4900 // ₹49 shipping
      const tax = 0 // ₹0 seed tax
      const expectedTotal = subtotal - discount + shipping + tax
      expect(expectedTotal).toBe(12700)
      expect(formatINR(expectedTotal)).toBe('₹127')
    })
  })
})
