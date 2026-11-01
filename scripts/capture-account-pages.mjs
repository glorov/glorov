import { spawn } from 'node:child_process'
import { writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUTPUT_DIR = 'artifacts/pure-css-redesign'
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

mkdirSync(OUTPUT_DIR, { recursive: true })

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'desktop', width: 1920, height: 1080, isMobile: false },
]

const CUSTOMER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6ImN1c18wMU01WUtNMkExWjhFVko3R0dBVzZWTThYSiIsImFjdG9yX3R5cGUiOiJjdXN0b21lciIsImF1dGhfaWRlbnRpdHlfaWQiOiJhdXRoaWRfMDFNNVlLTTE5VEU2M1RaSEE2VEpTSjM4MFAiLCJhdXRoX3Byb3ZpZGVyIjoiZW1haWxwYXNzIiwibWZhX2VuYWJsZWQiOmZhbHNlLCJtZmFfY2hhbGxlbmdlX2NvbXBsZXRlZF9hdCI6bnVsbCwiYXBwX21ldGFkYXRhIjp7ImN1c3RvbWVyX2lkIjoiY3VzXzAxTTVZS00yQTFaOEVWSjdHR0FXNlZNOFhKIn0sInVzZXJfbWV0YWRhdGEiOnt9LCJpYXQiOjE3OTMxMDIzMTgsImV4cCI6MTc5MzE4ODcxOH0.BrQb7zXND5qJtffxvh458L6ilbGNc7ffxr3Cwp5Cn0U'

async function captureScreen({ slug, url, vp, port = 9980, scrollDelay = 2000 }) {
  const userDataDir = `/tmp/glr-acc-${slug}-${vp.name}-${Date.now()}`
  const fileName = `pure-css-${slug}-${vp.name}-${vp.width}x${vp.height}.png`
  const localPath = join(OUTPUT_DIR, fileName)
  const brainPath = join(BRAIN_DIR, fileName)

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${vp.width},${vp.height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ])

  let target = null
  for (let attempt = 0; attempt < 25; attempt++) {
    await new Promise((r) => setTimeout(r, 200))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    console.error('Failed to attach Chrome CDP for', slug, vp.name)
    chrome.kill('SIGKILL')
    return
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 1
  const pending = new Map()

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) reject(data.error)
      else resolve(data.result)
    }
  }

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  await new Promise((res) => { ws.onopen = res })
  await send('Page.enable')
  await send('Network.enable')
  await send('Runtime.enable')

  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    mobile: vp.isMobile,
  })

  // Set the glorov_customer_token cookie
  await send('Network.setCookie', {
    name: 'glorov_customer_token',
    value: CUSTOMER_TOKEN,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  })

  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, scrollDelay))

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const buf = Buffer.from(shot.data, 'base64')
  writeFileSync(localPath, buf)
  writeFileSync(brainPath, buf)
  console.log(`Saved screenshot: ${fileName}`)

  ws.close()
  chrome.kill('SIGKILL')
  await new Promise((r) => setTimeout(r, 300))
  try {
    rmSync(userDataDir, { recursive: true, force: true })
  } catch {}
}

async function main() {
  const routes = [
    { slug: 'account-dashboard', url: 'http://localhost:3000/account' },
    { slug: 'account-orders', url: 'http://localhost:3000/account/orders' },
    { slug: 'account-addresses', url: 'http://localhost:3000/account/addresses' },
    { slug: 'account-profile', url: 'http://localhost:3000/account/profile' },
  ]

  let basePort = 9981
  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      await captureScreen({
        slug: route.slug,
        url: route.url,
        vp,
        port: basePort++,
        scrollDelay: 2200,
      })
    }
  }

  console.log('All customer account screenshots captured successfully!')
}

main().catch(console.error)
