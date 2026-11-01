import { spawn } from 'node:child_process'
import { writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUTPUT_DIR = 'artifacts/pure-css-redesign'
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

mkdirSync(OUTPUT_DIR, { recursive: true })

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: true },
  { name: 'laptop', width: 1280, height: 800, isMobile: false },
  { name: 'desktop', width: 1920, height: 1080, isMobile: false },
]

const TARGET_PAGES = [
  { slug: 'store', url: 'http://localhost:3000/store' },
  { slug: 'pdp', url: 'http://localhost:3000/products/peace-lily-plant' },
  { slug: 'cart', url: 'http://localhost:3000/cart' },
]

async function capture(pageConfig, vp, port = 9960) {
  const userDataDir = `/tmp/glr-pure-css-${pageConfig.slug}-${vp.name}-${Date.now()}`
  const fileName = `pure-css-${pageConfig.slug}-${vp.name}-${vp.width}x${vp.height}.png`
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
    console.error('Failed to attach Chrome CDP for', pageConfig.slug, vp.name)
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    mobile: vp.isMobile,
  })

  await send('Page.navigate', { url: pageConfig.url })
  await new Promise((r) => setTimeout(r, 3000))

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const buf = Buffer.from(shot.data, 'base64')
  writeFileSync(localPath, buf)
  writeFileSync(brainPath, buf)
  console.log(`Saved screenshot: ${fileName}`)

  ws.close()
  chrome.kill('SIGKILL')
  await new Promise((r) => setTimeout(r, 400))
  try {
    rmSync(userDataDir, { recursive: true, force: true })
  } catch {}
}

async function main() {
  let port = 9961
  for (const pageConfig of TARGET_PAGES) {
    for (const vp of VIEWPORTS) {
      await capture(pageConfig, vp, port++)
    }
  }
  console.log('All responsive screenshots completed successfully!')
}

main().catch(console.error)
