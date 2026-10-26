import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { metricsCollector } from '../../../../utils/metrics-collector'

/**
 * GET /admin/health/metrics
 * Exposes internal operational telemetry, request error counts, p95 latency,
 * and active threshold breach alerts for administrative scraping and alerting.
 */
export const GET = async (
  _req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const snapshot = metricsCollector.getSnapshot()
  res.status(200).json(snapshot)
}
