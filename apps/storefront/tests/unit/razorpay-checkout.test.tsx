import React from 'react'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useRazorpay,
  extractRazorpayOrderId,
  convertToPaise,
  loadRazorpayScript,
} from '../../src/lib/hooks/useRazorpay'
import {
  RazorpayPaymentErrorAlert,
  RazorpayProcessingOverlay,
} from '../../src/components/checkout/RazorpayPaymentModal'
import { PaymentMethodSelector } from '../../src/components/checkout/PaymentMethodSelector'

describe('Razorpay Checkout Utilities', () => {
  describe('extractRazorpayOrderId', () => {
    it('extracts order ID from direct string starting with order_', () => {
      expect(extractRazorpayOrderId('order_01J9XYZ123456')).toBe('order_01J9XYZ123456')
      expect(extractRazorpayOrderId('  order_spaced_123  ')).toBe('order_spaced_123')
      expect(extractRazorpayOrderId('cart_12345')).toBeNull()
      expect(extractRazorpayOrderId('')).toBeNull()
      expect(extractRazorpayOrderId(null)).toBeNull()
      expect(extractRazorpayOrderId(undefined)).toBeNull()
    })

    it('extracts razorpay_order_id from direct property', () => {
      expect(extractRazorpayOrderId({ razorpay_order_id: 'order_direct_999' })).toBe(
        'order_direct_999'
      )
    })

    it('extracts razorpay_order_id nested under data property', () => {
      const session = {
        id: 'ps_123',
        data: {
          razorpay_order_id: 'order_nested_in_data',
          amount: 29900,
          currency: 'INR',
        },
      }
      expect(extractRazorpayOrderId(session)).toBe('order_nested_in_data')
    })

    it('extracts from payment_collection payment_sessions array', () => {
      const pc = {
        id: 'pay_col_123',
        payment_sessions: [
          {
            id: 'ps_cod',
            provider_id: 'pp_cod_cod',
          },
          {
            id: 'ps_rzp',
            provider_id: 'pp_razorpay_razorpay',
            data: {
              razorpay_order_id: 'order_from_collection_array',
            },
          },
        ],
      }
      expect(extractRazorpayOrderId(pc)).toBe('order_from_collection_array')
    })

    it('extracts from order_id or id properties with order_ prefix', () => {
      expect(extractRazorpayOrderId({ order_id: 'order_field_abc' })).toBe('order_field_abc')
      expect(extractRazorpayOrderId({ id: 'order_id_field_xyz' })).toBe('order_id_field_xyz')
      expect(extractRazorpayOrderId({ id: 'cart_not_an_order' })).toBeNull()
    })
  })

  describe('convertToPaise', () => {
    it('converts Rupee amounts to minor units (paise)', () => {
      expect(convertToPaise(100)).toBe(10000)
      expect(convertToPaise(499)).toBe(49900)
      expect(convertToPaise(49.5)).toBe(4950)
      expect(convertToPaise(0.99)).toBe(99)
    })

    it('returns 0 for negative, zero, or invalid amounts', () => {
      expect(convertToPaise(0)).toBe(0)
      expect(convertToPaise(-100)).toBe(0)
      expect(convertToPaise(NaN)).toBe(0)
    })
  })

  describe('loadRazorpayScript', () => {
    it('resolves immediately if window.Razorpay already exists', async () => {
      const originalRazorpay = window.Razorpay
      ;(window as any).Razorpay = vi.fn()

      const loaded = await loadRazorpayScript()
      expect(loaded).toBe(true)

      window.Razorpay = originalRazorpay
    })
  })
})

