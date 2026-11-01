import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/667b04b2-0f72-4a23-9f25-eebd01ed54cf'

mkdirSync(ARTIFACT_DIR, { recursive: true })

async function createChrome(port, width, height) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=/tmp/card-goal-${Date.now()}-${Math.random()}`,
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
    mobile: width < 768,
  })

  return {
    send,
    close: () => {
      try {
        ws.close()
      } catch {}
      chrome.kill('SIGTERM')
    },
  }
}

async function capture() {
  console.log('Capturing Desktop View...')
  const desktop = await createChrome(9240, 1440, 1080)
  await desktop.send('Page.navigate', { url: 'http://localhost:3005' })
  await new Promise((r) => setTimeout(r, 3500))

  // Scroll to catalog section
  await desktop.send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `,
  })
  await new Promise((r) => setTimeout(r, 1000))

  // Capture desktop catalog section
  const desktopShot = await desktop.send('Page.captureScreenshot', { format: 'png' })
  const desktopPath = path.join(ARTIFACT_DIR, 'product_card_desktop.png')
  writeFileSync(desktopPath, Buffer.from(desktopShot.data, 'base64'))
  console.log('Saved desktop screenshot:', desktopPath)
  desktop.close()

  console.log('Capturing Mobile View...')
  const mobile = await createChrome(9241, 390, 844)
  await mobile.send('Page.navigate', { url: 'http://localhost:3005' })
  await new Promise((r) => setTimeout(r, 3500))

  // Scroll to catalog section
  await mobile.send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `,
  })
  await new Promise((r) => setTimeout(r, 1000))

  const mobileShot = await mobile.send('Page.captureScreenshot', { format: 'png' })
  const mobilePath = path.join(ARTIFACT_DIR, 'product_card_mobile.png')
  writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'))
  console.log('Saved mobile screenshot:', mobilePath)
  mobile.close()

  console.log('Capturing PDP View (confirming favorite button is present when opening product)...')
  const pdp = await createChrome(9242, 1440, 1080)
  await pdp.send('Page.navigate', { url: 'http://localhost:3005/products/arugula-seeds-rocket-leaves' })
  await new Promise((r) => setTimeout(r, 3500))

  const pdpShot = await pdp.send('Page.captureScreenshot', { format: 'png' })
  const pdpPath = path.join(ARTIFACT_DIR, 'product_detail_favorite_button.png')
  writeFileSync(pdpPath, Buffer.from(pdpShot.data, 'base64'))
  console.log('Saved PDP screenshot:', pdpPath)
  pdp.close()

  console.log('All screenshots captured successfully!')
}

capture().catch((err) => {
  console.error('Capture error:', err)
  process.exit(1)
})
