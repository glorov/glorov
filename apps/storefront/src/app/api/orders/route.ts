import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../lib/constants'
import { transformMedusaOrder } from '../../../lib/api/orders'
import { DEMO_ACCOUNT_ORDERS } from '../../../context/CustomerAuthContext'

export const dynamic = 'force-dynamic'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

/**
 * GET /api/orders
 * Returns customer orders from Medusa v2 backend for authenticated patron
 */
export async function GET(request: NextRequest) {
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

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view order history', orders: [] },
        { status: 401 }
      )
    }

    // Fast-path demo account
    if (token.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        orders: DEMO_ACCOUNT_ORDERS,
      })
    }

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()

    const medusaRes = await fetch(
      `${baseUrl}/store/orders?fields=*items,*shipping_address,*shipping_methods,*fulfillments,*fulfillments.labels,*payment_collections`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-publishable-api-key': pk,
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    )

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: err.message || `Failed to fetch orders (${medusaRes.status})`,
          orders: [],
        },
        { status: medusaRes.status }
      )
    }

    const data = await medusaRes.json()
    const rawList = Array.isArray(data.orders) ? data.orders : []
    const orders = rawList.map(transformMedusaOrder)

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error fetching orders'
    return NextResponse.json({ success: false, error: message, orders: [] }, { status: 500 })
  }
}
