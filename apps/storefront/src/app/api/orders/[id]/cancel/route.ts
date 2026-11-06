import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../../lib/constants'

export const dynamic = 'force-dynamic'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

/**
 * POST /api/orders/[id]/cancel
 * Customer-facing cancellation route calling backend POST /store/orders/:id/cancel
 */
export async function POST(
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
    const body = await request.json().catch(() => ({}))

    // Fast-path demo account
    if (orderId.startsWith('ord_demo_') || token?.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        message: `Order #${orderId} has been successfully canceled (Demo Mode).`,
        order_id: orderId,
        status: 'canceled',
      })
    }

    const emailToUse =
      body.order_email ||
      body.email ||
      request.headers.get('x-order-email')?.trim().toLowerCase()

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
    if (emailToUse) {
      headers['x-order-email'] = emailToUse
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    )

    const data = await medusaRes.json().catch(() => ({}))

    if (!medusaRes.ok || data.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || `Failed to cancel order (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Order canceled successfully.',
      order_id: data.order_id || orderId,
      status: data.status || 'canceled',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error processing cancellation'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
