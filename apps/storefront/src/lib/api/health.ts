import { apiFetch } from './client'
import type { ApiResult } from '../../types/api'
import type { OperationalHealthResult } from '@glorov/types'

/**
 * Checks connectivity and readiness of the Medusa commerce backend.
 *
 * @returns ApiResult with OperationalHealthResult details from /store/health
 */
export async function checkBackendHealth(): Promise<ApiResult<OperationalHealthResult>> {
  return apiFetch<OperationalHealthResult>('/store/health', {
    method: 'GET',
    revalidate: 0, // Never cache health checks
  })
}
