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
    `--user-data-dir=/tmp/cart-verify-suite-${Date.now()}-${Math.random()}`,
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

async function captureScreen(client, filename) {
  const shot = await client.send('Page.captureScreenshot', { format: 'png' })
  const filepath = path.join(ARTIFACT_DIR, filename)
  writeFileSync(filepath, Buffer.from(shot.data, 'base64'))
  console.log(`Saved screenshot: ${filename}`)
  return filepath
}

async function main() {
  // 1. Mobile Cart Page State 1: 3 qty Cosmos Mix Seeds (Subtotal ₹297 -> Add ₹202 for Free Delivery)
  console.log('--- 1. Capturing Mobile Cart Page (State 1: Free Delivery Target) ---')
  const clientMobile = await createChrome(9971, 390, 844)
  try {
    await clientMobile.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 1000))

    await clientMobile.send('Runtime.evaluate', {
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
          quantity: 3,
          pack_size: '1 gm'
        };
        localStorage.setItem('glorov_cart', JSON.stringify([item1]));
        localStorage.setItem('glorov_cart_cache', JSON.stringify([item1]));
        localStorage.removeItem('glorov_applied_coupon');
      })()`,
    })

    await clientMobile.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 2500))
    await captureScreen(clientMobile, 'cart_redesign_mobile_state1_free_delivery.png')

    // 2. Mobile Cart Page State 2: 7 qty (Subtotal ₹693 -> Add ₹306 for 10% off)
    console.log('--- 2. Capturing Mobile Cart Page (State 2: 10% Off Target) ---')
    await clientMobile.send('Runtime.evaluate', {
      expression: `(() => {
        const items = JSON.parse(localStorage.getItem('glorov_cart_cache') || '[]');
        if (items.length > 0) items[0].quantity = 7;
        localStorage.setItem('glorov_cart', JSON.stringify(items));
        localStorage.setItem('glorov_cart_cache', JSON.stringify(items));
      })()`,
    })
    await clientMobile.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 2500))
    await captureScreen(clientMobile, 'cart_redesign_mobile_state2_10pct_target.png')

    // 3. Mobile Cart Page State 3: Coupon Applied (DIWALI10, 12 qty, Subtotal ₹1,188)
    console.log('--- 3. Capturing Mobile Cart Page (State 3: Coupon Applied) ---')
    await clientMobile.send('Runtime.evaluate', {
      expression: `(() => {
        const items = JSON.parse(localStorage.getItem('glorov_cart_cache') || '[]');
        if (items.length > 0) items[0].quantity = 12;
        localStorage.setItem('glorov_cart', JSON.stringify(items));
        localStorage.setItem('glorov_cart_cache', JSON.stringify(items));
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
    await clientMobile.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 2500))
    await captureScreen(clientMobile, 'cart_redesign_mobile_state3_coupon_applied.png')

    // 4. Mobile Offers Roadmap Drawer Open
    console.log('--- 4. Capturing Mobile Available Offers Roadmap Drawer ---')
    await clientMobile.send('Runtime.evaluate', {
      expression: `(() => {
        const viewAllBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('View all coupons') || el.textContent.includes('Available Offers Roadmap'));
        if (viewAllBtn) viewAllBtn.click();
      })()`,
    })
    await new Promise((r) => setTimeout(r, 1200))
    await captureScreen(clientMobile, 'cart_redesign_mobile_state4_available_offers_drawer.png')
  } finally {
    clientMobile.ws.close()
    clientMobile.chrome.kill('SIGTERM')
  }

  // 5. Desktop Cart Page (1280 x 850)
  console.log('--- 5. Capturing Desktop Cart Page (1280x850) ---')
  const clientDesktop = await createChrome(9972, 1280, 850)
  try {
    await clientDesktop.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 1000))

    await clientDesktop.send('Runtime.evaluate', {
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
          quantity: 7,
          pack_size: '1 gm'
        };
        localStorage.setItem('glorov_cart', JSON.stringify([item1]));
        localStorage.setItem('glorov_cart_cache', JSON.stringify([item1]));
        const coupon = {
          code: 'DIWALI10',
          title: '10% OFF',
          discount_type: 'percentage',
          discount_value: 10,
          discount_amount: 69,
          min_spend: 999,
          terms: 'Not applicable on hamper products'
        };
        localStorage.setItem('glorov_applied_coupon', JSON.stringify(coupon));
      })()`,
    })

    await clientDesktop.send('Page.navigate', { url: 'http://localhost:3002/cart' })
    await new Promise((r) => setTimeout(r, 2500))
    await captureScreen(clientDesktop, 'cart_redesign_desktop_fullpage.png')
  } finally {
    clientDesktop.ws.close()
    clientDesktop.chrome.kill('SIGTERM')
  }

  console.log('All verification screenshots captured successfully!')
}

main().catch(console.error)
