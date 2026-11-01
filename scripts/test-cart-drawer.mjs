import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function testCartAdd() {
  const port = 9994
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=/tmp/test-cart-add-${Date.now()}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1920,1080',
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ])

  let target = null
  for (let attempt = 0; attempt < 25; attempt++) {
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

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  await new Promise((res) => { ws.onopen = res })
  await send('Page.enable')
  await send('Runtime.enable')

  await send('Page.navigate', { url: 'http://localhost:3000/products/peace-lily-plant' })
  await new Promise((r) => setTimeout(r, 2000))

  // Find and click the Add to Botanical Cart button
  const clickAddRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.getAttribute('aria-label')?.includes('Add to Botanical Cart') ||
        b.textContent.includes('Add to Botanical Cart')
      );
      if (!btn) return { error: 'Add button not found' };
      btn.click();
      return { clicked: true, text: btn.textContent.trim(), label: btn.getAttribute('aria-label') };
    })()`,
    returnByValue: true,
  })
  console.log('Add Button Click:', clickAddRes.result.value)

  // Wait for network add-to-cart request and drawer animation
  await new Promise((r) => setTimeout(r, 2500))

  const drawerState = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return {
        hasDialog: dialog !== null,
        dialogText: dialog ? dialog.innerText.slice(0, 400) : null,
      };
    })()`,
    returnByValue: true,
  })
  console.log('Drawer State after Add:', drawerState.result.value)

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync('/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf/pure-css-cart-drawer-open-desktop-1920x1080.png', Buffer.from(shot.data, 'base64'))
  console.log('Updated pure-css-cart-drawer-open-desktop-1920x1080.png with live cart item!')

  ws.close()
  chrome.kill('SIGTERM')
}

testCartAdd().catch(console.error)
