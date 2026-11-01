import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function captureInteractive({ width, height, evalAction, outputPath, port }) {
  console.log(`Launching Chrome ${width}x${height} on port ${port}...`)
  const chrome = spawn(CHROME_PATH, [
    '--headless',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'http://localhost:3000/',
  ])

  await new Promise((resolve) => setTimeout(resolve, 2000))

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

    await new Promise((r) => setTimeout(r, 1000))

    if (evalAction) {
      await send('Runtime.evaluate', { expression: evalAction })
      await new Promise((r) => setTimeout(r, 500))
    }

    const capture = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(outputPath, Buffer.from(capture.data, 'base64'))
    console.log(`Saved ${outputPath}`)

    ws.close()
  } finally {
    chrome.kill()
  }
}

async function main() {
  // Capture 1: Mobile drawer open
  await captureInteractive({
    width: 390,
    height: 844,
    evalAction: `
      const btn = document.querySelector('button[aria-label="Open navigation menu"]');
      if (btn) btn.click();
    `,
    outputPath: 'artifacts/ui-redesign/prompt-04/mobile-nav-drawer-390.png',
    port: 9224,
  })

  // Capture 2: Desktop seeds dropdown open
  await captureInteractive({
    width: 1440,
    height: 900,
    evalAction: `
      const btn = document.querySelector('button[aria-label="Seeds submenu"]');
      if (btn) btn.click();
    `,
    outputPath: 'artifacts/ui-redesign/prompt-04/desktop-dropdown-seeds-1440.png',
    port: 9225,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
