import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373'

async function createChrome(port, width, height) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=/tmp/scroll-${Date.now()}`,
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
    mobile: true,
  })

  return { chrome, ws, send }
}

async function main() {
  const client = await createChrome(9965, 390, 844)
  try {
    await client.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 1000))

    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const item1 = {
          id: 'seed-cosmos-1',
          title: 'Cosmos Mix Seeds',
          subtitle: '1 gm',
          variant_title: '1 gm',
          product_title: 'Cosmos Mix Seeds',
          product_handle: 'cosmos-mix-seeds',
          handle: 'cosmos-mix-seeds',
          thumbnail: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
          unit_price: 9900,
          quantity: 12,
          pack_size: '1 gm'
        };
        localStorage.setItem('glorov_cart', JSON.stringify([item1]));
        localStorage.setItem('glorov_cart_cache', JSON.stringify([item1]));
        const coupon = {
          code: 'DIWALI10',
          title: '10% OFF',
          discount_type: 'percentage',
          discount_value: 10,
          discount_amount: 119,
          min_spend: 999,
          terms: 'Not applicable on hamper products'
        };
        localStorage.setItem('glorov_applied_coupon', JSON.stringify(coupon));
      })()`,
    })

    await client.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 2000))

    // Scroll down to show recommendations, coupon card, and trust strip
    await client.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 380, behavior: 'instant' });`,
    })
    await new Promise((r) => setTimeout(r, 800))

    const shot = await client.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(ARTIFACT_DIR, 'cart_redesign_mobile_coupon_and_trust_strip.png'), Buffer.from(shot.data, 'base64'))
    console.log('Saved cart_redesign_mobile_coupon_and_trust_strip.png')
  } finally {
    client.ws.close()
    client.chrome.kill('SIGTERM')
  }
}

main().catch(console.error)
