import Medusa from '@medusajs/js-sdk'

export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

/**
 * Singleton Medusa v2 JS SDK client initialized for GLOROV Storefront.
 * Uses only public storefront credentials. Never injects or requires Admin API keys.
 * If publishableKey is not configured or is empty, passes undefined to avoid
 * triggering 400 Bad Request on empty header values.
 */
export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY.trim() || undefined,
  debug: process.env.NODE_ENV === 'development',
})

export interface BackendHealthResult {
  healthy: boolean
  latencyMs?: number
  message: string
  status?: number
}

/**
 * Safe backend health check utility.
 * Verifies connectivity to the Medusa v2 backend and reports latency.
 */
export async function checkBackendHealth(
  timeoutMs: number = 3000
): Promise<BackendHealthResult> {
  const startTime = Date.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(`${MEDUSA_BACKEND_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)
    const latencyMs = Date.now() - startTime

    if (res.ok) {
      return {
        healthy: true,
        latencyMs,
        status: res.status,
        message: 'Medusa v2 backend is online and healthy',
      }
    }
    return {
      healthy: false,
      latencyMs,
      status: res.status,
      message: `Backend returned status ${res.status}: ${res.statusText}`,
    }
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime
    const errorMsg =
      error instanceof Error ? error.message : 'Unknown network error'
    return {
      healthy: false,
      latencyMs,
      message: `Could not connect to backend at ${MEDUSA_BACKEND_URL} (${errorMsg})`,
    }
  }
}
