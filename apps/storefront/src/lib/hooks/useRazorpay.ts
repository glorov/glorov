'use client'

import { useState, useCallback, useEffect } from 'react'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, RAZORPAY_KEY_ID } from '../constants'
import type {
  RazorpayOptions,
  RazorpayPaymentSuccessPayload,
  RazorpayPaymentFailedPayload,
  RazorpayPaymentFailureDetails,
  MedusaPaymentSession,
} from '../../types/razorpay'
import type { RazorpayVerificationResponse } from '../../types/checkout'
import type { MedusaRawOrder } from '../../types/account'

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/**
 * Loads the Razorpay checkout.js script asynchronously if not already loaded in the document.
 */
export function loadRazorpayScript(src = RAZORPAY_SCRIPT_SRC): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Robustly extracts the Razorpay Order ID from Medusa v2 payment session data structures.
 */
export function extractRazorpayOrderId(sessionData: unknown): string | null {
  if (!sessionData) return null

  // Direct order string (e.g. 'order_01J9...')
  if (typeof sessionData === 'string') {
    const trimmed = sessionData.trim()
    return trimmed.startsWith('order_') ? trimmed : null
  }

  if (typeof sessionData !== 'object' || sessionData === null) return null

  const record = sessionData as Record<string, unknown>

  // 1. Direct property: razorpay_order_id
  if (typeof record.razorpay_order_id === 'string' && record.razorpay_order_id.trim()) {
    return record.razorpay_order_id.trim()
  }

  const recordData = typeof record.data === 'object' && record.data !== null ? (record.data as Record<string, unknown>) : null
  const recordSession = typeof record.session === 'object' && record.session !== null ? (record.session as Record<string, unknown>) : null
  const sessionDataObj = recordSession && typeof recordSession.data === 'object' && recordSession.data !== null ? (recordSession.data as Record<string, unknown>) : null

  // 2. Nested under data.razorpay_order_id
  if (recordData && typeof recordData.razorpay_order_id === 'string') {
    return recordData.razorpay_order_id.trim()
  }

  // 3. Nested under session.data.razorpay_order_id
  if (sessionDataObj && typeof sessionDataObj.razorpay_order_id === 'string') {
    return sessionDataObj.razorpay_order_id.trim()
  }

  // 4. In payment_collection.payment_sessions array
  const paymentCollection = typeof record.payment_collection === 'object' && record.payment_collection !== null ? (record.payment_collection as Record<string, unknown>) : null
  const sessions =
    (paymentCollection?.payment_sessions as unknown[]) ||
    (record.payment_sessions as unknown[]) ||
    (Array.isArray(record) ? record : null)

  if (Array.isArray(sessions)) {
    const rzpSession = sessions.find((s: unknown) => {
      const sess = s as Record<string, unknown> | null
      const sessData = sess?.data as Record<string, unknown> | null
      return (
        sess?.provider_id === 'pp_razorpay_razorpay' ||
        sess?.provider_id === 'razorpay' ||
        sessData?.razorpay_order_id
      )
    }) as Record<string, unknown> | undefined

    const rzpData = rzpSession?.data as Record<string, unknown> | null
    if (rzpData?.razorpay_order_id) {
      return String(rzpData.razorpay_order_id).trim()
    }
  }

  // 5. In id or order_id property starting with 'order_'
  if (typeof record.order_id === 'string' && record.order_id.startsWith('order_')) {
    return record.order_id.trim()
  }
  if (typeof record.id === 'string' && record.id.startsWith('order_')) {
    return record.id.trim()
  }
  const recData = record.data as Record<string, unknown> | null | undefined
  if (recData && typeof recData.id === 'string' && recData.id.startsWith('order_')) {
    return recData.id.trim()
  }

  return null
}

/**
 * Converts a currency amount in INR to minor units (paise).
 * E.g., ₹299 -> 29900 paise.
 */
export function convertToPaise(amount: number): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 0
  }
  return Math.round(amount * 100)
}

export interface ResolveCartOptions {
  baseUrl?: string
  publishableKey?: string
}

/**
 * Creates and populates an active Medusa v2 cart with items, email, address, and shipping method.
 */
