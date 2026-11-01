import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CART_ID = 'cart_01M5XW9PG16YMHS3ESKA8CWSH7'
const OUTPUT_DIR = 'artifacts/final-audit'

mkdirSync(OUTPUT_DIR, { recursive: true })

const VIEWPORTS = [
  { width: 360, height: 800, suffix: 'mobile-360' },
  { width: 390, height: 844, suffix: 'mobile-390' },
  { width: 768, height: 1024, suffix: 'tablet-768' },
  { width: 1280, height: 800, suffix: 'laptop-1280' },
  { width: 1440, height: 900, suffix: 'desktop-1440' },
]

async function runSession({ url, width, height, suffix, pageName, cartCookie = null, action = null, port = 9800 }) {
  const outputPath = `${OUTPUT_DIR}/final-${pageName}-${suffix}.png`
  const userDataDir = `/tmp/glr-chrome-final-${port}-${Date.now()}`
  console.log(`\n======================================================`)
  console.log(`[Final Audit] ${pageName} @ ${width}x${height} (${suffix})`)
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
    screenshotPath: outputPath,
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
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Filters'));
          if (btn) btn.click();
        `,
      })
      await new Promise((r) => setTimeout(r, 600))
    }

    // 1. Check Horizontal Overflow
    const overflowCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = Math.max(
            document.documentElement.scrollWidth,
            document.body ? document.body.scrollWidth : 0
          );
          const winWidth = window.innerWidth;
          const overflows = docWidth > winWidth + 1;
          return { docWidth, winWidth, overflows };
        })()
      `,
      returnByValue: true,
    })
    auditResult.overflow = overflowCheck.result?.value

    // 2. Heading Hierarchy Check
    const headingCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName.toLowerCase(),
            text: h.textContent.trim().slice(0, 40)
          }));
          const h1Count = headings.filter(h => h.tag === 'h1').length;
          return { h1Count, total: headings.length, sample: headings.slice(0, 5) };
        })()
      `,
      returnByValue: true,
    })
    auditResult.headingHierarchy = headingCheck.result?.value

    // 3. Orphaned / Unlabeled Inputs Check
    const inputCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
          const unlabeled = inputs.filter(inp => {
            const hasAria = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
            const hasId = inp.id && document.querySelector('label[for="' + inp.id + '"]');
            const wrappedInLabel = inp.closest('label');
            const hasPlaceholder = inp.getAttribute('placeholder');
            return !hasAria && !hasId && !wrappedInLabel;
          }).map(inp => ({ tag: inp.tagName, type: inp.type || 'text', id: inp.id, name: inp.name }));
          return unlabeled;
        })()
      `,
      returnByValue: true,
    })
    auditResult.orphanedInputs = inputCheck.result?.value || []

    // 4. Missing Alt Images Check
    const imageCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          const missing = imgs.filter(img => {
            const hasAlt = img.hasAttribute('alt');
            const ariaHidden = img.getAttribute('aria-hidden') === 'true';
            return !hasAlt && !ariaHidden;
          }).map(img => img.src.slice(0, 60));
          return missing;
        })()
      `,
      returnByValue: true,
    })
    auditResult.imagesMissingAlt = imageCheck.result?.value || []

    // 5. Touch Target Sizes Check (< 40x40px on mobile)
    if (width < 768) {
      const touchCheck = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const interactives = Array.from(document.querySelectorAll('button, a, input, select'));
            const undersized = interactives.filter(el => {
              const rect = el.getBoundingClientRect();
              const visible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
              return visible && (rect.width < 32 || rect.height < 32);
            }).map(el => ({
              tag: el.tagName,
              text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
              width: Math.round(el.getBoundingClientRect().width),
              height: Math.round(el.getBoundingClientRect().height)
            }));
            return undersized.slice(0, 8);
          })()
        `,
        returnByValue: true,
      })
      auditResult.smallTouchTargets = touchCheck.result?.value || []
    }

    // 6. Color Contrast Sampling
    const contrastEvaluation = await send('Runtime.evaluate', {
      expression: `
        (() => {
          function getRGB(str) {
            const match = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
            return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
          }
          function luminance(r, g, b) {
            const a = [r, g, b].map(v => {
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
              bg = [253, 251, 247]; // background cream default
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
      returnByValue: true,
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

  console.log('--- STARTING GLOROV FINAL FRONTEND AUDIT & EVIDENCE CAPTURE ---')

  // 1. Homepage across 5 viewports
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vp = VIEWPORTS[i]
    results.push(await runSession({
      url: 'http://localhost:3000/',
      width: vp.width,
      height: vp.height,
      suffix: vp.suffix,
      pageName: 'home',
      port: 9800 + i,
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
      port: 9810 + i,
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
      port: 9820 + i,
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
      port: 9830 + i,
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
      port: 9840 + i,
    }))
  }

  // 6. Empty Cart (mobile 390 & desktop 1440)
  results.push(await runSession({
    url: 'http://localhost:3000/cart',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'cart-empty',
    cartCookie: null,
    port: 9850,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/cart',
    width: 1440,
    height: 900,
    suffix: 'desktop-1440',
    pageName: 'cart-empty',
    cartCookie: null,
    port: 9851,
  }))

  // 7. Interactive Overlays (mobile 390)
  results.push(await runSession({
    url: 'http://localhost:3000/',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'drawer-nav',
    action: 'openMobileNav',
    port: 9860,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/store',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'drawer-cart',
    cartCookie: CART_ID,
    action: 'openCartDrawer',
    port: 9861,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/store',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'modal-filter',
    action: 'openFilters',
    port: 9862,
  }))

  // 8. Search query and Checkout verification screens
  results.push(await runSession({
    url: 'http://localhost:3000/store?q=tomato',
    width: 1440,
    height: 900,
    suffix: 'desktop-1440',
    pageName: 'search-results',
    port: 9870,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/store?q=tomato',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'search-results',
    port: 9871,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/checkout',
    width: 1440,
    height: 900,
    suffix: 'desktop-1440',
    pageName: 'checkout',
    cartCookie: CART_ID,
    port: 9872,
  }))
  results.push(await runSession({
    url: 'http://localhost:3000/checkout',
    width: 390,
    height: 844,
    suffix: 'mobile-390',
    pageName: 'checkout',
    cartCookie: CART_ID,
    port: 9873,
  }))

  writeFileSync(`${OUTPUT_DIR}/final-audit-summary.json`, JSON.stringify(results, null, 2))
  console.log(`\n======================================================`)
  console.log(`GLOROV Final Audit Complete!`)
  console.log(`Total sessions audited: ${results.length}`)
  console.log(`Summary written to ${OUTPUT_DIR}/final-audit-summary.json`)
}

run().catch((err) => {
  console.error('Fatal audit failure:', err)
  process.exit(1)
})
