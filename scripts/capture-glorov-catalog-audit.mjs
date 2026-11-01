import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_OUTPUT_DIR = 'artifacts/glorov-seeded'
const BRAIN_ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

const PAGES = [
  { name: 'homepage', url: 'http://localhost:3000/' },
  { name: 'store', url: 'http://localhost:3000/store' },
  { name: 'collection-flower', url: 'http://localhost:3000/categories/flower-seeds' },
  { name: 'pdp-chrysanthemum', url: 'http://localhost:3000/products/chrysanthemum-mix-guldaudi-seeds' },
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
  { name: 'laptop', width: 1280, height: 800, isMobile: false },
  { name: 'desktop', width: 1920, height: 1080, isMobile: false },
]

mkdirSync(BASE_OUTPUT_DIR, { recursive: true })

async function captureGlorov({ url, pageName, vp, port = 9930 }) {
  const userDataDir = `/tmp/glorov-chrome-${port}-${Date.now()}`
  const fileName = `glorov-${pageName}-${vp.name}-${vp.width}x${vp.height}.png`
  const localPath = join(BASE_OUTPUT_DIR, fileName)
  const brainPath = join(BRAIN_ARTIFACT_DIR, fileName)

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
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((r) => setTimeout(r, 300))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    return null
  }

  try {
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

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++
        pending.set(msgId, { resolve, reject })
        ws.send(JSON.stringify({ id: msgId, method, params }))
      })
    }

    await new Promise((res) => { ws.onopen = res })

    await send('Page.enable')
    await send('Runtime.enable')

    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.isMobile,
    })

    await send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 3500))

    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    writeFileSync(localPath, buf)
    writeFileSync(brainPath, buf)
    console.log(`Saved: ${fileName} (${(buf.length / 1024).toFixed(1)} KB)`)

    ws.close()
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    return localPath
  } catch (err) {
    console.error(`Error capturing ${fileName}:`, err.message)
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    return null
  }
}

async function main() {
  console.log('=== CAPTURING GLOROV 4-DEVICE MATRIX ===')
  for (const p of PAGES) {
    for (const vp of VIEWPORTS) {
      await captureGlorov({ url: p.url, pageName: p.name, vp })
    }
  }
  console.log('=== GLOROV CAPTURE COMPLETED ===')
}

main().catch(console.error)
