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
 * GET /api/orders/[id]/return-request
 * Retrieve return requests submitted for this order
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

    if (orderId.startsWith('ord_demo_') || token?.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        order_id: orderId,
        return_requests: [],
      })
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
      `${baseUrl}/store/orders/${encodeURIComponent(orderId)}/return-request`,
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
          error: data.message || `Failed to fetch return requests (${medusaRes.status})`,
          return_requests: [],
        },
        { status: medusaRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: data.order_id || orderId,
      display_id: data.display_id,
      return_requests: data.return_requests || [],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error retrieving return requests'
    return NextResponse.json({ success: false, error: message, return_requests: [] }, { status: 500 })
  }
}

/**
 * POST /api/orders/[id]/return-request
 * Submit a return request for eligible delivered items
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
        message: 'Return request submitted successfully and is pending review (Demo Mode).',
        return_request: {
          id: `ret_req_demo_${Date.now()}`,
          order_id: orderId,
          status: 'pending_review',
          items: body.items || [],
          refund_status: 'pending',
          created_at: new Date().toISOString(),
        },
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
      `${baseUrl}/store/orders/${encodeURIComponent(orderId)}/return-request`,
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
          message: data.message || `Failed to submit return request (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Return request submitted successfully and is pending review.',
      return_request: data.return_request,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error processing return request'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
