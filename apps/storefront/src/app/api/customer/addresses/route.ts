import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../lib/constants'
import { mapMedusaAddress, toMedusaAddressPayload, type MedusaAddressResponse } from '../../../../lib/api/addresses'
import { validateIndianAddress } from '../../../../lib/validation/address'
import { DEMO_ACCOUNT_ADDRESSES } from '../../../../context/CustomerAuthContext'

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
 * GET /api/customer/addresses
 * Returns saved delivery addresses for the authenticated customer
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view addresses', addresses: [] },
        { status: 401 }
      )
    }

    if (token.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        addresses: DEMO_ACCOUNT_ADDRESSES,
      })
    }

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()

    const medusaRes = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-publishable-api-key': pk,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: err.message || `Failed to fetch customer addresses (${medusaRes.status})`,
          addresses: [],
        },
        { status: medusaRes.status }
      )
    }

    const data = await medusaRes.json()
    const rawList: MedusaAddressResponse[] = Array.isArray(data.customer?.addresses)
      ? data.customer.addresses
      : []
    const addresses = rawList.map(mapMedusaAddress)

    return NextResponse.json({
      success: true,
      addresses,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error fetching addresses'
    return NextResponse.json({ success: false, error: message, addresses: [] }, { status: 500 })
  }
}

/**
 * POST /api/customer/addresses
 * Creates a new saved delivery address for the authenticated customer
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to add an address' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    // Validate Indian address format strictly (PIN code, phone, state)
    const validation = validateIndianAddress({
      fullName: body.fullName,
      phoneNumber: body.phoneNumber,
      addressLine1: body.addressLine1,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      requireEmail: false,
    })

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the invalid address fields.',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    if (token.startsWith('jwt_demo_session_')) {
      const newAddr = {
        ...body,
        id: `addr_demo_${Date.now()}`,
      }
      return NextResponse.json({
        success: true,
        address: newAddr,
        addresses: [newAddr, ...DEMO_ACCOUNT_ADDRESSES],
      })
    }

    const baseUrl = getMedusaBaseUrl()
    const pk = getPublishableKey()
    const payload = toMedusaAddressPayload(body)

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses`, {
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
          error: err.message || `Failed to create address (${medusaRes.status})`,
        },
        { status: medusaRes.status }
      )
    }

    const data = await medusaRes.json()
    let createdAddress = undefined
    let allAddresses = undefined

    if (Array.isArray(data.customer?.addresses)) {
      allAddresses = data.customer.addresses.map(mapMedusaAddress)
      createdAddress = allAddresses[allAddresses.length - 1]
    } else if (data.address) {
      createdAddress = mapMedusaAddress(data.address)
    }

    return NextResponse.json({
      success: true,
      address: createdAddress || { ...body, id: `addr_${Date.now()}` },
      addresses: allAddresses,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error adding address'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
