import Medusa from '@medusajs/js-sdk'

export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

/**
 * Singleton Medusa JS SDK client initialized for GLOROV Storefront.
 * Uses only public storefront credentials. Never injects or requires Admin API keys.
 */
export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === 'development',
})

/**
 * Safe backend health check utility.
 * Can be used by server components or client UI to verify connectivity.
 */
export async function checkBackendHealth(): Promise<{
  healthy: boolean
  message: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(`${MEDUSA_BACKEND_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      return { healthy: true, message: 'Medusa v2 backend is online and healthy' }
    }
    return {
      healthy: false,
      message: `Backend returned status ${res.status}: ${res.statusText}`,
    }
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : 'Unknown network error'
    return {
      healthy: false,
      message: `Could not connect to backend at ${MEDUSA_BACKEND_URL} (${errorMsg})`,
    }
  }
}
