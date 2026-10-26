import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ShiprocketClient } from '../../../modules/fulfillment-shiprocket/client'

/**
 * GET /store/pincode-check
 * Validates Indian 6-digit PIN code serviceability, courier delivery timeline,
 * dynamic rate estimation, and Cash-on-Delivery (COD) eligibility for seeds
 * and perishable botanical items.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { pincode, is_perishable, weight, declared_value, cod } = (req.query || {}) as {
    pincode?: string
    is_perishable?: string
    weight?: string
    declared_value?: string
    cod?: string
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
      status: 'rejected',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'invalid_format',
      message: 'Invalid 6-digit Indian PIN code format. Must be 6 digits and cannot start with 0.',
    })
    return
  }

  const isPerishable = is_perishable === 'true' || is_perishable === '1'
  const packageWeight = weight ? parseFloat(weight) : isPerishable ? 1.0 : 0.5
  const declaredValueInr = declared_value ? parseFloat(declared_value) : 0
  const isCodRequested = cod === undefined || cod === 'true' || cod === '1'

  try {
    const client = new ShiprocketClient()
    const result = await client.checkServiceability({
      deliveryPostcode: cleanPin,
      weightKg: packageWeight,
      cod: isCodRequested,
      declaredValueInr,
    })

    // Apply GLOROV Botanical COD Guardrail:
    // Live potted plants sensitive to transit delays cannot use COD on slow routes (>2 days).
    let codAvailable = result.cod_available
    let codEligible = result.cod_eligible
    let codRestrictionReason = result.cod_restriction_reason
    let message = result.message || ''

    if (isPerishable && result.serviceable) {
      const isExpressZone = (result.estimated_days || 3) <= 2
      if (!isExpressZone) {
        codAvailable = false
        codEligible = false
        codRestrictionReason = 'perishable_transit_guardrail'
        message = `${message} — Note: Perishable live plants require prepaid express transit to ensure botanical survival.`
      }
    }

    res.status(200).json({
      pincode: result.pincode,
      serviceable: result.serviceable,
      status: result.status,
      city: result.city,
      state: result.state,
      prepaid_eligible: result.prepaid_eligible,
      cod_available: codAvailable,
      cod_eligible: codEligible,
      cod_restriction_reason: codRestrictionReason,
      estimated_days: result.estimated_days,
      courier_name: result.courier_name,
      rate_inr: result.rate_inr,
      rate_source: result.rate_source,
      message,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Serviceability lookup failed'
    res.status(500).json({
      pincode: cleanPin,
      serviceable: false,
      status: 'undetermined',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'provider_error',
      message: errMsg,
    })
  }
}
