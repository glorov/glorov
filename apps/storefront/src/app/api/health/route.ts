import { NextRequest, NextResponse } from 'next/server'
import { checkBackendHealth } from '@/lib/medusa-client'
import { extractOrGenerateCorrelationId } from '@glorov/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * Comprehensive storefront operational health and readiness check.
 * Distinguishes local storefront process health from backend availability,
 * preventing restart storms on transient backend hiccups.
 */
export async function GET(request: NextRequest) {
  const correlationId = extractOrGenerateCorrelationId(
    request.headers.get('x-correlation-id') || request.headers.get('x-request-id')
  )

  const processUptime = process.uptime()
  const memoryUsage = process.memoryUsage()

  const backendHealth = await checkBackendHealth(3000)
  const isDegraded = !backendHealth.healthy

  const responsePayload = {
    status: isDegraded ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    correlation_id: correlationId,
    storefront: {
      status: 'healthy',
      uptime_seconds: Math.floor(processUptime),
      memory: {
        rss_mb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heap_used_mb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'development',
    },
    backend: {
      healthy: backendHealth.healthy,
      status: backendHealth.status,
      latency_ms: backendHealth.latencyMs,
      message: backendHealth.message,
    },
  }

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      'x-correlation-id': correlationId,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
