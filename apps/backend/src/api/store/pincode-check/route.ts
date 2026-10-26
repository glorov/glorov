import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ShiprocketClient } from '../../../modules/fulfillment-shiprocket/client'

/**
 * GET /store/pincode-check
 * Validates Indian 6-digit PIN code serviceability, estimated delivery timeline,
 * and Cash-on-Delivery (COD) eligibility for seeds and perishable botanical items.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { pincode, is_perishable, weight } = (req.query || {}) as {
    pincode?: string
    is_perishable?: string
    weight?: string
  }

  if (!pincode || typeof pincode !== 'string') {
    res.status(400).json({
      message: 'PIN code query parameter is required (e.g. /store/pincode-check?pincode=411001)',
    })
    return
  }

  const cleanPin = pincode.trim()

  // Strict Indian Postal PIN validation: 6 digits, cannot start with 0
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    res.status(400).json({
      pincode: cleanPin,
      serviceable: false,
      cod_available: false,
      message: 'Invalid 6-digit Indian PIN code format. Must be 6 digits and cannot start with 0.',
    })
    return
  }

  const isPerishable = is_perishable === 'true' || is_perishable === '1'
  const packageWeight = weight ? parseFloat(weight) : isPerishable ? 1.0 : 0.5

  try {
    const client = new ShiprocketClient()
    const result = await client.checkServiceability({
      deliveryPostcode: cleanPin,
      weightKg: packageWeight,
      cod: true,
    })

    // Apply GLOROV Botanical COD Guardrail:
    // Live potted plants sensitive to transit delays cannot use COD on slow routes (>2 days).
    let codAvailable = result.cod_available
    let message = result.message || ''

    if (isPerishable && result.serviceable) {
      const isExpressZone = (result.estimated_days || 3) <= 2
      if (!isExpressZone) {
        codAvailable = false
        message = `${message} — Note: Perishable live plants require prepaid express transit to ensure botanical survival.`
      }
    }

    res.status(200).json({
      pincode: result.pincode,
      serviceable: result.serviceable,
      city: result.city,
      state: result.state,
      cod_available: codAvailable,
      estimated_days: result.estimated_days,
      courier_name: result.courier_name,
      rate_inr: result.rate_inr,
      message,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Serviceability lookup failed'
    res.status(500).json({
      pincode: cleanPin,
      serviceable: false,
      cod_available: false,
      message: errMsg,
    })
  }
}
