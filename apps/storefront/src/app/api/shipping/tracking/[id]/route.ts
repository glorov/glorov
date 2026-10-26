import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CUSTOMER_COOKIE_NAME } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'http://localhost:9000'

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params
    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const customerToken = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value

    const headers: Record<string, string> = {
      'x-publishable-api-key': PUBLISHABLE_KEY,
      Accept: 'application/json',
    }

    if (customerToken) {
      headers.Authorization = `Bearer ${customerToken}`
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/tracking`, {
        headers,
        signal: controller.signal,
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message: data.message || 'Tracking details not available',
          },
          { status: response.status }
        )
      }

      return NextResponse.json(
        {
          success: true,
          tracking: data,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
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
        message: isTimeout
          ? 'Tracking gateway query timed out. Please try again shortly.'
          : 'Tracking service temporarily unavailable.',
      },
      { status: 503 }
    )
  }
}
