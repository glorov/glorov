import { spawn } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function inspectUrl(url, port = 9935) {
  const userDataDir = `/tmp/glr-inspect-url-${port}-${Date.now()}`
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ])

  let target = null
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 300))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    chrome.kill('SIGKILL')
    return null
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

  await new Promise((res) => { ws.onopen = res })
  await send('Page.enable')
  await send('Runtime.enable')

  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, 4500))

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const mainChildren = Array.from(document.querySelectorAll('main > div > *, main > section, #MainContent > section, [id^="shopify-section-"]'))
        .map(el => ({
          tag: el.tagName,
          id: el.id,
          classes: el.className ? el.className.split(' ').slice(0, 3).join(' ') : '',
          heading: el.querySelector('h1, h2, h3, h4')?.innerText?.trim()?.slice(0, 60),
          bg: window.getComputedStyle(el).backgroundColor,
          height: el.offsetHeight
        }));

      return {
        url: window.location.href,
        title: document.title,
        headerHeight: header?.offsetHeight,
        footerHeight: footer?.offsetHeight,
        mainChildren
      }
    })()`,
    returnByValue: true,
  })

  ws.close()
  chrome.kill('SIGKILL')
  rmSync(userDataDir, { recursive: true, force: true })
  return evalRes.result?.value
}

async function main() {
  console.log('Inspecting GLOROV localhost:3000 ...')
  const glorov = await inspectUrl('http://localhost:3000/', 9936)
  console.log('GLOROV Sections:\n', JSON.stringify(glorov, null, 2))
}

main().catch(console.error)
