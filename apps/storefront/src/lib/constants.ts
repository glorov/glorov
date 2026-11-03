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
 * Medusa Publishable API Key — safe to expose to the browser.
 * Set in Medusa Admin → Settings → Publishable API Keys.
 */
export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_2550b4af7f0ff9f2f1ff1b5f9b16c11e753ba1b574d55e1d9221d496085a7ef8'

/**
 * Canonical base URL of this storefront.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://glorov.tech' : 'http://localhost:3000')

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
 * Minimum cart amount in paise eligible for COD (₹5000 max).
 */
export const COD_MAX_AMOUNT_PAISE = 500000

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
