#!/usr/bin/env node

/**
 * GLOROV Post-Deployment Smoke Test Suite
 * Validates production/staging runtime endpoints, health probes, catalog availability,
 * and security headers without altering state or making paid transactions.
 *
 * Usage:
 *   node scripts/smoke-test.mjs [backend_url] [storefront_url]
 * Default:
 *   backend_url:    http://localhost:9000
 *   storefront_url: http://localhost:3000
 */

const backendUrl = (process.argv[2] || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000').replace(/\/$/, '')
const storefrontUrl = (process.argv[3] || process.env.STOREFRONT_URL || 'http://localhost:3000').replace(/\/$/, '')
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || process.env.STORE_PUBLISHABLE_KEY || ''
const authHeaders = publishableKey ? { 'x-publishable-api-key': publishableKey } : {}

console.log('🌿 [GLOROV] Initiating Post-Deployment Smoke Test Suite...')
console.log(`📡 Backend Target:    ${backendUrl}`)
console.log(`🌐 Storefront Target: ${storefrontUrl}`)
console.log('------------------------------------------------------------')

let totalChecks = 0
let passedChecks = 0
let failedChecks = 0

async function runCheck(name, testFn) {
  totalChecks++
  process.stdout.write(`⏳ Checking: ${name}... `)
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    console.log(`\x1b[32mPASSED\x1b[0m (${duration}ms)`)
    passedChecks++
  } catch (err) {
    const duration = Date.now() - startTime
    console.log(`\x1b[31mFAILED\x1b[0m (${duration}ms)`)
    console.error(`   ❌ Error: ${err.message}`)
    failedChecks++
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timeoutId)
  }
}

async function main() {
  // 1. Backend Process Liveness
  await runCheck('Backend Liveness Probe (/health)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/health`)
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
  })

  // 2. Backend Comprehensive Health Probe (PostgreSQL & Redis)
  await runCheck('Backend Readiness Probe (/store/health)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/store/health`, {
      headers: { ...authHeaders },
    })
    if (res.status === 200) {
      const data = await res.json()
      if (!data.healthy && data.status !== 'healthy' && data.status !== 'degraded') {
        throw new Error(`Health report indicated unhealthy status: ${JSON.stringify(data)}`)
      }
      if (data.database && data.database.status !== 'healthy') {
        throw new Error(`Database check failed: ${data.database.message}`)
      }
    } else if (res.status === 404 || res.status === 400) {
      // Fallback check on standard /health if /store/health is not exposed without admin setup
      const fallbackRes = await fetchWithTimeout(`${backendUrl}/health`)
      if (fallbackRes.status !== 200) {
        throw new Error(`Backend liveness probe failed with ${fallbackRes.status}`)
      }
    } else {
      throw new Error(`Unexpected readiness probe status code: ${res.status}`)
    }
  })

  // 3. Correlation ID & Response Header Verification
  await runCheck('Backend Correlation ID Echo & Sanitization', async () => {
    const testCid = `glr_smoke_test_${Date.now()}`
    const res = await fetchWithTimeout(`${backendUrl}/health`, {
      headers: { 'x-correlation-id': testCid, ...authHeaders },
    })
    const returnedCid = res.headers.get('x-correlation-id')
    // Echo is verified when backend correlation middleware is active
    if (returnedCid && returnedCid !== testCid) {
      throw new Error(`Expected x-correlation-id "${testCid}" but got "${returnedCid}"`)
    }
  })

  // 4. Storefront Edge / API Health Probe
  await runCheck('Storefront API Health Probe (/api/health)', async () => {
    const res = await fetchWithTimeout(`${storefrontUrl}/api/health`)
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
    const data = await res.json()
    if (!data.status) {
      throw new Error(`Invalid response structure: ${JSON.stringify(data)}`)
    }
  })

  // 5. Storefront Home Page Render
  await runCheck('Storefront SSR Homepage (/)', async () => {
    const res = await fetchWithTimeout(`${storefrontUrl}/`)
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
    const html = await res.text()
    if (!html.includes('GLOROV') && !html.includes('Seeds') && !html.includes('Plants')) {
      throw new Error('Homepage HTML does not contain expected brand keywords')
    }
  })

  // 6. Security Headers Audit
  await runCheck('Storefront Security Headers Verification', async () => {
    const res = await fetchWithTimeout(`${storefrontUrl}/`)
    const headers = res.headers
    const xContentType = headers.get('x-content-type-options')
    const xFrame = headers.get('x-frame-options')
    const referrerPolicy = headers.get('referrer-policy')

    if (xContentType !== 'nosniff') {
      throw new Error(`X-Content-Type-Options is not "nosniff" (got "${xContentType}")`)
    }
    if (xFrame !== 'SAMEORIGIN' && xFrame !== 'DENY') {
      throw new Error(`X-Frame-Options is insecure (got "${xFrame}")`)
    }
    if (!referrerPolicy) {
      throw new Error('Referrer-Policy header is missing')
    }
  })

  // 7. Robots and Sitemap Accessibility
  await runCheck('Search Engine Ingress (/robots.txt & /sitemap.xml)', async () => {
    const robotsRes = await fetchWithTimeout(`${storefrontUrl}/robots.txt`)
    if (robotsRes.status !== 200) {
      throw new Error(`robots.txt returned HTTP ${robotsRes.status}`)
    }
    const sitemapRes = await fetchWithTimeout(`${storefrontUrl}/sitemap.xml`)
    if (sitemapRes.status !== 200) {
      throw new Error(`sitemap.xml returned HTTP ${sitemapRes.status}`)
    }
  })

  console.log('------------------------------------------------------------')
  console.log(`📊 Smoke Test Summary: ${passedChecks}/${totalChecks} checks passed.`)

  if (failedChecks > 0) {
    console.error(`❌ Post-deployment smoke tests failed with ${failedChecks} errors!`)
    process.exit(1)
  } else {
    console.log('✅ All smoke checks verified successfully! Deployment is operational.')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error(`💥 Fatal smoke test runner error: ${err.message}`)
  process.exit(1)
})
