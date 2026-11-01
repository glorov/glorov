import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CART_ID = 'cart_01M5XW9PG16YMHS3ESKA8CWSH7'

async function captureViewport({ url, width, height, fullPage = false, outputPath, port = 9533, cartCookie = null, openDrawer = false }) {
  console.log(`[Capture] ${url} @ ${width}x${height} (cartCookie: ${!!cartCookie}, drawer: ${openDrawer}) -> ${outputPath}`)
  mkdirSync(dirname(outputPath), { recursive: true })

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ])

  await new Promise((resolve) => setTimeout(resolve, 2500))

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
    const pages = await listRes.json()
    const target = pages.find((p) => p.type === 'page') || pages[0]
    if (!target || !target.webSocketDebuggerUrl) {
      throw new Error('No valid target page found')
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

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++
        pending.set(msgId, { resolve, reject })
        ws.send(JSON.stringify({ id: msgId, method, params }))
      })
    }

    await new Promise((resolve) => {
      ws.onopen = resolve
    })

    await send('Page.enable')
    await send('Runtime.enable')
    await send('Network.enable')
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })

    if (cartCookie) {
      await send('Network.setCookie', {
        name: 'glorov_cart_id',
        value: cartCookie,
        domain: 'localhost',
        path: '/',
      })
    } else {
      await send('Network.deleteCookies', {
        name: 'glorov_cart_id',
        domain: 'localhost',
        path: '/',
      })
    }

    await send('Page.navigate', { url })

    // Wait for content and hydration
    await new Promise((r) => setTimeout(r, 2000))

    if (openDrawer) {
      // Trigger cart button to open drawer
      await send('Runtime.evaluate', {
        expression: `
          const cartBtn = document.querySelector('button[aria-label*="Shopping Cart"]');
          if (cartBtn) cartBtn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 800))
    }

    let clip
    if (fullPage) {
      const layoutMetrics = await send('Page.getLayoutMetrics')
      const contentHeight = Math.ceil(layoutMetrics.contentSize?.height || height)
      clip = {
        x: 0,
        y: 0,
        width,
        height: Math.min(contentHeight, 5000),
        scale: 1,
      }
    }

    const capture = await send('Page.captureScreenshot', {
      format: 'png',
      ...(clip ? { clip, captureBeyondViewport: true } : {}),
    })

    writeFileSync(outputPath, Buffer.from(capture.data, 'base64'))
    console.log(`Saved screenshot: ${outputPath}`)

    ws.close()
  } finally {
    chrome.kill()
  }
}

const command = process.argv[2] || 'baseline'

async function run() {
  if (command === 'baseline') {
    // 1. Empty Cart Baseline (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-08/baseline/baseline-cart-empty-mobile-390.png',
      port: 9501,
      cartCookie: null,
    })
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-08/baseline/baseline-cart-empty-desktop-1440.png',
      port: 9502,
      cartCookie: null,
    })

    // 2. Populated Cart Baseline (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-08/baseline/baseline-cart-populated-mobile-390.png',
      port: 9503,
      cartCookie: CART_ID,
    })
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-08/baseline/baseline-cart-populated-desktop-1440.png',
      port: 9504,
      cartCookie: CART_ID,
    })
  } else if (command === 'final') {
    const viewports = [
      { width: 360, height: 800, suffix: 'mobile-360' },
      { width: 390, height: 844, suffix: 'mobile-390' },
      { width: 768, height: 1024, suffix: 'tablet-768' },
      { width: 1280, height: 800, suffix: 'laptop-1280' },
      { width: 1440, height: 900, suffix: 'desktop-1440' },
    ]

    // 1. Populated Cart across 5 viewports
    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i]
      await captureViewport({
        url: 'http://localhost:3000/cart',
        width: vp.width,
        height: vp.height,
        outputPath: `artifacts/ui-redesign/prompt-08/cart-populated-${vp.suffix}.png`,
        port: 9510 + i,
        cartCookie: CART_ID,
      })
    }

    // 2. Empty Cart (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-08/cart-empty-mobile-390.png',
      port: 9520,
      cartCookie: null,
    })
    await captureViewport({
      url: 'http://localhost:3000/cart',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-08/cart-empty-desktop-1440.png',
      port: 9521,
      cartCookie: null,
    })

    // 3. Cart Drawer with populated items (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/store',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-08/cart-drawer-mobile-390.png',
      port: 9522,
      cartCookie: CART_ID,
      openDrawer: true,
    })
    await captureViewport({
      url: 'http://localhost:3000/store',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-08/cart-drawer-desktop-1440.png',
      port: 9523,
      cartCookie: CART_ID,
      openDrawer: true,
    })
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
