import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373';
const SCREENSHOTS_DIR = 'flutter/screenshots';

mkdirSync(ARTIFACT_DIR, { recursive: true });
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  const port = 9996;
  const userDataDir = `/tmp/glr-cart-verify-${Date.now()}`;

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,850',
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await res.json();
      pageTarget = pages.find((p) => p.type === 'page') || pages[0];
      if (pageTarget?.webSocketDebuggerUrl) break;
    } catch {}
  }

  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Chrome target not found');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((res) => { ws.onopen = res; });
  await send('Page.enable');
  await send('Runtime.enable');

  async function takeScreenshot(filename, width, height, isMobile = false) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2.0,
      mobile: isMobile,
    });
    await new Promise((r) => setTimeout(r, 1200));
    const result = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(result.data, 'base64');
    
    // Write to both artifacts directory and flutter/screenshots
    writeFileSync(join(ARTIFACT_DIR, `${filename}.png`), buffer);
    writeFileSync(join(SCREENSHOTS_DIR, `${filename}.png`), buffer);
    console.log(`Saved screenshot: ${filename}.png (${width}x${height})`);
  }

  async function navigateFresh(url) {
    await send('Page.navigate', { url: 'about:blank' });
    await new Promise((r) => setTimeout(r, 300));
    await send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 3500));
  }

  console.log('--- 1. Verification of Catalog Grid (No heart icons on cards, frosted rating badge) ---');
  await navigateFresh('http://localhost:8086/#/discover');
  await takeScreenshot('flutter_catalog_mobile_no_heart_cards', 390, 844, true);
  await takeScreenshot('flutter_catalog_desktop_no_heart_cards', 1280, 850, false);

  console.log('--- 2. Verification of PDP (Favorite Heart Button IS present) ---');
  await navigateFresh('http://localhost:8086/#/product_details?id=glr-flo-10');
  await takeScreenshot('flutter_pdp_mobile_favorite_button', 390, 844, true);
  await takeScreenshot('flutter_pdp_desktop_favorite_button', 1280, 850, false);

  console.log('--- 3. Cart State 1: Mobile (Subtotal ₹297 -> Add ₹202 more to unlock free delivery) ---');
  // Seed local storage with Cosmos Mix Seeds quantity 3 and no promo
  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 3 }
      ]));
      window.localStorage.removeItem('glorov_promo_code');
    `
  });
  await navigateFresh('http://localhost:8086/#/cart');
  await takeScreenshot('flutter_cart_mobile_state1_free_delivery_target', 390, 844, true);

  console.log('--- 4. Cart State 2: Mobile (Subtotal ₹693 -> Add ₹306 more to unlock 10% off) ---');
  // Seed local storage with Cosmos Mix Seeds quantity 7 and no promo
  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 7 }
      ]));
      window.localStorage.removeItem('glorov_promo_code');
    `
  });
  await navigateFresh('http://localhost:8086/#/cart');
  await takeScreenshot('flutter_cart_mobile_state2_10pct_target', 390, 844, true);

  console.log('--- 5. Cart State 3: Mobile (Subtotal ₹1,188 -> Coupon Applied DIWALI10 & Promo Tag) ---');
  // Seed local storage with Cosmos Mix Seeds quantity 12 and DIWALI10 promo
  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 12 }
      ]));
      window.localStorage.setItem('glorov_promo_code', 'DIWALI10');
    `
  });
  await navigateFresh('http://localhost:8086/#/cart');
  await takeScreenshot('flutter_cart_mobile_state3_coupon_applied_inflow', 390, 844, true);

  console.log('--- 6. Cart State 4: Mobile (Available Offers Modal Sheet) ---');
  await navigateFresh('http://localhost:8086/#/cart?offers=true');
  await new Promise((r) => setTimeout(r, 1500));
  await takeScreenshot('flutter_cart_mobile_state4_available_offers_modal', 390, 844, true);

  console.log('--- 7. Cart State 5: Mobile (Price & Tax Breakdown Sheet) ---');
  await navigateFresh('http://localhost:8086/#/cart');
  // Click on "Inclusive of all taxes ⌵" in sticky bottom bar
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: 95,
    y: 825,
    button: 'left',
    clickCount: 1,
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: 95,
    y: 825,
    button: 'left',
    clickCount: 1,
  });
  await new Promise((r) => setTimeout(r, 1500));
  await takeScreenshot('flutter_cart_mobile_tax_breakdown_expanded', 390, 844, true);

  // Close tax breakdown sheet by clicking scrim at top
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: 195,
    y: 200,
    button: 'left',
    clickCount: 1,
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: 195,
    y: 200,
    button: 'left',
    clickCount: 1,
  });
  await new Promise((r) => setTimeout(r, 1200));

  console.log('--- 8. Desktop Cart View (2-Column Layout matching Image 5) ---');
  await navigateFresh('http://localhost:8086/#/cart');
  await takeScreenshot('flutter_cart_desktop_fullpage', 1280, 850, false);

  ws.close();
  chrome.kill();
  console.log('All verification captures completed successfully!');
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
