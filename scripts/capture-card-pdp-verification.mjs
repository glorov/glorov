import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373'

mkdirSync(ARTIFACT_DIR, { recursive: true })

async function createChrome(port, width, height) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=/tmp/card-verify-${Date.now()}-${Math.random()}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ])

  let target = null
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 200))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target?.webSocketDebuggerUrl) {
    chrome.kill('SIGTERM')
    throw new Error('Chrome remote debugging connection failed')
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

  await new Promise((r) => {
    ws.onopen = r
  })

  const send = (method, params = {}) => {
    const msgId = id++
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  await send('Page.enable')
  await send('DOM.enable')
  await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 600,
  })

  return { chrome, send, ws }
}

async function captureScreenshot(url, filename, width, height, scrollY = 0) {
  const port = 9330 + Math.floor(Math.random() * 50)
  const session = await createChrome(port, width, height)
  try {
    await session.send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 2500))

    if (scrollY > 0) {
      await session.send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: ${scrollY}, behavior: 'instant' });`,
      })
      await new Promise((r) => setTimeout(r, 800))
    }

    const { data } = await session.send('Page.captureScreenshot', {
      format: 'png',
    })

    const filePath = path.join(ARTIFACT_DIR, filename)
    writeFileSync(filePath, Buffer.from(data, 'base64'))
    console.log(`Saved screenshot to: ${filePath}`)
  } finally {
    session.ws.close()
    session.chrome.kill('SIGTERM')
  }
}

async function main() {
  console.log('Capturing catalog store desktop (no hearts, transparent rating, equal height)...')
  await captureScreenshot('http://localhost:3002/store', 'product_card_redesign_catalog_desktop.png', 1280, 850, 220)

  console.log('Capturing catalog store mobile...')
  await captureScreenshot('http://localhost:3002/store', 'product_card_redesign_catalog_mobile.png', 390, 844, 250)

  console.log('Capturing PDP desktop (favorite button visible next to CTA)...')
  await captureScreenshot('http://localhost:3002/products/peace-lily-plant', 'pdp_favorite_button_desktop.png', 1280, 850, 100)

  console.log('Capturing PDP mobile (favorite button visible next to CTA & sticky bar)...')
  await captureScreenshot('http://localhost:3002/products/peace-lily-plant', 'pdp_favorite_button_mobile.png', 390, 844, 450)

  console.log('All screenshots captured successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
