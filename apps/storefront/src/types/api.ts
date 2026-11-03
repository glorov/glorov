/**
 * API error response shape conforming to Medusa v2 error patterns.
 */
export interface ApiErrorResponse {
  message: string
  type?: string
  code?: string
  statusCode?: number
}

/**
 * Standard typed API result wrapper for safe error handling.
 */
export type ApiResult<T> =
  | { success: true; data: T; status: number }
  | { success: false; error: string; status: number; details?: unknown }

/**
 * Client request options for Medusa API calls.
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  authToken?: string
  revalidate?: number | false
  tags?: string[]
}
