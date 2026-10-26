import { NextRequest, NextResponse } from 'next/server'
import { isValidIndianPincode, cleanPincode } from '@/lib/shipping'

export const dynamic = 'force-dynamic'

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9000'

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pincode = searchParams.get('pincode') || ''
    const cleanPin = cleanPincode(pincode)

    if (!pincode) {
      return NextResponse.json(
        {
          success: false,
          pincode: '',
          serviceable: false,
          status: 'rejected',
          prepaid_eligible: false,
          cod_available: false,
          cod_eligible: false,
          message: 'PIN code query parameter is required.',
        },
        { status: 400 }
      )
    }

    if (!isValidIndianPincode(cleanPin)) {
      return NextResponse.json(
        {
          success: false,
          pincode: cleanPin,
          serviceable: false,
          status: 'rejected',
          prepaid_eligible: false,
          cod_available: false,
          cod_eligible: false,
          cod_restriction_reason: 'invalid_format',
          message:
            'Invalid 6-digit Indian PIN code format. Must be 6 digits and cannot start with 0.',
        },
        { status: 400 }
      )
    }

    const backendQuery = new URLSearchParams({ pincode: cleanPin })
    const isPerishable = searchParams.get('is_perishable')
    if (isPerishable) backendQuery.set('is_perishable', isPerishable)

    const weight = searchParams.get('weight')
    if (weight) backendQuery.set('weight', weight)

    const cod = searchParams.get('cod')
    if (cod) backendQuery.set('cod', cod)

    const declaredValue = searchParams.get('declared_value')
    if (declaredValue) backendQuery.set('declared_value', declaredValue)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const backendRes = await fetch(
        `${MEDUSA_BACKEND_URL}/store/pincode-check?${backendQuery.toString()}`,
        {
          headers: {
            'x-publishable-api-key': PUBLISHABLE_KEY,
            Accept: 'application/json',
          },
          signal: controller.signal,
          cache: 'no-store',
        }
      )

      const data = await backendRes.json()

      if (!backendRes.ok) {
        return NextResponse.json(
          {
            success: false,
            pincode: cleanPin,
            serviceable: false,
            status: data.status || 'rejected',
            prepaid_eligible: false,
            cod_available: false,
            cod_eligible: false,
            message: data.message || 'Serviceability verification failed at gateway.',
          },
          { status: backendRes.status }
        )
      }

      return NextResponse.json(
        {
          success: true,
          pincode: data.pincode || cleanPin,
          serviceable: Boolean(data.serviceable),
          status: data.status || (data.serviceable ? 'confirmed' : 'rejected'),
          city: data.city,
          state: data.state,
          prepaid_eligible: Boolean(data.prepaid_eligible),
          cod_available: Boolean(data.cod_available),
          cod_eligible: Boolean(data.cod_eligible ?? data.cod_available),
          cod_restriction_reason: data.cod_restriction_reason || null,
          estimated_days: data.estimated_days,
          courier_name: data.courier_name,
          rate_inr: data.rate_inr,
          rate_source: data.rate_source || 'configured_estimate',
          message: data.message,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      )
    } finally {
      clearTimeout(timer)
    }
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    return NextResponse.json(
      {
        success: false,
        serviceable: false,
        status: 'undetermined',
        prepaid_eligible: false,
        cod_available: false,
        cod_eligible: false,
        message: isTimeout
          ? 'Logistics serviceability lookup timed out. Please retry shortly.'
          : 'Serviceability service temporarily unavailable.',
      },
      { status: 503 }
    )
  }
}
