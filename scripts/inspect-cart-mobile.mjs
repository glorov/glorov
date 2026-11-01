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
    `--user-data-dir=/tmp/cart-inspect-${Date.now()}-${Math.random()}`,
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

  await new Promise((r) => { ws.onopen = r })
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 600,
  })

  return { chrome, ws, send }
}

async function inspectCart() {
  const port = 9993
  const client = await createChrome(port, 390, 844)
  try {
    await client.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 1200))

    // Seed sample item
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const sampleItem = {
          id: 'seed-cosmos-1',
          title: 'Cosmos Mix Seeds',
          subtitle: '1 gm',
          variant_title: '1 gm',
          product_title: 'Cosmos Mix Seeds',
          product_handle: 'cosmos-mix-seeds',
          handle: 'cosmos-mix-seeds',
          thumbnail: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
          unit_price: 9900,
          quantity: 3,
          pack_size: '1 gm'
        };
        localStorage.setItem('glorov_cart', JSON.stringify([sampleItem]));
        localStorage.setItem('glorov_cart_cache', JSON.stringify([sampleItem]));
        window.location.reload();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 2000))

    const shot1 = await client.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(ARTIFACT_DIR, 'current_cart_page_mobile_top.png'), Buffer.from(shot1.data, 'base64'))

    await client.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 400, behavior: 'instant' });`,
    })
    await new Promise((r) => setTimeout(r, 800))

    const shot2 = await client.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(ARTIFACT_DIR, 'current_cart_page_mobile_middle.png'), Buffer.from(shot2.data, 'base64'))

    await client.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 900, behavior: 'instant' });`,
    })
    await new Promise((r) => setTimeout(r, 800))

    const shot3 = await client.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(ARTIFACT_DIR, 'current_cart_page_mobile_bottom.png'), Buffer.from(shot3.data, 'base64'))

    console.log('Saved inspection screenshots')
  } finally {
    client.ws.close()
    client.chrome.kill('SIGTERM')
  }
}

inspectCart().catch((err) => {
  console.error(err)
  process.exit(1)
})
