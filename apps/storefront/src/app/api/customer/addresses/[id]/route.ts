import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../../lib/constants'
import { mapMedusaAddress, toMedusaAddressPayload } from '../../../../../lib/api/addresses'
import { isValidPinCode, isValidIndianPhone, isValidIndianState } from '../../../../../lib/validation/address'

export const dynamic = 'force-dynamic'

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

async function getAuthToken(request: NextRequest): Promise<string | undefined> {
  const cookieStore = await cookies()
  const cookieToken =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    cookieStore.get(AUTH_COOKIE_NAME)?.value

  const authHeader = request.headers.get('Authorization')
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : undefined

  return headerToken || cookieToken
}

/**
 * POST /api/customer/addresses/[id]
 * Updates a saved customer address or sets it as default
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const token = await getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to update address' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    // Validate fields if provided
    if (body.pincode && !isValidPinCode(body.pincode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid 6-digit Indian PIN code (cannot start with 0)' },
        { status: 400 }
      )
    }

    if (body.phoneNumber && !isValidIndianPhone(body.phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    if (body.state && !isValidIndianState(body.state)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid Indian State or Union Territory' },
        { status: 400 }
      )
    }

    if (token.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        address: { ...body, id },
      })
    }

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()
    const payload = toMedusaAddressPayload(body)

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-publishable-api-key': pk,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: err.message || `Failed to update address (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    const data = await medusaRes.json()
    let updatedAddress = undefined
    let allAddresses = undefined

    if (Array.isArray(data.customer?.addresses)) {
      allAddresses = data.customer.addresses.map(mapMedusaAddress)
      updatedAddress = allAddresses.find((a: { id: string }) => a.id === id)
    } else if (data.address) {
      updatedAddress = mapMedusaAddress(data.address)
    }

    return NextResponse.json({
      success: true,
      address: updatedAddress || { ...body, id },
      addresses: allAddresses,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error updating address'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context)
}

/**
 * DELETE /api/customer/addresses/[id]
 * Deletes a saved customer address
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const token = await getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to delete address' },
        { status: 401 }
      )
    }

    if (token.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        deleted: true,
      })
    }

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-publishable-api-key': pk,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: err.message || `Failed to delete address (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      deleted: true,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error deleting address'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
