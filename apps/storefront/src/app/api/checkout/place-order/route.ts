import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../../lib/constants'
import { MOCK_PRODUCTS } from '../../../../lib/mock-data'
import type { PlacedOrderReceipt } from '../../../../types/checkout'

export const dynamic = 'force-dynamic'

/**
 * POST /api/checkout/place-order
 * Authoritative order creation endpoint:
 * Runs server-side verification on stock, prices, coupons, and payment constraints.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    // 1. Attempt Backend Order Placement
    try {
      const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
      const backendRes = await fetch(`${baseUrl}/store/checkout/place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      })

      if (backendRes.ok) {
        const data = await backendRes.json()
        return NextResponse.json(data)
      }

      if (backendRes.status === 400) {
        const errData = await backendRes.json().catch(() => null)
        if (errData) return NextResponse.json(errData, { status: 400 })
      }
    } catch {
      // Backend unavailable; run local authoritative order placement fallback
    }

    // 2. Authoritative Validation
    const validateRes = await fetch(new URL('/api/checkout/validate', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const validationData = await validateRes.json().catch(() => ({}))

    if (!validateRes.ok || !validationData.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Checkout validation failed. Please address the errors before completing your order.',
          errors: validationData.errors || ['Validation failed'],
          warnings: validationData.warnings || [],
          verifiedCart: validationData.verifiedCart,
        },
        { status: 400 }
      )
    }

    const { verifiedCart } = validationData
    const orderId = `ord_${Date.now()}`
    const displayId = `GLR-${Math.floor(100000 + Math.random() * 900000)}`
    const now = new Date().toISOString()

    const paymentTitle =
      verifiedCart.paymentMethod.id === 'cod'
        ? 'Cash on Delivery (COD)'
        : verifiedCart.paymentMethod.id === 'upi'
        ? 'UPI Instant Transfer'
        : 'Credit / Debit Card (Simulated)'

    const placedOrder: PlacedOrderReceipt = {
      id: orderId,
      displayId,
      createdAt: now,
      email: body.deliveryAddress?.email || 'customer@example.com',
      customerName: body.deliveryAddress?.fullName || 'Valued Grower',
      shippingAddress: body.deliveryAddress,
      shippingMethodName: verifiedCart.shippingOption.name,
      paymentMethodTitle: paymentTitle,
      items: verifiedCart.items.map((it: { productId: string; variantId?: string; title: string; unitPrice: number; quantity: number }) => ({
        id: it.productId,
        productId: it.productId,
        variantId: it.variantId,
        title: it.title,
        price: it.unitPrice,
        quantity: it.quantity,
        image: MOCK_PRODUCTS.find((p) => p.id === it.productId)?.primaryImage || '',
      })),
      subtotal: verifiedCart.subtotal,
      discountAmount: verifiedCart.discountAmount,
      shippingAmount: verifiedCart.shippingAmount,
      totalAmount: verifiedCart.grandTotal,
      currency: 'INR',
      estimatedDeliveryDate:
        verifiedCart.shippingOption.id === 'so_express'
          ? 'Within 1 — 2 Business Days'
          : 'Within 3 — 5 Business Days',
      paymentStatus: verifiedCart.paymentMethod.id === 'cod' ? 'authorized' : 'captured',
      fulfillmentStatus: 'not_fulfilled',
    }

    return NextResponse.json({
      success: true,
      order: placedOrder,
      warnings: validationData.warnings || [],
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Order placement error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
