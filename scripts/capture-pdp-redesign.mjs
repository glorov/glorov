import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUTPUT_DIR = 'artifacts/final-audit'

mkdirSync(OUTPUT_DIR, { recursive: true })

async function runSession({ url, width, height, suffix, action = null, scrollY = 0, port = 9880 }) {
  const outputPath = `${OUTPUT_DIR}/redesigned-pdp-${suffix}.png`
  const userDataDir = `/tmp/glr-chrome-pdp-${port}-${Date.now()}`
  console.log(`\n======================================================`)
  console.log(`[PDP Redesign Capture] @ ${width}x${height} (${suffix})`)
  console.log(`URL: ${url} | Scroll: ${scrollY}`)

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

  // Connection retry loop
  let target = null
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((r) => setTimeout(r, 400))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target && target.webSocketDebuggerUrl) break
    } catch {
      // retry
    }
  }

  if (!target || !target.webSocketDebuggerUrl) {
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    console.error(`Failed to connect on port ${port}`)
    return
  }

  try {
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

    await new Promise((resolve) => { ws.onopen = resolve })

    await send('Page.enable')
    await send('Runtime.enable')
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })

    await send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 2200))

    if (action === 'increaseQuantity') {
      await send('Runtime.evaluate', {
        expression: `
          const incBtn = document.querySelector('button[aria-label="Increase quantity"]');
          if (incBtn) incBtn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 500))
    }

    if (scrollY > 0) {
      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: ${scrollY}, behavior: 'instant' });`,
      })
      await new Promise((r) => setTimeout(r, 800))
    }

    const capture = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(outputPath, Buffer.from(capture.data, 'base64'))
    console.log(`✓ Screenshot captured: ${outputPath}`)

    ws.close()
  } catch (err) {
    console.error('Error during capture:', err)
  } finally {
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
  }
}

async function run() {
  const url = 'http://localhost:3000/products/tomato-seeds-desi'

  // 1. Desktop 1440
  await runSession({
    url,
    width: 1440,
    height: 900,
    suffix: 'desktop-1440',
    port: 9880,
  })

  // 2. Mobile 390 (Top with overlapping card sheet)
  await runSession({
    url,
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    port: 9881,
  })

  // 3. Mobile 390 (Scrolled down to specifications with sticky bottom action bar)
  await runSession({
    url,
    width: 390,
    height: 844,
    suffix: 'mobile-sticky-390',
    scrollY: 2200,
    port: 9882,
  })

  console.log('\n--- ALL PDP REDESIGN SCREENSHOTS CAPTURED ---')
}

run().catch(console.error)
