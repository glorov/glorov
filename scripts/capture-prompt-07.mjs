import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function captureViewport({ url, width, height, fullPage = false, outputPath, port = 9333 }) {
  console.log(`[Capture] ${url} @ ${width}x${height} -> ${outputPath}`)
  mkdirSync(dirname(outputPath), { recursive: true })

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    url,
  ])

  await new Promise((resolve) => setTimeout(resolve, 2500))

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
    const pages = await listRes.json()
    const target = pages.find((p) => p.type === 'page' || p.url.includes('localhost:3000')) || pages[0]
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
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })

    // Wait for content and hydration
    await new Promise((r) => setTimeout(r, 1500))

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
    // 1. Listing baseline (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/store',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-07/baseline/baseline-listing-mobile-390.png',
      port: 9401,
    })
    await captureViewport({
      url: 'http://localhost:3000/store',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-07/baseline/baseline-listing-desktop-1440.png',
      port: 9402,
    })

    // 2. Product Detail baseline (mobile & desktop)
    await captureViewport({
      url: 'http://localhost:3000/products/tomato-seeds-desi',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-07/baseline/baseline-pdp-mobile-390.png',
      port: 9403,
    })
    await captureViewport({
      url: 'http://localhost:3000/products/tomato-seeds-desi',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-07/baseline/baseline-pdp-desktop-1440.png',
      port: 9404,
    })
  } else if (command === 'final') {
    const viewports = [
      { width: 360, height: 800, suffix: 'mobile-360' },
      { width: 390, height: 844, suffix: 'mobile-390' },
      { width: 768, height: 1024, suffix: 'tablet-768' },
      { width: 1280, height: 800, suffix: 'laptop-1280' },
      { width: 1440, height: 900, suffix: 'desktop-1440' },
    ]

    // 1. Listing across 5 viewports
    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i]
      await captureViewport({
        url: 'http://localhost:3000/store',
        width: vp.width,
        height: vp.height,
        outputPath: `artifacts/ui-redesign/prompt-07/listing-${vp.suffix}.png`,
        port: 9410 + i,
      })
    }

    // 2. Product Detail across 5 viewports
    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i]
      await captureViewport({
        url: 'http://localhost:3000/products/tomato-seeds-desi',
        width: vp.width,
        height: vp.height,
        outputPath: `artifacts/ui-redesign/prompt-07/pdp-${vp.suffix}.png`,
        port: 9420 + i,
      })
    }

    // 3. Category Listing
    await captureViewport({
      url: 'http://localhost:3000/categories/seeds',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-07/category-listing-mobile-390.png',
      port: 9430,
    })
    await captureViewport({
      url: 'http://localhost:3000/categories/seeds',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-07/category-listing-desktop-1440.png',
      port: 9431,
    })
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
