import { NextRequest, NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../lib/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pincode?pincode=560001
 * Proxies pincode serviceability and estimated delivery from Medusa Commerce backend.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const pincode = searchParams.get('pincode')?.trim()

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json(
      { serviceable: false, status: 'invalid', message: 'Please enter a valid 6-digit Indian PIN code.' },
      { status: 400 }
    )
  }

  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/pincode-check?pincode=${encodeURIComponent(pincode)}`, {
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

    // Backend returned non-200 or is unavailable
    return NextResponse.json(
      {
        pincode,
        serviceable: false,
        connected: false,
        message: 'Delivery is not available to this address. Fulfillment network is not connected to the store.',
      },
      { status: 503 }
    )
  } catch {
    // When backend / admin dashboard is disconnected
    return NextResponse.json(
      {
        pincode,
        serviceable: false,
        connected: false,
        message: 'Delivery is not available to this address. Fulfillment network is disconnected from the store.',
      },
      { status: 503 }
    )
  }
}
