import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373';
const SCREENSHOTS_DIR = 'flutter/screenshots';

mkdirSync(ARTIFACT_DIR, { recursive: true });
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  const port = 9997;
  const userDataDir = `/tmp/glr-rem-${Date.now()}`;

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
    await new Promise((r) => setTimeout(r, 1500));
    const result = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(result.data, 'base64');
    
    writeFileSync(join(ARTIFACT_DIR, `${filename}.png`), buffer);
    writeFileSync(join(SCREENSHOTS_DIR, `${filename}.png`), buffer);
    console.log(`Saved screenshot: ${filename}.png (${width}x${height})`);
  }

  console.log('--- 1. Cart State 4: Available Offers Modal Sheet (Mobile 390x844) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2.0,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:8086/#/cart?offers=true' });
  await new Promise((r) => setTimeout(r, 1000));
  // Seed local storage with Cosmos Mix Seeds quantity 12 and DIWALI10 promo
  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 12 }
      ]));
      window.localStorage.setItem('glorov_promo_code', 'DIWALI10');
      window.location.reload();
    `
  });
  await new Promise((r) => setTimeout(r, 4000));
  await takeScreenshot('flutter_cart_mobile_state4_available_offers_modal', 390, 844, true);

  console.log('--- 2. Desktop Cart View (1280x850) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 2.0,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:8086/#/cart' });
  await new Promise((r) => setTimeout(r, 1000));
  await send('Runtime.evaluate', { expression: 'window.location.reload();' });
  await new Promise((r) => setTimeout(r, 4000));
  await takeScreenshot('flutter_cart_desktop_fullpage', 1280, 850, false);

  ws.close();
  chrome.kill();
  console.log('Remaining captures completed successfully!');
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
