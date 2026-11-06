import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../../lib/constants'

export const dynamic = 'force-dynamic'

const AUTH_COOKIE_NAME = 'glorov_customer_jwt'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

function getMedusaHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const pk = getPublishableKey()
  if (pk) {
    headers['x-publishable-api-key'] = pk
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * GET /api/customer/wishlist
 * Retrieves customer's persisted botanical wishlist from Medusa customer metadata.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ success: true, wishlist: [] })
  }

  // Demo user fast-path
  if (token.startsWith('jwt_demo_session_')) {
    return NextResponse.json({ success: true, wishlist: [] })
  }

  try {
    const baseUrl = getMedusaBaseUrl()
    const res = await fetch(`${baseUrl}/store/customers/me`, {
      headers: getMedusaHeaders(token),
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, wishlist: [] }, { status: res.status })
    }

    const data = await res.json()
    const customer = data.customer || data
    const wishlist = (customer.metadata?.wishlist as string[]) || []

    return NextResponse.json({ success: true, wishlist })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve customer wishlist'
    return NextResponse.json({ success: false, error: msg, wishlist: [] }, { status: 500 })
  }
}

/**
 * POST /api/customer/wishlist
 * Synchronizes customer's botanical wishlist to Medusa customer metadata.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required to sync wishlist with customer account' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const wishlistIds: string[] = Array.isArray(body.wishlist)
    ? body.wishlist
    : Array.isArray(body.wishlistIds)
    ? body.wishlistIds
    : []

  // Demo user fast-path
  if (token.startsWith('jwt_demo_session_')) {
    return NextResponse.json({ success: true, wishlist: wishlistIds })
  }

  try {
    const baseUrl = getMedusaBaseUrl()

    // 1. Fetch existing customer metadata to avoid overwriting other keys
    const getRes = await fetch(`${baseUrl}/store/customers/me`, {
      headers: getMedusaHeaders(token),
      cache: 'no-store',
    })

    let existingMeta: Record<string, unknown> = {}
    if (getRes.ok) {
      const custData = await getRes.json()
      existingMeta = ((custData.customer || custData).metadata || {}) as Record<string, unknown>
    }

    // 2. Update customer metadata with synced wishlist array
    const updateRes = await fetch(`${baseUrl}/store/customers/me`, {
      method: 'POST',
      headers: getMedusaHeaders(token),
      body: JSON.stringify({
        metadata: {
          ...existingMeta,
          wishlist: wishlistIds,
        },
      }),
      cache: 'no-store',
    })

    if (!updateRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to persist wishlist to customer account' },
        { status: updateRes.status }
      )
    }

    return NextResponse.json({ success: true, wishlist: wishlistIds })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Wishlist synchronization failed'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
