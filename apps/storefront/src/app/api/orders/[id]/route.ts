import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../lib/constants'
import { transformMedusaOrder } from '../../../../lib/api/orders'
import { DEMO_ACCOUNT_ORDERS } from '../../../../context/CustomerAuthContext'

export const dynamic = 'force-dynamic'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

/**
 * GET /api/orders/[id]
 * Retrieves full order details with ownership verification.
 * Authenticated customers authenticate via token.
 * Unauthenticated guests verify ownership via matching email address.
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

    // Demo order fast path
    if (orderId.startsWith('ord_demo_') || token?.startsWith('jwt_demo_session_')) {
      const foundDemo = DEMO_ACCOUNT_ORDERS.find(
        (o) => o.id === orderId || o.displayId === orderId || o.displayId === `GLR-${orderId}`
      )
      if (foundDemo) {
        return NextResponse.json({
          success: true,
          order: foundDemo,
          rawOrder: foundDemo,
        })
      }
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
      `${baseUrl}/store/orders/${encodeURIComponent(orderId)}?fields=*items,*shipping_address,*shipping_methods,*fulfillments,*fulfillments.labels,*payment_collections`,
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
          message: data.message || `Order not found or access denied (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    const rawOrder = data.order
    if (!rawOrder) {
      return NextResponse.json(
        { success: false, message: `Order #${orderId} was not found` },
        { status: 404 }
      )
    }

    // Guest security verification check
    if (!token && guestEmail) {
      const orderEmail = String(rawOrder.email || '').trim().toLowerCase()
      if (orderEmail && orderEmail !== guestEmail) {
        return NextResponse.json(
          {
            success: false,
            message: 'The email address provided does not match the email associated with this order.',
          },
          { status: 403 }
        )
      }
    }

    const order = transformMedusaOrder(rawOrder)

    return NextResponse.json({
      success: true,
      order,
      rawOrder,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error retrieving order'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
