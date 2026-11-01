import { spawn } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_OUTPUT_DIR = 'artifacts/glorov-seeded'
const BRAIN_ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

const VIEWPORTS = [
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
  { name: 'laptop', width: 1280, height: 800, isMobile: false },
  { name: 'desktop', width: 1920, height: 1080, isMobile: false },
]

async function capture(vp, port = 9940) {
  const userDataDir = `/tmp/glorov-store-${port}-${Date.now()}`
  const fileName = `glorov-store-${vp.name}-${vp.width}x${vp.height}.png`
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
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })

  await new Promise((r) => { ws.onopen = r })
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    mobile: vp.isMobile,
  })
  await send('Page.navigate', { url: 'http://localhost:3000/store' })
  await new Promise((r) => setTimeout(r, 3000))
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const buf = Buffer.from(shot.data, 'base64')
  writeFileSync(localPath, buf)
  writeFileSync(brainPath, buf)
  console.log(`Saved: ${fileName}`)
  ws.close()
  chrome.kill('SIGKILL')
  rmSync(userDataDir, { recursive: true, force: true })
}

async function main() {
  for (const vp of VIEWPORTS) {
    await capture(vp)
  }
}
main()
