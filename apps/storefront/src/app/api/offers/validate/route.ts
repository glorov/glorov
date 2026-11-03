import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../../lib/constants'

export const dynamic = 'force-dynamic'

interface ValidateOfferRequestBody {
  code?: string
  cart_subtotal?: number
  items?: Array<{
    productId?: string
    variantId?: string
    title?: string
    category?: string
    price: number
    quantity: number
  }>
}

/**
 * POST /api/offers/validate
 * Validates a coupon code with category-awareness and cart subtotal.
 * Proxies to Medusa backend with seamless local fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ValidateOfferRequestBody = await req.json().catch(() => ({}))
    const code = (body.code || '').trim().toUpperCase()
    const cartSubtotal = Number(body.cart_subtotal ?? 0)
    const items = Array.isArray(body.items) ? body.items : []

    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Please enter a coupon code.' },
        { status: 400 }
      )
    }

    // Try Medusa Commerce Backend
    try {
      const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
      const backendRes = await fetch(`${baseUrl}/store/offers/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          code,
          cart_subtotal: cartSubtotal,
          items,
        }),
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
      // Backend unavailable; execute local fallback validation below
    }

    // Fallback: Local authoritative coupon validation
    const FALLBACK_OFFERS: Record<
      string,
      {
        title: string
        percent: number
        minSpend: number
        categories?: string[]
        badge: string
      }
    > = {
      HEIRLOOM20: {
        title: 'Desi Heirloom Seed Fest',
        percent: 20,
        minSpend: 499,
        categories: ['seeds'],
        badge: '20% OFF',
      },
      SEEDS20: {
        title: '20% OFF Seeds',
        percent: 20,
        minSpend: 599,
        categories: ['seeds'],
        badge: '20% OFF',
      },
      PLANTS15: {
        title: 'Urban Green Oasis',
        percent: 15,
        minSpend: 699,
        categories: ['live-plants', 'plants'],
        badge: '15% OFF',
      },
      PLANTERS10: {
        title: 'Artisan Ceramic Planters',
        percent: 10,
        minSpend: 799,
        categories: ['planters', 'pots'],
        badge: '10% OFF',
      },
      WINTER20: {
        title: 'Winter Sowing & Planting Fest',
        percent: 20,
        minSpend: 2299,
        badge: '20% OFF',
      },
      THUNDER15: {
        title: 'Monsoon Thunder Sale',
        percent: 15,
        minSpend: 1599,
        badge: '15% OFF',
      },
      FIRST10: {
        title: 'Special Welcome Offer',
        percent: 10,
        minSpend: 499,
        badge: '10% OFF',
      },
      GLOROV10: {
        title: 'Special Welcome Offer',
        percent: 10,
        minSpend: 499,
        badge: '10% OFF',
      },
      DIWALI10: {
        title: '10% OFF Festive Deal',
        percent: 10,
        minSpend: 999,
        badge: '10% OFF',
      },
      DIWALI15: {
        title: '15% OFF Festive Deal',
        percent: 15,
        minSpend: 1599,
        badge: '15% OFF',
      },
      DIWALI20: {
        title: '20% OFF Festive Deal',
        percent: 20,
        minSpend: 2299,
        badge: '20% OFF',
      },
    }

    const offer = FALLBACK_OFFERS[code]
    if (!offer) {
      return NextResponse.json(
        { success: false, valid: false, error: `Coupon "${code}" is invalid or expired.` },
        { status: 400 }
      )
    }

    const normalize = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

    let eligibleSubtotal = cartSubtotal
    let eligibleCount = items.length

    if (offer.categories && offer.categories.length > 0) {
      const targetCats = offer.categories.map(normalize)
      const matchingItems = items.filter((it) => {
        const itemCat = normalize(it.category)
        const itemTitle = normalize(it.title)
        return targetCats.some(
          (t) => (itemCat && (itemCat.includes(t) || t.includes(itemCat))) ||
                 (itemTitle && (itemTitle.includes(t) || t.includes(itemTitle)))
        )
      })

      if (matchingItems.length === 0) {
        const catLabel = offer.categories
          .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
          .join(' or ')
        return NextResponse.json(
          {
            success: false,
            valid: false,
            applicable_categories: offer.categories,
            error: `Coupon "${code}" is only valid for ${catLabel}. Your bag does not contain any eligible items.`,
          },
          { status: 400 }
        )
      }

      eligibleSubtotal = matchingItems.reduce(
        (sum, it) => sum + Math.max(0, it.price) * Math.max(1, it.quantity),
        0
      )
      eligibleCount = matchingItems.length

      if (eligibleSubtotal < offer.minSpend) {
        const needed = offer.minSpend - eligibleSubtotal
        return NextResponse.json(
          {
            success: false,
            valid: false,
            needed,
            min_spend: offer.minSpend,
            applicable_categories: offer.categories,
            error: `Add ₹${needed.toLocaleString('en-IN')} more of ${offer.categories.join(', ')} to unlock this ${offer.badge} offer.`,
          },
          { status: 400 }
        )
      }
    } else {
      if (cartSubtotal < offer.minSpend) {
        const needed = offer.minSpend - cartSubtotal
        return NextResponse.json(
          {
            success: false,
            valid: false,
            needed,
            min_spend: offer.minSpend,
            error: `Add ₹${needed.toLocaleString('en-IN')} more to unlock this ${offer.badge} offer.`,
          },
          { status: 400 }
        )
      }
    }

    const discountAmount = Math.round((eligibleSubtotal * offer.percent) / 100)

    return NextResponse.json({
      success: true,
      valid: true,
      offer: {
        code,
        title: offer.title,
        discount_badge: offer.badge,
        discount_value: offer.percent,
        min_spend: offer.minSpend,
        category: offer.categories ? offer.categories[0] : 'sitewide',
        applicable_categories: offer.categories,
      },
      discount_amount: discountAmount,
      discount_percent: offer.percent,
      applicable_categories: offer.categories,
      eligible_subtotal: eligibleSubtotal,
      eligible_items_count: eligibleCount,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown validation error'
    return NextResponse.json({ success: false, valid: false, error: msg }, { status: 500 })
  }
}
