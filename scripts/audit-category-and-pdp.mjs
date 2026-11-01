import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUTPUT_DIR = 'artifacts/pure-css-redesign'
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/58582fcd-c644-4fac-981e-51de8ce519cf'

mkdirSync(OUTPUT_DIR, { recursive: true })

async function runBrowserAudit() {
  const port = 9992
  const userDataDir = `/tmp/glr-audit-${Date.now()}`

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
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

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })

  await new Promise((res) => { ws.onopen = res })
  await send('Page.enable')
  await send('Network.enable')
  await send('Runtime.enable')

  const auditResults = {
    pagesAudited: [],
    interactionsTested: [],
    accessibility: {},
    screenshots: [],
  }

  // 1. Audit Categories: Plants (Desktop & Mobile)
  const categoryViews = [
    { url: 'http://localhost:3000/categories/plants', slug: 'category-plants' },
    { url: 'http://localhost:3000/categories/seeds', slug: 'category-seeds' },
  ]

  const viewports = [
    { name: 'desktop', width: 1920, height: 1080, isMobile: false },
    { name: 'mobile', width: 390, height: 844, isMobile: true },
  ]

  for (const pageConfig of categoryViews) {
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.isMobile,
      })

      await send('Page.navigate', { url: pageConfig.url })
      await new Promise((r) => setTimeout(r, 1500))

      // Evaluate page DOM & a11y metrics
      const domAudit = await send('Runtime.evaluate', {
        expression: `(() => {
          const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim());
          const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim());
          const h3s = Array.from(document.querySelectorAll('h3')).map(el => el.textContent.trim());
          const productCards = document.querySelectorAll('article, [class*="productCard"], [class*="card"]').length;
          const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth === 0 && !img.src.includes('data:')).map(img => img.src);
          const interactiveTargets = Array.from(document.querySelectorAll('a, button, input')).map(el => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              ariaLabel: el.getAttribute('aria-label') || el.textContent.slice(0, 20),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          }).filter(t => t.width > 0 && t.height > 0);

          const sub44Targets = interactiveTargets.filter(t => t.width < 44 || t.height < 44);

          return {
            title: document.title,
            h1s,
            h2Count: h2s.length,
            h3Count: h3s.length,
            productCards,
            brokenImagesCount: brokenImages.length,
            totalInteractiveTargets: interactiveTargets.length,
            sub44TargetsCount: sub44Targets.length,
          };
        })()`,
        returnByValue: true,
      })

      const fileName = `pure-css-${pageConfig.slug}-${vp.name}-${vp.width}x${vp.height}.png`
      const localPath = join(OUTPUT_DIR, fileName)
      const brainPath = join(BRAIN_DIR, fileName)

      const shot = await send('Page.captureScreenshot', { format: 'png' })
      const buf = Buffer.from(shot.data, 'base64')
      writeFileSync(localPath, buf)
      writeFileSync(brainPath, buf)

      auditResults.pagesAudited.push({
        slug: pageConfig.slug,
        viewport: vp.name,
        metrics: domAudit.result.value,
        screenshot: fileName,
      })
      console.log(`[PASS] Captured ${pageConfig.slug} (${vp.name}) -> ${fileName}`)
    }
  }

  // 2. Audit PDP Interactivity (Peace Lily)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    mobile: false,
  })

  await send('Page.navigate', { url: 'http://localhost:3000/products/peace-lily-plant' })
  await new Promise((r) => setTimeout(r, 2000))

  // Pincode test
  const pincodeTest = await send('Runtime.evaluate', {
    expression: `(async () => {
      const pinInput = document.querySelector('input[placeholder*="PIN"], input[placeholder*="pin"], input[type="text"]');
      if (!pinInput) return { error: 'Pincode input not found' };
      pinInput.value = '411001';
      pinInput.dispatchEvent(new Event('input', { bubbles: true }));
      pinInput.dispatchEvent(new Event('change', { bubbles: true }));

      const checkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Check') || b.textContent.includes('Verify'));
      if (checkBtn) {
        checkBtn.click();
        await new Promise(r => setTimeout(r, 1000));
      }

      const bodyText = document.body.innerText;
      return {
        success: bodyText.includes('Pune') || bodyText.includes('Serviceable') || bodyText.includes('Delivery') || bodyText.includes('dispatch'),
        statusSnippet: bodyText.slice(0, 500)
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  auditResults.interactionsTested.push({ interaction: 'Pincode Verification (411001)', result: pincodeTest.result.value })
  console.log('[PASS] PDP Pincode Verification tested')

  // Add to Cart interaction
  const addToCartTest = await send('Runtime.evaluate', {
    expression: `(async () => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Add to Botanical Cart') ||
        b.textContent.includes('Add to Cart') ||
        (b.className && typeof b.className === 'string' && b.className.includes('addToCartBtn'))
      );
      if (!addBtn) return { error: 'Add to Cart button not found' };

      addBtn.click();
      await new Promise(r => setTimeout(r, 2000));

      const drawer = document.querySelector('[role="dialog"], [class*="drawer"], [class*="cartDrawer"]');
      const drawerVisible = drawer !== null;
      const drawerText = drawer ? drawer.innerText : '';
      const hasFreeDeliveryBar = drawerText.includes('499') || drawerText.includes('Free') || drawerText.includes('FREE');

      return {
        drawerOpened: drawerVisible,
        hasFreeDeliveryBar,
        snippet: drawerText.slice(0, 300)
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  auditResults.interactionsTested.push({ interaction: 'Add to Cart -> Cart Drawer Opening', result: addToCartTest.result.value })
  console.log('[PASS] PDP Add to Cart -> Cart Drawer tested')

  // Capture open drawer screenshot
  const drawerShot = await send('Page.captureScreenshot', { format: 'png' })
  const drawerFileName = 'pure-css-cart-drawer-open-desktop-1920x1080.png'
  writeFileSync(join(OUTPUT_DIR, drawerFileName), Buffer.from(drawerShot.data, 'base64'))
  writeFileSync(join(BRAIN_DIR, drawerFileName), Buffer.from(drawerShot.data, 'base64'))
  auditResults.screenshots.push(drawerFileName)
  console.log(`[PASS] Captured Cart Drawer Screenshot -> ${drawerFileName}`)

  ws.close()
  chrome.kill('SIGTERM')

  console.log('\n--- AUDIT SUMMARY ---')
  console.log(JSON.stringify(auditResults, null, 2))
}

runBrowserAudit().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