export async function resolveOrCreateMedusaCart(
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
  address: {
    fullName: string
    phoneNumber: string
    email: string
    addressLine1: string
    addressLine2?: string
    landmark?: string
    city: string
    state: string
    pincode: string
    countryCode?: string
  },
  shippingOptionId?: string,
  options?: ResolveCartOptions
): Promise<string> {
  const baseUrl = (
    options?.baseUrl ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    MEDUSA_BACKEND_URL
  ).replace(/\/$/, '')
  const publishableKey =
    options?.publishableKey ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    MEDUSA_PUBLISHABLE_KEY

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey
  }

  // Step 1: Create Medusa Cart
  const cartRes = await fetch(`${baseUrl}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ currency_code: 'inr' }),
  })

  if (!cartRes.ok) {
    const err = await cartRes.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to initialize shopping cart on backend.')
  }

  const { cart } = await cartRes.json()
  const cartId = cart.id

  // Step 2: Add Line Items
  for (const it of items) {
    await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        variant_id: it.variantId || it.productId,
        quantity: it.quantity,
      }),
    })
  }

  // Step 3: Attach Customer Email & Shipping Address
  const nameParts = (address.fullName || '').trim().split(' ')
  const firstName = nameParts[0] || 'Valued'
  const lastName = nameParts.slice(1).join(' ') || 'Customer'

  await fetch(`${baseUrl}/store/carts/${cartId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: address.email,
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address_1: address.addressLine1,
        address_2: address.addressLine2 || address.landmark || '',
        city: address.city,
        province: address.state,
        postal_code: address.pincode,
        country_code: address.countryCode || 'in',
        phone: address.phoneNumber,
      },
    }),
  })

  // Step 4: Attach Shipping Method
  if (shippingOptionId) {
    try {
      await fetch(`${baseUrl}/store/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ option_id: shippingOptionId }),
      })
    } catch {
      // Non-fatal if shipping options are auto-assigned
    }
  }

  return cartId
}

export interface RazorpayCustomerInfo {
  name?: string
  email?: string
  contact?: string
}

export interface OpenRazorpayCheckoutOptions {
  cartId: string
  sessionData: unknown
  amount: number // in INR (Rupees) or explicit amount
  amountInPaise?: number // optional explicit paise override
  currency?: string
  keyId?: string
  customer?: RazorpayCustomerInfo
  notes?: Record<string, string>
  backendUrl?: string
  publishableKey?: string
  onSuccess?: (payload: {
    order: MedusaRawOrder | Record<string, unknown>
    verification: RazorpayVerificationResponse
    paymentPayload: RazorpayPaymentSuccessPayload
  }) => void | Promise<void>
  onFailure?: (error: { message: string; code?: string; details?: unknown }) => void
  onDismiss?: () => void
  onPaymentFailed?: (error: RazorpayPaymentFailureDetails) => void
}

export interface UseRazorpayReturn {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  paymentFailed: RazorpayPaymentFailureDetails | null
  isCancelled: boolean
  openRazorpayCheckout: (options: OpenRazorpayCheckoutOptions) => Promise<boolean>
  createPaymentSession: (
    cartId: string,
    providerId?: string
  ) => Promise<{
    paymentCollectionId: string
    session: MedusaPaymentSession
    razorpayOrderId: string
  }>
  resolveOrCreateMedusaCart: (
    items: Array<{ productId: string; variantId?: string; quantity: number }>,
    address: {
      fullName: string
      phoneNumber: string
      email: string
      addressLine1: string
      addressLine2?: string
      landmark?: string
      city: string
      state: string
      pincode: string
      countryCode?: string
    },
    shippingOptionId?: string,
    options?: ResolveCartOptions
  ) => Promise<string>
  handlePaymentFailedWebhookUpdate: (payload: {
    order_id?: string
    error_code?: string
    error_description?: string
  }) => void
  resetState: () => void
}

/**
 * Custom React hook for integrating the Razorpay Web Checkout modal into the GLOROV Next.js storefront.
 */
export function useRazorpay(): UseRazorpayReturn {
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!window.Razorpay
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentFailed, setPaymentFailed] = useState<RazorpayPaymentFailureDetails | null>(null)
  const [isCancelled, setIsCancelled] = useState<boolean>(false)

  // Verify and sync script load state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.Razorpay) {
      setIsLoaded(true)
      return
    }

    loadRazorpayScript().then((loaded) => {
      setIsLoaded(loaded)
    })
  }, [])

  const resetState = useCallback(() => {
    setError(null)
    setPaymentFailed(null)
    setIsCancelled(false)
    setIsLoading(false)
  }, [])

  /**
   * Helper to initialize Medusa payment collection & session for the given cart.
   */
  const createPaymentSession = useCallback(
    async (
      cartId: string,
      providerId = 'pp_razorpay_razorpay'
    ): Promise<{
      paymentCollectionId: string
      session: MedusaPaymentSession
      razorpayOrderId: string
    }> => {
      const baseUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (publishableKey) {
        headers['x-publishable-api-key'] = publishableKey
      }

      // Step 1: Create or fetch payment collection
      const pcRes = await fetch(`${baseUrl}/store/payment-collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cart_id: cartId }),
      })

      if (!pcRes.ok) {
        const pcErr = await pcRes.json().catch(() => ({}))
        throw new Error(pcErr.message || 'Failed to initialize payment collection on backend.')
      }

      const { payment_collection } = await pcRes.json()
      if (!payment_collection?.id) {
        throw new Error('Payment collection response missing ID.')
      }

      // Step 2: Create payment session with provider_id
      const psRes = await fetch(
        `${baseUrl}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ provider_id: providerId }),
        }
      )

      if (!psRes.ok) {
        const psErr = await psRes.json().catch(() => ({}))
        throw new Error(psErr.message || 'Failed to initialize payment session with Razorpay provider.')
      }

      const psData = await psRes.json()
      const sessions = (psData?.payment_collection?.payment_sessions || []) as MedusaPaymentSession[]
      const session =
        sessions.find((s) => s.provider_id === providerId) ||
        sessions[0]

      if (!session) {
        throw new Error('No payment session returned from backend.')
      }

      const razorpayOrderId = extractRazorpayOrderId(session)
      if (!razorpayOrderId) {
        throw new Error('Backend payment session did not return a valid razorpay_order_id.')
      }

      return {
        paymentCollectionId: payment_collection.id,
        session,
        razorpayOrderId,
      }
    },
    []
  )

  /**
   * Opens the Razorpay Web Checkout modal with configured order ID, amount, and handles callbacks.
   */
  const openRazorpayCheckout = useCallback(
    async (options: OpenRazorpayCheckoutOptions): Promise<boolean> => {
      const {
        cartId,
        sessionData,
        amount,
        amountInPaise,
        currency = 'INR',
        keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || RAZORPAY_KEY_ID,
        customer,
        notes = {},
        backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL,
        publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY,
        onSuccess,
        onFailure,
        onDismiss,
        onPaymentFailed,
      } = options

      setIsLoading(true)
      setError(null)
      setPaymentFailed(null)
      setIsCancelled(false)

      // Ensure SDK script is available
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        const errMsg =
          'Could not load the Razorpay checkout script. Please check your network connection or ad-blocker and try again.'
        setError(errMsg)
        setIsLoading(false)
        onFailure?.({ message: errMsg, code: 'SDK_LOAD_FAILED' })
        return false
      }

      // Extract razorpay_order_id from session
      const orderId = extractRazorpayOrderId(sessionData)
      if (!orderId) {
        const errMsg =
          'Missing razorpay_order_id in payment session data. Unable to open payment gateway.'
        setError(errMsg)
        setIsLoading(false)
        onFailure?.({ message: errMsg, code: 'MISSING_ORDER_ID' })
        return false
      }

      // Compute amount in paise
      const totalInPaise = amountInPaise !== undefined ? amountInPaise : convertToPaise(amount)
      if (totalInPaise <= 0) {
        const errMsg = 'Payment amount must be greater than zero.'
        setError(errMsg)
        setIsLoading(false)
        onFailure?.({ message: errMsg, code: 'INVALID_AMOUNT' })
        return false
      }

      const cleanBaseUrl = backendUrl.replace(/\/$/, '')

      const razorpayConfig: RazorpayOptions = {
        key: keyId,
        amount: totalInPaise,
        currency: currency.toUpperCase(),
        name: 'GLOROV',
        description: 'Botanical Plants, Seeds & Supplies Purchase',
        order_id: orderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.contact || '',
        },
        notes: {
          cart_id: cartId,
          ...notes,
        },
        theme: {
          color: '#0A4C36', // GLOROV Brand Forest Green
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setIsCancelled(true)
            const cancelMsg = 'Payment was cancelled. You can retry checkout anytime.'
            setError(cancelMsg)
            onDismiss?.()
            onFailure?.({ message: cancelMsg, code: 'PAYMENT_CANCELLED' })
          },
          escape: true,
          backdropclose: false,
        },
        handler: async (response: RazorpayPaymentSuccessPayload) => {
          setIsLoading(true)
          try {
            // Step d: POST /store/payment/razorpay/verify
            const verifyHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            }
            if (publishableKey) {
              verifyHeaders['x-publishable-api-key'] = publishableKey
            }

            const verifyRes = await fetch(`${cleanBaseUrl}/store/payment/razorpay/verify`, {
              method: 'POST',
              headers: verifyHeaders,
              body: JSON.stringify({
                cart_id: cartId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData: RazorpayVerificationResponse = await verifyRes
              .json()
              .catch(() => ({}))

            if (!verifyRes.ok || !verifyData.success) {
              const errMsg =
                verifyData.error ||
                'Payment signature verification failed. Please try again or contact support.'
              setError(errMsg)
              setIsLoading(false)
              onFailure?.({
                message: errMsg,
                code: 'VERIFICATION_FAILED',
                details: verifyData,
              })
              return
            }

            // Step e: Complete cart (POST /store/carts/:id/complete)
            const completeHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            }
            if (publishableKey) {
              completeHeaders['x-publishable-api-key'] = publishableKey
            }

            const completeRes = await fetch(`${cleanBaseUrl}/store/carts/${cartId}/complete`, {
              method: 'POST',
              headers: completeHeaders,
            })

            const completeData = await completeRes.json().catch(() => ({}))

            if (!completeRes.ok) {
              const errMsg =
                completeData.message ||
                completeData.error ||
                'Payment verified, but cart completion failed. Please contact GLOROV support.'
              setError(errMsg)
              setIsLoading(false)
              onFailure?.({
                message: errMsg,
                code: 'CART_COMPLETION_FAILED',
                details: completeData,
              })
              return
            }

            setIsLoading(false)
            onSuccess?.({
              order: completeData.order || completeData,
              verification: verifyData,
              paymentPayload: response,
            })
          } catch (err: unknown) {
            const msg =
              err instanceof Error
                ? err.message
                : 'An unexpected network error occurred while finalizing payment.'
            setError(msg)
            setIsLoading(false)
            onFailure?.({ message: msg, code: 'NETWORK_ERROR', details: err })
          }
        },
      }

      try {
        const rzp = new window.Razorpay(razorpayConfig)

        // Handle payment failure event emitted by the Razorpay modal
        rzp.on('payment.failed', (failedPayload: RazorpayPaymentFailedPayload) => {
          const failErr = failedPayload?.error || {
            code: 'PAYMENT_FAILED',
            description: 'Payment could not be completed at gateway.',
            reason: 'gateway_failure',
          }

          setPaymentFailed(failErr)
          setError(
            failErr.description ||
              'Your payment failed or was declined by the bank. Please try another payment method or try again.'
          )
          setIsLoading(false)
          onPaymentFailed?.(failErr)
          onFailure?.({
            message: failErr.description || 'Payment failed',
            code: failErr.code,
            details: failErr,
          })
        })

        rzp.open()
        return true
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to launch Razorpay checkout modal.'
        setError(msg)
        setIsLoading(false)
        onFailure?.({ message: msg, code: 'MODAL_LAUNCH_ERROR', details: err })
        return false
      }
    },
    []
  )

  /**
   * Updates UI state when an asynchronous payment.failed webhook is received.
   */
  const handlePaymentFailedWebhookUpdate = useCallback(
    (payload: { order_id?: string; error_code?: string; error_description?: string }) => {
      const errorObj: RazorpayPaymentFailureDetails = {
        code: payload.error_code || 'PAYMENT_FAILED_WEBHOOK',
        description:
          payload.error_description ||
          'Payment failed notification received from payment gateway. Please retry payment.',
        source: 'webhook',
        reason: 'gateway_failed',
        metadata: {
          order_id: payload.order_id,
        },
      }
      setPaymentFailed(errorObj)
      setError(errorObj.description)
      setIsLoading(false)
    },
    []
  )

  return {
    isLoaded,
    isLoading,
    error,
    paymentFailed,
    isCancelled,
    openRazorpayCheckout,
    createPaymentSession,
    resolveOrCreateMedusaCart,
    handlePaymentFailedWebhookUpdate,
    resetState,
  }
}
