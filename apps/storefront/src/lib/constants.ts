/**
 * GLOROV Storefront Domain & Regional Constants
 */

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || 'GLOROV — Indian Seeds & Live Plants'

export const SITE_DESCRIPTION =
  'High-viability garden seeds, outdoor & indoor live potted plants, planters, and organic potting mixes online in India.'

export const DEFAULT_LOCALE = 'en-IN'
export const DEFAULT_CURRENCY = 'INR'
export const CURRENCY_SYMBOL = '₹'
export const DEFAULT_COUNTRY_CODE = 'in'

/**
 * Cookie key for storing the active Medusa cart session id
 */
export const CART_COOKIE_NAME = 'glorov_cart_id'

/**
 * Cart cookie options
 */
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Indian Commerce Compliance & Thresholds
 */
export const MIN_COD_ORDER_AMOUNT_INR = 299
export const MAX_COD_ORDER_AMOUNT_INR = 2500
export const FREE_SHIPPING_THRESHOLD_INR = 499

/**
 * Harmonized System of Nomenclature (HSN) for India GST
 */
export const HSN_CODES = {
  SEEDS: '1209', // 0% GST (Exempt)
  LIVE_PLANTS: '0602', // 0% GST (Exempt)
  PLANTERS_CERAMIC: '6912', // 12% or 18% GST
  ORGANIC_FERTILIZER: '3101', // 5% GST
  GARDENING_TOOLS: '8201', // 18% GST
} as const
