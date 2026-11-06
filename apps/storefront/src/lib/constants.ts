/**
 * Application-wide constants.
 * All runtime configuration comes from environment variables.
 * Never hard-code URLs, keys, or secrets here.
 */

/**
 * Base URL of the Medusa v2 backend.
 * On the server: accessed directly via process.env.
 * On the client: read from NEXT_PUBLIC_MEDUSA_BACKEND_URL.
 */
export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000'

/**
 * Resolves the Medusa Publishable API Key.
 * Throws a clear error if the required environment variable is missing.
 */
function getMedusaPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!key) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY. Please configure NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in your environment.'
    )
  }
  return key
}

/**
 * Medusa Publishable API Key — safe to expose to the browser.
 * Set in Medusa Admin → Settings → Publishable API Keys.
 */
export const MEDUSA_PUBLISHABLE_KEY = getMedusaPublishableKey()

/**
 * Canonical base URL of this storefront.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://glorov.in' : 'http://localhost:3000')

/**
 * Display name of the site — used in metadata and SEO.
 */
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || 'GLOROV — Indian Seeds & Live Plants'

/**
 * Default Medusa region handle for India.
 */
export const DEFAULT_REGION = 'in'

/**
 * Default currency code for India.
 */
export const DEFAULT_CURRENCY = 'inr'

/**
 * Number of products to fetch per catalog page.
 */
export const PRODUCTS_PER_PAGE = 12

/**
 * Number of search suggestions to show.
 */
export const SEARCH_SUGGESTION_LIMIT = 6

/**
 * Free delivery threshold in paise (₹499 = 49900 paise).
 */
export const FREE_DELIVERY_THRESHOLD_PAISE = 49900

/**
 * Maximum threshold for Cash on Delivery in India.
 * Standardized in minor units (paise) matching Medusa v2 currency storage:
 * ₹5,000 = 500,000 paise.
 */
export const COD_MAX_AMOUNT_PAISE = 500000

/**
 * Maximum threshold for Cash on Delivery in Indian Rupees (display unit).
 */
export const COD_MAX_AMOUNT_RUPEES = 5000

/**
 * Checks whether an order amount is eligible for Cash on Delivery (<= ₹5,000 / 500,000 paise).
 * Normalizes input so whether amount is passed in paise or rupees, comparison
 * is strictly performed in PAISE minor units against COD_MAX_AMOUNT_PAISE.
 *
 * @param amount Order amount (either in paise or in rupees)
 * @param unit 'paise' (default) or 'rupees'
 */
export function isCodAmountEligible(
  amount: number,
  unit: 'paise' | 'rupees' = 'paise'
): boolean {
  if (amount <= 0 || isNaN(amount)) return false
  const amountInPaise = unit === 'rupees' ? Math.round(amount * 100) : Math.round(amount)
  return amountInPaise <= COD_MAX_AMOUNT_PAISE
}


/**
 * Revalidation time in seconds for static product pages.
 */
export const PRODUCT_REVALIDATE_SECONDS = 60

/**
 * Revalidation time in seconds for category pages.
 */
export const CATEGORY_REVALIDATE_SECONDS = 300

/**
 * Cloudinary cloud name — safe to expose (read-only delivery).
 */
export const CLOUDINARY_CLOUD_NAME = 'naodmm8w'

/**
 * Razorpay Key ID for client-side checkout modal.
 * Safe to expose to browser clients (publishable key).
 */
export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_for_storefront'

/**
 * Cookie name for customer authentication session
 */
export const AUTH_COOKIE_NAME = 'glorov_customer_jwt'

/**
 * Cookie name for active shopping cart session
 */
export const CART_COOKIE_NAME = 'cart_id'

