import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../../lib/constants'

export const dynamic = 'force-dynamic'

/**
 * POST /api/offers/validate
 * Proxies coupon validation to Medusa Commerce backend (POST /store/offers/validate).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const baseUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')

    const res = await fetch(`${baseUrl}/store/offers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || '',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Coupon validation service unavailable'
    return NextResponse.json(
      {
        valid: false,
        error: msg,
      },
      { status: 500 }
    )
  }
}
