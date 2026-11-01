import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_OUTPUT_DIR = 'artifacts/redesigned-homepage'

mkdirSync(BASE_OUTPUT_DIR, { recursive: true })

async function captureFullPage(name, width, height, isMobile, port = 9960) {
  const userDataDir = `/tmp/glr-fullpage-${port}-${Date.now()}`
  const fileName = `redesigned-fullpage-${name}-${width}.png`
  const localPath = join(BASE_OUTPUT_DIR, fileName)

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
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
    width,
    height,
    deviceScaleFactor: 1,
    mobile: isMobile,
  })
  await send('Page.navigate', { url: 'http://localhost:3000/' })
  await new Promise((r) => setTimeout(r, 4000))
  
  const layoutMetrics = await send('Page.getLayoutMetrics')
  const contentHeight = Math.ceil(layoutMetrics.contentSize.height)
  
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width,
      height: Math.min(contentHeight, 5000),
      scale: 1,
    }
  })
  const buf = Buffer.from(shot.data, 'base64')
  writeFileSync(localPath, buf)
  console.log(`Saved fullpage: ${fileName} (${(buf.length / 1024).toFixed(1)} KB)`)
  try {
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 })
  } catch {}
}

async function captureFooter(width = 1440, height = 900, port = 9965) {
  const userDataDir = `/tmp/glr-footer-${port}-${Date.now()}`
  const fileName = `redesigned-footer-desktop-1440.png`
  const localPath = join(BASE_OUTPUT_DIR, fileName)

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
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
  await send('Page.navigate', { url: 'http://localhost:3000/' })
  await new Promise((r) => setTimeout(r, 4000))
  
  const layoutMetrics = await send('Page.getLayoutMetrics')
  const contentHeight = Math.ceil(layoutMetrics.contentSize.height)
  
  // Capture bottom 1200px (the WhatsApp banner and footer)
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: Math.max(0, contentHeight - 1200),
      width,
      height: 1200,
      scale: 1,
    }
  })
  const buf = Buffer.from(shot.data, 'base64')
  writeFileSync(localPath, buf)
  console.log(`Saved footer: ${fileName} (${(buf.length / 1024).toFixed(1)} KB)`)
  ws.close()
  chrome.kill('SIGKILL')
  try {
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 })
  } catch {}
}

async function main() {
  await captureFooter()
}
main()
