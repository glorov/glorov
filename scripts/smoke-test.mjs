#!/usr/bin/env node

/**
 * GLOROV Post-Deployment Smoke Test Suite
 * Validates backend runtime endpoints, health probes, catalog availability,
 * and Flutter/Admin web availability without modifying data.
 *
 * Usage:
 *   node scripts/smoke-test.mjs [backend_url] [web_url]
 * Default:
 *   backend_url: http://localhost:9000
 *   web_url:     https://glorov-store.web.app
 */

const backendUrl = (process.argv[2] || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000').replace(/\/$/, '')
const webUrl = (process.argv[3] || process.env.STOREFRONT_URL || process.env.FLUTTER_WEB_URL || 'https://glorov-store.web.app').replace(/\/$/, '')
const publishableKey = process.env.MEDUSA_PUBLISHABLE_KEY || process.env.STORE_PUBLISHABLE_KEY || 'pk_2550b4af7f0ff9f2f1ff1b5f9b16c11e753ba1b574d55e1d9221d496085a7ef8'
const authHeaders = publishableKey ? { 'x-publishable-api-key': publishableKey } : {}

console.log('🌿 [GLOROV] Initiating Smoke Test Suite...')
console.log(`📡 Backend Target:  ${backendUrl}`)
console.log(`📱 Web Target:      ${webUrl}`)
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

  // 2. Correlation ID & Response Header Verification
  await runCheck('Backend Correlation ID Echo', async () => {
    const testCid = `glr_smoke_test_${Date.now()}`
    const res = await fetchWithTimeout(`${backendUrl}/health`, {
      headers: { 'x-correlation-id': testCid },
    })
    const returnedCid = res.headers.get('x-correlation-id')
    if (returnedCid && returnedCid !== testCid) {
      throw new Error(`Expected x-correlation-id "${testCid}" but got "${returnedCid}"`)
    }
  })

  // 3. Medusa Admin Dashboard Route
  await runCheck('Medusa Admin Dashboard (/app)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/app`)
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 for Admin Dashboard but received ${res.status}`)
    }
  })

  // 4. Botanical Product Catalog API
  await runCheck('Botanical Product Catalog (/store/products)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/store/products?limit=5`, {
      headers: { ...authHeaders },
    })
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data.products) || data.products.length === 0) {
      throw new Error(`Expected at least one product, received: ${JSON.stringify(data)}`)
    }
  })

  // 5. Promotional Offers API
  await runCheck('Promotional Offers API (/store/offers)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/store/offers`, {
      headers: { ...authHeaders },
    })
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data.offers)) {
      throw new Error('Offers payload does not contain an offers array')
    }
  })

  // 6. Hero Banners API
  await runCheck('Hero Banners API (/store/banners)', async () => {
    const res = await fetchWithTimeout(`${backendUrl}/store/banners`, {
      headers: { ...authHeaders },
    })
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data.banners)) {
      throw new Error('Banners payload does not contain a banners array')
    }
  })

  console.log('------------------------------------------------------------')
  console.log(`📊 Smoke Test Summary: ${passedChecks}/${totalChecks} checks passed.`)

  if (failedChecks > 0) {
    console.error(`❌ Post-deployment smoke tests failed with ${failedChecks} errors!`)
    process.exit(1)
  } else {
    console.log('✅ All smoke checks verified successfully! Platform is operational.')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error(`💥 Fatal smoke test runner error: ${err.message}`)
  process.exit(1)
})