describe('useRazorpay Hook', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let mockRazorpayInstance: any
  let mockRazorpayConstructor: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch as any

    mockRazorpayInstance = {
      open: vi.fn(),
      close: vi.fn(),
      on: vi.fn(),
    }

    mockRazorpayConstructor = vi.fn().mockImplementation(() => mockRazorpayInstance)
    ;(window as any).Razorpay = mockRazorpayConstructor
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (window as any).Razorpay
  })

  it('initializes with default states', () => {
    const { result } = renderHook(() => useRazorpay())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.paymentFailed).toBeNull()
    expect(result.current.isCancelled).toBe(false)
  })

  it('rejects checkout when razorpay_order_id is missing', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onFailure = vi.fn()

    let success: boolean = true
    await act(async () => {
      success = await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { invalid: 'no order id' },
        amount: 500,
        onFailure,
      })
    })

    expect(success).toBe(false)
    expect(result.current.error).toMatch(/Missing razorpay_order_id/i)
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'MISSING_ORDER_ID',
      })
    )
  })

  it('rejects checkout when amount is <= 0', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onFailure = vi.fn()

    let success: boolean = true
    await act(async () => {
      success = await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_test_123' },
        amount: 0,
        onFailure,
      })
    })

    expect(success).toBe(false)
    expect(result.current.error).toMatch(/amount must be greater than zero/i)
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INVALID_AMOUNT',
      })
    )
  })

  it('constructs Razorpay options with correct key, amount, currency, and opens modal', async () => {
    const { result } = renderHook(() => useRazorpay())

    await act(async () => {
      await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_valid_123' },
        amount: 499,
        currency: 'INR',
        customer: {
          name: 'Priya Sharma',
          email: 'priya@example.in',
          contact: '9876543210',
        },
      })
    })

    expect(mockRazorpayConstructor).toHaveBeenCalledTimes(1)
    const passedOptions = mockRazorpayConstructor.mock.calls[0][0]

    expect(passedOptions.amount).toBe(49900) // ₹499 in paise
    expect(passedOptions.currency).toBe('INR')
    expect(passedOptions.name).toBe('GLOROV')
    expect(passedOptions.order_id).toBe('order_valid_123')
    expect(passedOptions.prefill).toEqual({
      name: 'Priya Sharma',
      email: 'priya@example.in',
      contact: '9876543210',
    })
    expect(passedOptions.theme.color).toBe('#0A4C36')
    expect(mockRazorpayInstance.open).toHaveBeenCalledTimes(1)
  })

  it('executes verification and cart completion on success callback', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onSuccess = vi.fn()

    // Mock verify success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        verified: true,
        cart_id: 'cart_test_123',
        razorpay_payment_id: 'pay_rzp_999',
      }),
    })

    // Mock cart complete success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'order',
        order: {
          id: 'ord_medusa_001',
          display_id: 1042,
          total: 49900,
        },
      }),
    })

    await act(async () => {
      await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_valid_123' },
        amount: 499,
        onSuccess,
      })
    })

    const passedOptions = mockRazorpayConstructor.mock.calls[0][0]

    // Simulate customer completing payment inside modal
    await act(async () => {
      await passedOptions.handler({
        razorpay_payment_id: 'pay_rzp_999',
        razorpay_order_id: 'order_valid_123',
        razorpay_signature: 'signature_valid_hmac',
      })
    })

    // Step 1: POST /store/payment/razorpay/verify
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/store/payment/razorpay/verify'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          cart_id: 'cart_test_123',
          razorpay_order_id: 'order_valid_123',
          razorpay_payment_id: 'pay_rzp_999',
          razorpay_signature: 'signature_valid_hmac',
        }),
      })
    )

    // Step 2: POST /store/carts/:id/complete
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/store/carts/cart_test_123/complete'),
      expect.objectContaining({
        method: 'POST',
      })
    )

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({ id: 'ord_medusa_001' }),
        verification: expect.objectContaining({ verified: true }),
      })
    )
    expect(result.current.isLoading).toBe(false)
  })

  it('handles verification failure safely and allows retry', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onFailure = vi.fn()

    // Mock verify failure (400 Invalid signature)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      }),
    })

    await act(async () => {
      await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_valid_123' },
        amount: 499,
        onFailure,
      })
    })

    const passedOptions = mockRazorpayConstructor.mock.calls[0][0]

    await act(async () => {
      await passedOptions.handler({
        razorpay_payment_id: 'pay_forged_123',
        razorpay_order_id: 'order_valid_123',
        razorpay_signature: 'invalid_sig',
      })
    })

    expect(result.current.error).toBe('Invalid payment signature. Verification failed.')
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VERIFICATION_FAILED',
        message: 'Invalid payment signature. Verification failed.',
      })
    )
    // Cart completion must NOT be called if verification fails
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('handles modal closure (user cancelled) cleanly', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onDismiss = vi.fn()
    const onFailure = vi.fn()

    await act(async () => {
      await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_valid_123' },
        amount: 499,
        onDismiss,
        onFailure,
      })
    })

    const passedOptions = mockRazorpayConstructor.mock.calls[0][0]

    // Simulate user closing the Razorpay modal
    act(() => {
      passedOptions.modal.ondismiss()
    })

    expect(result.current.isCancelled).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'PAYMENT_CANCELLED',
      })
    )
  })

  it('handles payment.failed event and updates failure state', async () => {
    const { result } = renderHook(() => useRazorpay())
    const onPaymentFailed = vi.fn()
    const onFailure = vi.fn()

    await act(async () => {
      await result.current.openRazorpayCheckout({
        cartId: 'cart_test_123',
        sessionData: { razorpay_order_id: 'order_valid_123' },
        amount: 499,
        onPaymentFailed,
        onFailure,
      })
    })

    // Capture the registered event listener for 'payment.failed'
    expect(mockRazorpayInstance.on).toHaveBeenCalledWith('payment.failed', expect.any(Function))
    const paymentFailedCallback = mockRazorpayInstance.on.mock.calls.find(
      (c: any) => c[0] === 'payment.failed'
    )[1]

    act(() => {
      paymentFailedCallback({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Payment was declined due to bank network timeout.',
          source: 'gateway',
          step: 'payment_authorization',
          reason: 'payment_failed',
          metadata: {
            order_id: 'order_valid_123',
            payment_id: 'pay_failed_001',
          },
        },
      })
    })

    expect(result.current.paymentFailed).toEqual(
      expect.objectContaining({
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment was declined due to bank network timeout.',
      })
    )
    expect(result.current.error).toBe('Payment was declined due to bank network timeout.')
    expect(onPaymentFailed).toHaveBeenCalledTimes(1)
    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BAD_REQUEST_ERROR',
      })
    )
  })

  it('handles webhook-triggered payment.failed UI update', () => {
    const { result } = renderHook(() => useRazorpay())

    act(() => {
      result.current.handlePaymentFailedWebhookUpdate({
        order_id: 'order_webhook_001',
        error_code: 'GATEWAY_DECLINED',
        error_description: 'Issuer bank declined transaction.',
      })
    })

    expect(result.current.paymentFailed).toEqual(
      expect.objectContaining({
        code: 'GATEWAY_DECLINED',
        description: 'Issuer bank declined transaction.',
        source: 'webhook',
      })
    )
    expect(result.current.error).toBe('Issuer bank declined transaction.')
  })

  it('resets state when resetState is called', () => {
    const { result } = renderHook(() => useRazorpay())

    act(() => {
      result.current.handlePaymentFailedWebhookUpdate({
        error_code: 'ERROR_1',
        error_description: 'Test failure',
      })
    })

    expect(result.current.error).toBe('Test failure')

    act(() => {
      result.current.resetState()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.paymentFailed).toBeNull()
    expect(result.current.isCancelled).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('createPaymentSession calls Medusa payment-collections and payment-sessions', async () => {
    const { result } = renderHook(() => useRazorpay())

    // 1. Payment collections response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment_collection: { id: 'pay_col_abc_123', amount: 49900 },
      }),
    })

    // 2. Payment session response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment_collection: {
          id: 'pay_col_abc_123',
          payment_sessions: [
            {
              id: 'ps_rzp_1',
              provider_id: 'pp_razorpay_razorpay',
              data: {
                razorpay_order_id: 'order_from_medusa_ps_1',
                amount: 49900,
                currency: 'INR',
              },
            },
          ],
        },
      }),
    })

    let sessionResult: any
    await act(async () => {
      sessionResult = await result.current.createPaymentSession('cart_target_999')
    })

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/store/payment-collections'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ cart_id: 'cart_target_999' }),
      })
    )

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/store/payment-collections/pay_col_abc_123/payment-sessions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ provider_id: 'pp_razorpay_razorpay' }),
      })
    )

    expect(sessionResult.paymentCollectionId).toBe('pay_col_abc_123')
    expect(sessionResult.razorpayOrderId).toBe('order_from_medusa_ps_1')
  })
})

