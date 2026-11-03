import { NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../lib/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/offers
 * Proxies dynamic promotional coupon offers from Medusa Commerce backend.
 */
export async function GET() {
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/offers`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ offers: [] }, { status: 200 })
  } catch {
    return NextResponse.json({ offers: [] }, { status: 200 })
  }
}
