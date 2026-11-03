import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../constants'
import type { ApiRequestOptions, ApiResult } from '../../types/api'

/**
 * Custom error class for API failures preserving HTTP status and message.
 */
export class MedusaApiError extends Error {
  public readonly status: number
  public readonly details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'MedusaApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Builds a query string from a parameters record, omitting undefined/null values.
 */
function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

/**
 * Low-level typed fetch wrapper for communicating with the Medusa v2 backend.
 * Never uses `any`. Handles JSON parsing, network errors, and status codes safely.
 *
 * @template T - Expected response payload type.
 * @param endpoint - Endpoint relative path (e.g. "/store/products" or "/store/health").
 * @param options - Request options including method, body, auth, and Next.js revalidation.
 * @returns Resolves with typed ApiResult.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const {
    body,
    params,
    authToken,
    headers: customHeaders,
    revalidate,
    tags,
    ...restOptions
  } = options

  const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const queryString = buildQueryString(params)
  const fullUrl = `${baseUrl}${cleanEndpoint}${queryString}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = MEDUSA_PUBLISHABLE_KEY
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  if (customHeaders) {
    const entries =
      customHeaders instanceof Headers
        ? Array.from(customHeaders.entries())
        : Array.isArray(customHeaders)
        ? customHeaders
        : Object.entries(customHeaders)

    for (const [k, v] of entries) {
      if (typeof v === 'string') {
        headers[k] = v
      }
    }
  }

  // Construct Next.js specific cache/revalidation config
  const nextConfig: { revalidate?: number | false; tags?: string[] } = {}
  if (revalidate !== undefined) {
    nextConfig.revalidate = revalidate
  }
  if (tags && tags.length > 0) {
    nextConfig.tags = tags
  }

  const fetchInit: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...restOptions,
    headers,
    ...(Object.keys(nextConfig).length > 0 ? { next: nextConfig } : {}),
  }

  if (body !== undefined) {
    fetchInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(fullUrl, fetchInit)
    const status = response.status

    let responseData: unknown = null
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      const text = await response.text()
      responseData = text ? { raw: text } : null
    }

    if (!response.ok) {
      let errorMessage = `API request failed with status ${status}`
      if (
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof (responseData as Record<string, unknown>).message === 'string'
      ) {
        errorMessage = (responseData as { message: string }).message
      }

      return {
        success: false,
        error: errorMessage,
        status,
        details: responseData,
      }
    }

    return {
      success: true,
      data: responseData as T,
      status,
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown network or fetch error'

    return {
      success: false,
      error: errorMessage,
      status: 0,
      details: error,
    }
  }
}
