import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CART_ID = 'cart_01M5XW9PG16YMHS3ESKA8CWSH7'
const OUTPUT_DIR = 'artifacts/quality-audit'

mkdirSync(OUTPUT_DIR, { recursive: true })

const VIEWPORTS = [
  { width: 360, height: 800, suffix: 'mobile-360' },
  { width: 390, height: 844, suffix: 'mobile-390' },
  { width: 768, height: 1024, suffix: 'tablet-768' },
  { width: 1280, height: 800, suffix: 'laptop-1280' },
  { width: 1440, height: 900, suffix: 'desktop-1440' },
]

async function runSession({ url, width, height, suffix, pageName, cartCookie = null, action = null, port = 9700 }) {
  const outputPath = `${OUTPUT_DIR}/qa-${pageName}-${suffix}.png`
  const userDataDir = `/tmp/glr-chrome-${port}-${Date.now()}`
  console.log(`\n======================================================`)
  console.log(`[QA Audit] ${pageName} @ ${width}x${height} (${suffix})`)
  console.log(`URL: ${url} | Action: ${action || 'none'}`)

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

  const auditResult = {
    pageName,
    viewport: `${width}x${height}`,
    suffix,
    url,
    consoleErrors: [],
    overflow: null,
    headingHierarchy: [],
    orphanedInputs: [],
    imagesMissingAlt: [],
    smallTouchTargets: [],
    contrastChecks: [],
    screenshotSaved: false,
  }

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
    auditResult.error = 'Failed to connect to Chrome remote debugging port'
    console.error(`Failed to connect on port ${port}`)
    return auditResult
  }

  try {
    const ws = new WebSocket(target.webSocketDebuggerUrl)

    let id = 1
    const pending = new Map()

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type
        if (type === 'error') {
          const text = data.params.args.map((a) => a.value || a.description || '').join(' ')
          auditResult.consoleErrors.push(text)
        }
      }
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

    // Wait for hydration & content
    await new Promise((r) => setTimeout(r, 2000))

    if (action === 'openMobileNav') {
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('button[aria-label*="navigation menu"]');
          if (btn) btn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 600))
    } else if (action === 'openCartDrawer') {
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('button[aria-label*="Shopping Cart"]');
          if (btn) btn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 600))
    } else if (action === 'openFilters') {
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('button[aria-label*="Filter"], button:has(svg.lucide-sliders-horizontal)');
          if (btn) btn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 600))
    }

    // 1. Horizontal Overflow Audit
    const overflowEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasOverflow = docWidth > winWidth + 1;
          let offendingElements = [];
          if (hasOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > winWidth + 2) {
                offendingElements.push({
                  tag: el.tagName,
                  className: (el.className || '').toString().slice(0, 50),
                  rect: { right: Math.round(rect.right), width: Math.round(rect.width) }
                });
                if (offendingElements.length >= 5) break;
              }
            }
          }
          return { docWidth, winWidth, hasOverflow, offendingElements };
        })()
      `,
    })
    auditResult.overflow = overflowEvaluation.result?.value

    // 2. Heading Hierarchy Audit
    const headingEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName.toLowerCase(),
            text: (h.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
            visible: h.offsetParent !== null
          }));
          const h1Count = headings.filter(h => h.tag === 'h1' && h.visible).length;
          return { headings: headings.slice(0, 15), h1Count };
        })()
      `,
    })
    auditResult.headingHierarchy = headingEvaluation.result?.value

    // 3. Orphaned Form Inputs
    const inputEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          return Array.from(document.querySelectorAll('input, select, textarea'))
            .filter(i => {
              if (i.type === 'hidden') return false;
              const hasId = i.id && document.querySelector(\`label[for="\${i.id}"]\`);
              const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
              return !hasId && !hasAria && !i.closest('label');
            })
            .map(i => ({
              tag: i.tagName,
              id: i.id,
              name: i.name,
              placeholder: i.placeholder,
              type: i.type
            }));
        })()
      `,
    })
    auditResult.orphanedInputs = inputEvaluation.result?.value || []

    // 4. Missing Alt Images
    const imageEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          return Array.from(document.querySelectorAll('img'))
            .filter(img => !img.hasAttribute('alt') || (img.getAttribute('alt') === '' && !img.hasAttribute('aria-hidden')))
            .map(img => ({
              src: (img.src || '').slice(0, 60),
              alt: img.getAttribute('alt')
            }))
            .slice(0, 10);
        })()
      `,
    })
    auditResult.imagesMissingAlt = imageEvaluation.result?.value || []

    // 5. Touch Target Sizing (Mobile checks)
    if (width < 768) {
      const touchEvaluation = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `
          (() => {
            const interactive = Array.from(document.querySelectorAll('button, a, input:not([type="hidden"]), select'));
            const undersized = [];
            for (const el of interactive) {
              if (el.offsetParent === null) continue;
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              if (el.tagName === 'A' && el.closest('p, span') && !el.classList.contains('button') && !el.getAttribute('role')) {
                continue;
              }
              if (rect.width < 34 || rect.height < 34) {
                undersized.push({
                  tag: el.tagName,
                  text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                });
                if (undersized.length >= 8) break;
              }
            }
            return undersized;
          })()
        `,
      })
      auditResult.smallTouchTargets = touchEvaluation.result?.value || []
    }

    // 6. Contrast Checks
    const contrastEvaluation = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          function getRGB(colorStr) {
            const match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
            return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [255, 255, 255];
          }
          function luminance(r, g, b) {
            const a = [r, g, b].map(function (v) {
              v /= 255;
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
          }
          function contrast(c1, c2) {
            const l1 = luminance(c1[0], c1[1], c1[2]);
            const l2 = luminance(c2[0], c2[1], c2[2]);
            return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
          }

          const elements = Array.from(document.querySelectorAll('h1, h2, button, [class*="brand-primary"], aside[aria-label*="Announcement"] span')).slice(0, 8);
          return elements.map(el => {
            const style = window.getComputedStyle(el);
            const fg = getRGB(style.color);
            let bg = getRGB(style.backgroundColor);
            if (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent') {
              bg = [253, 251, 247];
            }
            return {
              tag: el.tagName,
              text: (el.textContent || '').trim().slice(0, 30),
              fg: style.color,
              bg: style.backgroundColor,
              ratio: contrast(fg, bg)
            };
          });
        })()
      `,
    })
    auditResult.contrastChecks = contrastEvaluation.result?.value || []

    // 7. Screenshot Capture
    const capture = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(outputPath, Buffer.from(capture.data, 'base64'))
    auditResult.screenshotSaved = true
    console.log(`✓ Screenshot captured: ${outputPath}`)

    ws.close()
  } catch (err) {
    console.error(`Error auditing ${pageName}:`, err.message)
    auditResult.error = err.message
  } finally {
    chrome.kill('SIGKILL')
    try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
  }

  return auditResult
}

