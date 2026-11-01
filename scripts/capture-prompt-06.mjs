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
    await captureViewport({
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-06/baseline/baseline-home-mobile-390.png',
      port: 9331,
    })
    await captureViewport({
      url: 'http://localhost:3000/',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-06/baseline/baseline-home-desktop-1440.png',
      port: 9332,
    })
  } else if (command === 'final') {
    const viewports = [
      { width: 360, height: 800, name: 'home-mobile-360.png' },
      { width: 390, height: 844, name: 'home-mobile-390.png' },
      { width: 768, height: 1024, name: 'home-tablet-768.png' },
      { width: 1280, height: 800, name: 'home-laptop-1280.png' },
      { width: 1440, height: 900, name: 'home-desktop-1440.png' },
    ]

    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i]
      await captureViewport({
        url: 'http://localhost:3000/',
        width: vp.width,
        height: vp.height,
        outputPath: `artifacts/ui-redesign/prompt-06/${vp.name}`,
        port: 9340 + i,
      })
    }

    // Capture sections
    await captureViewport({
      url: 'http://localhost:3000/#catalog',
      width: 1440,
      height: 900,
      outputPath: 'artifacts/ui-redesign/prompt-06/featured-products-1440.png',
      port: 9350,
    })
    await captureViewport({
      url: 'http://localhost:3000/',
      width: 390,
      height: 844,
      outputPath: 'artifacts/ui-redesign/prompt-06/category-showcase-390.png',
      port: 9351,
    })
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
