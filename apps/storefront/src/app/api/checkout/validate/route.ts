import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../../lib/constants'
import { MOCK_PRODUCTS } from '../../../../lib/mock-data'

export const dynamic = 'force-dynamic'

interface CheckoutValidateBody {
  items: Array<{
    productId: string
    variantId?: string
    title?: string
    category?: string
    quantity: number
    clientPrice?: number
  }>
  couponCode?: string | null
  shippingOptionId?: string
  paymentMethod?: string
  deliveryAddress?: {
    fullName?: string
    email?: string
    phone?: string
    addressLine1?: string
    postalCode?: string
    city?: string
    state?: string
  }
  clientGrandTotal?: number
}

/**
 * POST /api/checkout/validate
 * Server-side authoritative validation for Next.js Storefront.
 * Prevents client-side hacking, verifies stock, validates category offers,
 * and enforces payment rules (such as COD limits).
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckoutValidateBody = await req.json().catch(() => ({} as CheckoutValidateBody))

    // 1. Attempt Medusa Commerce Backend Validation
    try {
      const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
      const backendRes = await fetch(`${baseUrl}/store/checkout/validate`, {
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
      // Backend unavailable; run local authoritative validation below
    }

    // 2. Local Authoritative Checkout Validation Fallback
    const errors: string[] = []
    const warnings: string[] = []

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          errors: ['Your cart is empty. Please select botanical items to continue.'],
          warnings: [],
        },
        { status: 400 }
      )
    }

    const verifiedItems = []
    let verifiedSubtotal = 0

    for (const item of body.items) {
      const itemTitle = item.title || 'Botanical Item'

      // Anti-Hacker: Positive Integer Quantity Validation
      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        errors.push(`Invalid quantity (${item.quantity}) for "${itemTitle}". Quantity must be a positive integer.`)
        continue
      }

      if (item.quantity > 50) {
        errors.push(`Quantity limit exceeded for "${itemTitle}". Maximum 50 units per order.`)
        continue
      }

      // Catalog lookup & Stock check
      const catalogProduct = MOCK_PRODUCTS.find(
        (p) => p.id === item.productId || p.slug === item.productId
      )

      let unitPrice = item.clientPrice ?? 99
      let category = item.category || 'Seeds'
      let inStock = true

      if (catalogProduct) {
        unitPrice = catalogProduct.discountPrice ?? catalogProduct.price
        category = catalogProduct.category
        inStock = catalogProduct.inStock

        if (item.clientPrice !== undefined && Math.abs(item.clientPrice - unitPrice) > 0.01) {
          warnings.push(`Price for "${catalogProduct.title}" adjusted to verified catalog rate (₹${unitPrice}).`)
        }
      }

      if (!inStock) {
        errors.push(`"${itemTitle}" is currently out of stock. Please remove it from your cart.`)
      }

      const lineTotal = unitPrice * item.quantity
      verifiedSubtotal += lineTotal

      verifiedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        title: catalogProduct?.title || itemTitle,
        category,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        inStock,
      })
    }

    // Offer / Coupon Validation with Category Rules
    let discountAmount = 0
    let appliedOfferInfo = undefined

    if (body.couponCode && body.couponCode.trim()) {
      const cleanCode = body.couponCode.trim().toUpperCase()

      const COUPONS: Record<string, { percent: number; minSpend: number; categories?: string[]; title: string }> = {
        DIWALI10: { percent: 10, minSpend: 999, title: '10% OFF' },
        DIWALI15: { percent: 15, minSpend: 1599, title: '15% OFF' },
        DIWALI20: { percent: 20, minSpend: 2299, title: '20% OFF' },
      }

      const coupon = COUPONS[cleanCode]
      if (!coupon) {
        errors.push(`Coupon "${cleanCode}" is invalid or expired.`)
      } else {
        const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        let eligibleSubtotal = verifiedSubtotal

        if (coupon.categories && coupon.categories.length > 0) {
          const targets = coupon.categories.map(norm)
          const eligibleItems = verifiedItems.filter((it) => {
            const cat = norm(it.category)
            const tit = norm(it.title)
            return targets.some((t) => cat.includes(t) || t.includes(cat) || tit.includes(t))
          })

          if (eligibleItems.length === 0) {
            errors.push(`Coupon "${cleanCode}" is only valid for ${coupon.categories.join(' or ')}. Your bag has no eligible items.`)
          } else {
            eligibleSubtotal = eligibleItems.reduce((acc, it) => acc + it.lineTotal, 0)
            if (eligibleSubtotal < coupon.minSpend) {
              const diff = coupon.minSpend - eligibleSubtotal
              errors.push(`Add ₹${diff.toLocaleString('en-IN')} more in ${coupon.categories.join(', ')} to unlock coupon "${cleanCode}".`)
            } else {
              discountAmount = Math.round((eligibleSubtotal * coupon.percent) / 100)
              appliedOfferInfo = {
                code: cleanCode,
                title: coupon.title,
                discountPercent: coupon.percent,
                discountAmount,
                eligibleSubtotal,
              }
            }
          }
        } else {
          if (verifiedSubtotal < coupon.minSpend) {
            const diff = coupon.minSpend - verifiedSubtotal
            errors.push(`Add ₹${diff.toLocaleString('en-IN')} more to unlock coupon "${cleanCode}".`)
          } else {
            discountAmount = Math.round((verifiedSubtotal * coupon.percent) / 100)
            appliedOfferInfo = {
              code: cleanCode,
              title: coupon.title,
              discountPercent: coupon.percent,
              discountAmount,
            }
          }
        }
      }
    }

    // Shipping calculation
    const shippingOptionId = body.shippingOptionId || 'so_standard'
    const shippingAmount = shippingOptionId === 'so_express' ? 99 : verifiedSubtotal >= 499 ? 0 : 99
    const shippingName = shippingOptionId === 'so_express' ? 'Express Climate-Controlled Delivery' : 'Standard Botanical Delivery'

    const grandTotal = Math.max(0, verifiedSubtotal - discountAmount + shippingAmount)

    // Payment validation (COD limit)
    const paymentMethod = body.paymentMethod || 'cod'
    let paymentValid = true
    let paymentError: string | undefined

    if (!['cod', 'upi', 'card'].includes(paymentMethod)) {
      paymentValid = false
      paymentError = `Unsupported payment method "${paymentMethod}".`
      errors.push(paymentError)
    } else if (paymentMethod === 'cod') {
      if (grandTotal > 5000) {
        paymentValid = false
        paymentError = `Cash on Delivery (COD) is restricted to orders up to ₹5,000. Your order total is ₹${grandTotal.toLocaleString('en-IN')}. Please select UPI or Card.`
        errors.push(paymentError)
      } else if (grandTotal === 0) {
        paymentValid = false
        paymentError = 'COD cannot be selected for an order total of ₹0.'
        errors.push(paymentError)
      }
    }

    // Postal code verification
    if (body.deliveryAddress?.postalCode) {
      if (!/^\d{6}$/.test(body.deliveryAddress.postalCode.trim())) {
        errors.push('Invalid Indian 6-digit postal PIN code.')
      }
    }

    const isValid = errors.length === 0

    return NextResponse.json(
      {
        success: isValid,
        valid: isValid,
        errors,
        warnings,
        verifiedCart: {
          items: verifiedItems,
          subtotal: verifiedSubtotal,
          discountAmount,
          shippingAmount,
          grandTotal,
          appliedOffer: appliedOfferInfo,
          shippingOption: { id: shippingOptionId, name: shippingName, amount: shippingAmount },
          paymentMethod: { id: paymentMethod, valid: paymentValid, error: paymentError },
        },
      },
      { status: isValid ? 200 : 400 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Checkout validation error'
    return NextResponse.json({ success: false, valid: false, errors: [msg] }, { status: 500 })
  }
}