async function run() {
  const results = []

  // 1. Homepage across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'home',
      port: 9700 + i,
    }))
  }

  // 2. Listing /store across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/store',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'listing',
      port: 9710 + i,
    }))
  }

  // 3. Category /categories/seeds across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/categories/seeds',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'category',
      port: 9720 + i,
    }))
  }

  // 4. Product Detail across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/products/tomato-seeds-desi',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'pdp',
      port: 9730 + i,
    }))
  }

  // 5. Populated Cart across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/cart',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'cart-populated',
      cartCookie: CART_ID,
      port: 9740 + i,
    }))
  }

  // 6. Empty Cart (mobile & desktop)
  results.push(await runSession({
    url: 'http://localhost:3000/cart',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'cart-empty',
    cartCookie: null,
    port: 9750,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/cart',
    width: 1440,
    height: 900,
    suffix: 'desktop-1440',
    pageName: 'cart-empty',
    cartCookie: null,
    port: 9751,
  }))

  // 7. Interactive Overlays (mobile 390)
  results.push(await runSession({
    url: 'http://localhost:3000/',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'drawer-nav',
    action: 'openMobileNav',
    port: 9760,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/store',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'drawer-cart',
    cartCookie: CART_ID,
    action: 'openCartDrawer',
    port: 9761,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/store',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'modal-filter',
    action: 'openFilters',
    port: 9762,
  }))

  writeFileSync(`${OUTPUT_DIR}/audit-summary.json`, JSON.stringify(results, null, 2))
  console.log(`\n======================================================`)
  console.log(`QA Audit Complete! Summary written to ${OUTPUT_DIR}/audit-summary.json`)
}

run().catch((err) => {
  console.error('Fatal audit failure:', err)
  process.exit(1)
})
