import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUTPUT_DIR = 'artifacts/pure-css-redesign'
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

mkdirSync(OUTPUT_DIR, { recursive: true })

async function captureSection(name, width, height, scrollY, port = 9970) {
  const userDataDir = `/tmp/glr-sec-${port}-${Date.now()}`
  const fileName = `evergreen-section-${name}-${width}x${height}.png`
  const localPath = join(OUTPUT_DIR, fileName)
  const brainPath = join(BRAIN_DIR, fileName)

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

  let target = null
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 250))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    console.error('Failed to attach Chrome CDP')
    chrome.kill('SIGKILL')
    return
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
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })

  await new Promise((r) => { ws.onopen = r })
  await send('Page.enable')
  await send('Page.navigate', { url: 'http://localhost:3000/' })
  await new Promise((r) => setTimeout(r, 3000))

  if (scrollY > 0) {
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${scrollY})`,
    })
    await new Promise((r) => setTimeout(r, 1000))
  }

  const screenshot = await send('Page.captureScreenshot', { format: 'png' })
  const buf = Buffer.from(screenshot.data, 'base64')
  writeFileSync(localPath, buf)
  writeFileSync(brainPath, buf)
  console.log(`Saved screenshot: ${fileName}`)

  ws.close()
  chrome.kill('SIGKILL')
  try {
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 })
  } catch {}
}

async function main() {
  // Desktop
  await captureSection('hero-and-categories', 1920, 1080, 0, 9971)
  await captureSection('farm-and-spaces', 1920, 1080, 1500, 9972)
  await captureSection('reviews-and-comparison', 1920, 1080, 2700, 9973)

  // Mobile
  await captureSection('mobile-farm-to-home', 390, 844, 1800, 9974)
  await captureSection('mobile-transform-home', 390, 844, 2500, 9975)
  await captureSection('mobile-reviews', 390, 844, 3400, 9976)

  console.log('✓ All evergreen section screenshots captured successfully.')
}

main()
