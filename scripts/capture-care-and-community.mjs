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

async function captureScreen({ slug, url, vp, port, scrollDelay = 2200 }) {
  const userDataDir = `/tmp/glr-snap-${slug}-${vp.name}-${Date.now()}`
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
    '--remote-debugging-address=127.0.0.1',
    '--remote-allow-origins=*',
    'about:blank',
  ])

  let target = null
  for (let attempt = 0; attempt < 50; attempt++) {
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

  await new Promise((resolve) => {
    if (ws.readyState === WebSocket.OPEN) resolve()
    else ws.onopen = resolve
  })

  await send('Page.enable')
  await send('DOM.enable')
  await send('Network.enable')

  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    mobile: vp.isMobile,
  })

  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, scrollDelay))

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  })

  const buffer = Buffer.from(screenshot.data, 'base64')
  writeFileSync(localPath, buffer)
  try {
    writeFileSync(brainPath, buffer)
  } catch {}

  console.log(`[PASS] Saved screenshot: ${fileName}`)

  ws.close()
  chrome.kill('SIGTERM')
  await new Promise((r) => setTimeout(r, 300))
  try {
    rmSync(userDataDir, { recursive: true, force: true })
  } catch {}
}

async function main() {
  const pages = [
    { slug: 'care-companion', url: 'http://localhost:3000/care-companion' },
    { slug: 'community', url: 'http://localhost:3000/community' },
  ]

  let port = 9560

  for (const page of pages) {
    console.log(`\nCapturing ${page.slug} (${page.url})...`)
    for (const vp of VIEWPORTS) {
      await captureScreen({
        slug: page.slug,
        url: page.url,
        vp,
        port: port++,
        scrollDelay: 2500,
      })
    }
  }

  console.log('\nAll care-companion and community screenshots captured successfully!')
}

main().catch((err) => {
  console.error('Fatal capture error:', err)
  process.exit(1)
})
