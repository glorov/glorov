import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const port = 9910
const userDataDir = `/tmp/glr-test-ugaoo-${Date.now()}`

mkdirSync('artifacts/ugaoo-reference/test', { recursive: true })

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  `--window-size=1280,800`,
  `--remote-debugging-port=${port}`,
  '--remote-allow-origins=*',
  'about:blank',
])

async function main() {
  let target = null
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((r) => setTimeout(r, 400))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    console.error('Failed to connect to Chrome')
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

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  await new Promise((res) => { ws.onopen = res })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  })

  console.log('Navigating to https://www.ugaoo.com/ ...')
  await send('Page.navigate', { url: 'https://www.ugaoo.com/' })

  await new Promise((r) => setTimeout(r, 5000))

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync('artifacts/ugaoo-reference/test/test-home-1280.png', Buffer.from(shot.data, 'base64'))
  console.log('Screenshot saved to artifacts/ugaoo-reference/test/test-home-1280.png')

  const titleRes = await send('Runtime.evaluate', {
    expression: 'document.title',
    returnByValue: true,
  })
  console.log('Page Title:', titleRes.result?.value)

  ws.close()
  chrome.kill('SIGKILL')
  rmSync(userDataDir, { recursive: true, force: true })
}

main().catch(console.error)
