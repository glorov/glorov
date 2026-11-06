import { NextResponse } from 'next/server'
import { checkBackendHealth } from '../../../lib/api/health'
import { SITE_NAME } from '../../../lib/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 * Storefront operational health endpoint.
 * Verifies Node.js process and upstream Medusa backend connectivity.
 */
export async function GET() {
  const startTime = Date.now()
  const backendResult = await checkBackendHealth()

  const isHealthy = backendResult.success

  const mem = process.memoryUsage()

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: '@glorov/storefront',
      site: SITE_NAME,
      timestamp: new Date().toISOString(),
      uptime_seconds: process.uptime(),
      latency_ms: Date.now() - startTime,
      memory: {
        heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
        rss_mb: Math.round(mem.rss / 1024 / 1024),
      },
      upstream_backend: {
        connected: isHealthy,
        status: backendResult.status,
        details: backendResult.success ? backendResult.data : backendResult.error,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  )
}
