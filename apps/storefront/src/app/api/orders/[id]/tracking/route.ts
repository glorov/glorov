import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../../lib/constants'
import type { OrderTrackingInfo } from '../../../../../types/account'

export const dynamic = 'force-dynamic'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

/**
 * GET /api/orders/[id]/tracking
 * Fetches live botanical tracking from backend GET /store/orders/:id/tracking
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const orderId = decodeURIComponent(id)

  try {
    const cookieStore = await cookies()
    const cookieToken =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      cookieStore.get(AUTH_COOKIE_NAME)?.value

    const authHeader = request.headers.get('Authorization')
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined

    const token = headerToken || cookieToken

    // Fast-path demo account
    if (orderId.startsWith('ord_demo_') || token?.startsWith('jwt_demo_session_')) {
      const demoTracking: OrderTrackingInfo = {
        order_id: orderId,
        display_id: '881920',
        fulfillment_status: 'shipped',
        shipping_status: 'in_transit',
        awb: 'SR-GLR-9921820',
        courier_name: 'Shiprocket Botanical Cold-Chain',
        tracking_url: 'https://shiprocket.co/tracking/SR-GLR-9921820',
        origin: 'Pune Central Nursery Hub (PIN 411001)',
        destination_city: 'Bengaluru',
        destination_state: 'Karnataka',
        destination_pincode: '560038',
        is_perishable: true,
        moisture_shield_status:
          'Protected with moisture-retaining sphagnum wrap & breathable air ventilation',
        scans: [
          {
            date: '28 Oct 2026, 05:30 PM',
            activity: 'Package hydrated and handed over to cold-chain courier at Pune Nursery Hub',
            location: 'Pune Central Nursery Hub',
          },
          {
            date: '29 Oct 2026, 09:15 AM',
            activity: 'In Transit — Temperature logged at safe botanical 22°C',
            location: 'Navi Mumbai Transit Hub',
          },
        ],
      }
      return NextResponse.json({ success: true, tracking: demoTracking })
    }

    const { searchParams } = new URL(request.url)
    const guestEmail =
      request.headers.get('x-order-email')?.trim().toLowerCase() ||
      searchParams.get('email')?.trim().toLowerCase()

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': pk,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (guestEmail) {
      headers['x-order-email'] = guestEmail
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(orderId)}/tracking`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    )

    const data = await medusaRes.json().catch(() => ({}))

    if (!medusaRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || `Tracking information unavailable (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      tracking: data,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error fetching tracking'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
