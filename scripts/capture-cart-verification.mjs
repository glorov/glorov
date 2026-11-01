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
    `--user-data-dir=/tmp/cart-verify-${Date.now()}-${Math.random()}`,
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

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  await new Promise((res) => { ws.onopen = res })
  await send('Page.enable')
  await send('Runtime.enable')

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
  const port = 9996

  // 1. Mobile verification (390 x 844) - exactly matching User's Screenshots 1, 2, 3, 4
  console.log('--- Testing Mobile Cart Drawer (390x844) ---')
  const mobile = await createChrome(port, 390, 844)

  // Navigate to store page
  await mobile.send('Page.navigate', { url: 'http://localhost:3002/' })
  await new Promise((r) => setTimeout(r, 1500))

  // State 1: Cosmos Mix Seeds (3 qty) -> "Add ₹202 more to unlock free delivery" (matches Screenshot 1)
  await mobile.send('Runtime.evaluate', {
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
      localStorage.removeItem('glorov_applied_coupon');
      window.location.reload();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 1500))

  // Open Cart Drawer
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      // Find cart toggle button
      const cartBtn = document.querySelector('button[aria-label*="cart" i], button[aria-label*="Cart" i]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cart') || b.querySelector('svg'));
      if (cartBtn) cartBtn.click();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 800))
  await captureScreen(mobile, 'cart_drawer_state1_3qty_unlock_freeship_mobile.png')

  // State 2: Cosmos Mix Seeds (7 qty) -> "Add ₹306 more to unlock 10% off" (matches Screenshot 2)
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      const items = JSON.parse(localStorage.getItem('glorov_cart_cache') || '[]');
      if (items.length > 0) items[0].quantity = 7;
      localStorage.setItem('glorov_cart', JSON.stringify(items));
      localStorage.setItem('glorov_cart_cache', JSON.stringify(items));
      window.location.reload();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 1500))
  // Re-open drawer
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      const cartBtn = document.querySelector('button[aria-label*="cart" i]');
      if (cartBtn) cartBtn.click();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 800))
  await captureScreen(mobile, 'cart_drawer_state2_7qty_unlock_10pct_mobile.png')

  // State 3: Cosmos Mix Seeds (12 qty) + DIWALI10 Applied -> "Add ₹411 more to unlock 15% off" (matches Screenshot 3 & 5)
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      const items = JSON.parse(localStorage.getItem('glorov_cart_cache') || '[]');
      if (items.length > 0) items[0].quantity = 12;
      localStorage.setItem('glorov_cart', JSON.stringify(items));
      localStorage.setItem('glorov_cart_cache', JSON.stringify(items));
      localStorage.setItem('glorov_applied_coupon', JSON.stringify({
        code: 'DIWALI10',
        title: '10% OFF',
        description: 'On orders above ₹999',
        discount_type: 'percentage',
        discount_value: 10,
        value: 10,
        min_spend: 999,
        terms: 'Not applicable on hamper products'
      }));
      window.location.reload();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 1500))
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      const cartBtn = document.querySelector('button[aria-label*="cart" i]');
      if (cartBtn) cartBtn.click();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 800))
  await captureScreen(mobile, 'cart_drawer_state3_coupon_applied_mobile.png')

  // State 4: Open Available Offers Drawer (matches Screenshot 4)
  await mobile.send('Runtime.evaluate', {
    expression: `(() => {
      const offersLink = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('View all coupons'));
      if (offersLink) offersLink.click();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 800))
  await captureScreen(mobile, 'cart_offers_drawer_state4_mobile.png')

  mobile.ws.close()
  mobile.chrome.kill('SIGTERM')

  // 2. Desktop verification (1440 x 900) - drawer and dedicated /cart page
  console.log('--- Testing Desktop Cart Views (1440x900) ---')
  const desktop = await createChrome(port + 1, 1440, 900)

  // Navigate to PDP and seed cart items
  await desktop.send('Page.navigate', { url: 'http://localhost:3002/products/peace-lily-plant' })
  await new Promise((r) => setTimeout(r, 1500))

  await desktop.send('Runtime.evaluate', {
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
        quantity: 12,
        pack_size: '1 gm'
      };
      localStorage.setItem('glorov_cart', JSON.stringify([sampleItem]));
      localStorage.setItem('glorov_cart_cache', JSON.stringify([sampleItem]));
      localStorage.setItem('glorov_applied_coupon', JSON.stringify({
        code: 'DIWALI10',
        title: '10% OFF',
        description: 'On orders above ₹999',
        discount_type: 'percentage',
        discount_value: 10,
        value: 10,
        min_spend: 999,
        terms: 'Not applicable on hamper products'
      }));
      window.location.reload();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 1500))

  await desktop.send('Runtime.evaluate', {
    expression: `(() => {
      const cartBtn = document.querySelector('button[aria-label*="cart" i]');
      if (cartBtn) cartBtn.click();
    })()`,
  })
  await new Promise((r) => setTimeout(r, 800))
  await captureScreen(desktop, 'cart_drawer_desktop_pdp_side_by_side.png')

  // Dedicated Cart Page (/cart)
  await desktop.send('Page.navigate', { url: 'http://localhost:3002/cart' })
  await new Promise((r) => setTimeout(r, 1500))
  await captureScreen(desktop, 'dedicated_cart_page_desktop.png')

  desktop.ws.close()
  desktop.chrome.kill('SIGTERM')
  console.log('--- Cart Visual QA Completed Successfully ---')
}

main().catch(console.error)
