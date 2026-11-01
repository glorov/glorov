import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_OUTPUT_DIR = 'artifacts/ugaoo-reference'
const BRAIN_ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

const PAGES = [
  { name: 'homepage', url: 'https://www.ugaoo.com/' },
  { name: 'collections', url: 'https://www.ugaoo.com/collections/flower-seeds' },
  { name: 'product', url: 'https://www.ugaoo.com/products/chrysanthemum-mix-250-seeds' },
  { name: 'cart', url: 'https://www.ugaoo.com/cart' },
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, label: '390x844 (9:19.5 Mobile)' },
  { name: 'tablet', width: 768, height: 1024, isMobile: false, label: '768x1024 (3:4 Tablet)' },
  { name: 'laptop', width: 1280, height: 800, isMobile: false, label: '1280x800 (16:10 Laptop)' },
  { name: 'desktop', width: 1920, height: 1080, isMobile: false, label: '1920x1080 (16:9 Desktop)' },
]

for (const p of PAGES) {
  mkdirSync(join(BASE_OUTPUT_DIR, p.name), { recursive: true })
}
mkdirSync(join(BASE_OUTPUT_DIR, 'interactions'), { recursive: true })

async function captureViewport({ url, pageName, vp, port = 9920, action = null, customOutputName = null }) {
  const userDataDir = `/tmp/ugaoo-chrome-${port}-${Date.now()}`
  const fileName = customOutputName || `${vp.name}-${vp.width}x${vp.height}.png`
  const localPath = join(BASE_OUTPUT_DIR, pageName, fileName)
  const brainPath = join(BRAIN_ARTIFACT_DIR, `ugaoo-${pageName}-${fileName}`)

  console.log(`\n----------------------------------------------------`)
  console.log(`[Capturing Ugaoo] Page: ${pageName} | Device: ${vp.label}`)
  console.log(`URL: ${url}`)

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${vp.width},${vp.height}`,
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
    console.error(`Failed to connect to Chrome for ${pageName} ${vp.name}`)
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    return null
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

    await new Promise((res) => { ws.onopen = res })

    await send('Page.enable')
    await send('Runtime.enable')

    const userAgent = vp.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

    await send('Network.setUserAgentOverride', { userAgent })
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.isMobile,
    })

    await send('Page.navigate', { url })
    // Wait for network and assets to settle
    await new Promise((r) => setTimeout(r, 4500))

    if (action === 'mobile-menu') {
      console.log('Triggering mobile menu open...')
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('header summary, header .header__icon--menu, [aria-label*="Menu" i], [aria-label*="menu" i], button.mobile-menu-trigger, .drawer-menu-button');
            if (btn) btn.click();
          })()
        `,
      })
      await new Promise((r) => setTimeout(r, 1200))
    } else if (action === 'desktop-search') {
      console.log('Triggering desktop search...')
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const searchInput = document.querySelector('input[type="search"], input[name="q"], header .search-input, .predictive-search input');
            if (searchInput) {
              searchInput.focus();
              searchInput.value = 'Tulsi';
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          })()
        `,
      })
      await new Promise((r) => setTimeout(r, 1200))
    }

    // Dismiss common cookie/newsletter dialogs if any
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const closeBtns = document.querySelectorAll('.popup-close, .modal-close, button[aria-label="Close"], .newsletter-popup__close');
          closeBtns.forEach(b => b?.click());
        })()
      `,
    })

    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(shot.data, 'base64')
    writeFileSync(localPath, buf)
    writeFileSync(brainPath, buf)
    console.log(`Saved screenshot: ${localPath} (${(buf.length / 1024).toFixed(1)} KB)`)

    // Extract deep styling and architecture evidence
    const inspectionData = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const header = document.querySelector('header, .header');
          const footer = document.querySelector('footer, .footer');
          const primaryBtn = document.querySelector('button[type="submit"], .product-form__submit, .btn, .button--primary');
          const productTitle = document.querySelector('h1, .product__title');
          const price = document.querySelector('.price, .price-item, .product-price');
          
          return {
            title: document.title,
            headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
            headerHeight: header ? header.offsetHeight : null,
            footerBg: footer ? window.getComputedStyle(footer).backgroundColor : null,
            primaryBtnBg: primaryBtn ? window.getComputedStyle(primaryBtn).backgroundColor : null,
            primaryBtnColor: primaryBtn ? window.getComputedStyle(primaryBtn).color : null,
            primaryBtnRadius: primaryBtn ? window.getComputedStyle(primaryBtn).borderRadius : null,
            primaryBtnTransition: primaryBtn ? window.getComputedStyle(primaryBtn).transition : null,
            titleFont: productTitle ? window.getComputedStyle(productTitle).fontFamily : null,
            titleSize: productTitle ? window.getComputedStyle(productTitle).fontSize : null,
            priceColor: price ? window.getComputedStyle(price).color : null,
            priceFont: price ? window.getComputedStyle(price).fontFamily : null,
          };
        })()
      `,
      returnByValue: true,
    })

    ws.close()
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}

    return {
      pageName,
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      localPath,
      brainPath,
      inspection: inspectionData.result?.value,
    }
  } catch (err) {
    console.error(`Error capturing ${pageName} ${vp.name}:`, err.message)
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    return null
  }
}

async function main() {
  console.log('=== STARTING DEEP UGAAO REFERENCE CAPTURE MATRIX ===')
  const results = []

  // 1. Capture 4 standard viewports for all 4 core pages
  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const res = await captureViewport({
        url: page.url,
        pageName: page.name,
        vp,
      })
      if (res) results.push(res)
    }
  }

  // 2. Capture Key Interactions
  console.log('\n=== CAPTURING KEY INTERACTIONS ===')
  // Mobile navigation drawer
  const mobileMenu = await captureViewport({
    url: 'https://www.ugaoo.com/',
    pageName: 'interactions',
    vp: VIEWPORTS[0], // mobile
    action: 'mobile-menu',
    customOutputName: 'mobile-menu-390x844.png',
  })
  if (mobileMenu) results.push(mobileMenu)

  // Desktop search interaction
  const desktopSearch = await captureViewport({
    url: 'https://www.ugaoo.com/',
    pageName: 'interactions',
    vp: VIEWPORTS[3], // desktop
    action: 'desktop-search',
    customOutputName: 'desktop-search-1920x1080.png',
  })
  if (desktopSearch) results.push(desktopSearch)

  // Save audit data
  writeFileSync(
    join(BASE_OUTPUT_DIR, 'ugaoo-audit-data.json'),
    JSON.stringify(results, null, 2)
  )
  console.log('\n=== CAPTURE MATRIX COMPLETED SUCCESSFULLY ===')
  console.log(`Total screenshots captured: ${results.length}`)
}

main().catch(console.error)