describe('Razorpay UI Components', () => {
  it('renders RazorpayPaymentErrorAlert on payment failure with retry CTA', () => {
    const onRetry = vi.fn()
    const onSwitchToCod = vi.fn()

    render(
      <RazorpayPaymentErrorAlert
        error="Bank server timed out."
        paymentFailed={{
          code: 'BANK_TIMEOUT',
          description: 'Payment failed due to bank timeout.',
        }}
        onRetry={onRetry}
        onSwitchToCod={onSwitchToCod}
        canSwitchToCod={true}
      />
    )

    expect(screen.getByText('Payment Failed (BANK_TIMEOUT)')).toBeDefined()
    expect(screen.getByText('Payment failed due to bank timeout.')).toBeDefined()

    const retryBtn = screen.getByRole('button', { name: /Retry Online Payment/i })
    fireEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalledTimes(1)

    const codBtn = screen.getByRole('button', { name: /Switch to Cash on Delivery/i })
    fireEvent.click(codBtn)
    expect(onSwitchToCod).toHaveBeenCalledTimes(1)
  })

  it('renders RazorpayPaymentErrorAlert on modal cancellation', () => {
    const onRetry = vi.fn()

    render(
      <RazorpayPaymentErrorAlert
        error={null}
        paymentFailed={null}
        isCancelled={true}
        onRetry={onRetry}
      />
    )

    expect(screen.getByText('Payment Cancelled')).toBeDefined()
    expect(
      screen.getByText(/You closed the payment modal before completing the transaction/i)
    ).toBeDefined()
  })

  it('renders RazorpayProcessingOverlay when open', () => {
    const { rerender } = render(<RazorpayProcessingOverlay isOpen={false} />)
    expect(screen.queryByText(/Securing Botanical Order/i)).toBeNull()

    rerender(<RazorpayProcessingOverlay isOpen={true} />)
    expect(screen.getByText(/Securing Botanical Order/i)).toBeDefined()
    expect(screen.getByText(/Verifying payment with bank & finalizing your order.../i)).toBeDefined()
  })

  it('renders Razorpay in PaymentMethodSelector and allows selection', () => {
    const onSelect = vi.fn()
    render(<PaymentMethodSelector selectedMethod="cod" onSelectMethod={onSelect} />)

    expect(screen.getByText(/Razorpay Online \(UPI, Cards & NetBanking\)/i)).toBeDefined()

    fireEvent.click(screen.getByText(/Razorpay Online \(UPI, Cards & NetBanking\)/i))
    expect(onSelect).toHaveBeenCalledWith('razorpay')
  })
})
