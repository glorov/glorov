import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function capture() {
  const port = 9996;
  const userDataDir = `/tmp/glr-prompt12-audit-${Date.now()}`;

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

  // Seed sample data for wishlist and cart
  await send('Page.navigate', { url: 'http://localhost:8086/' });
  await new Promise((r) => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { "productId": "glr-seed-01", "quantity": 2 },
        { "productId": "glr-seed-02", "quantity": 1 }
      ]));
      window.localStorage.setItem('glorov_wishlist', JSON.stringify(["glr-seed-01", "glr-seed-02", "glr-seed-03"]));
    `
  });

  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 2500));

  const screenshots = [
    {
      name: 'glorov-audit-showcase-desktop-1440',
      url: 'http://localhost:8086/#/dev_showcase',
      width: 1440,
      height: 900,
    },
    {
      name: 'glorov-audit-showcase-mobile-390',
      url: 'http://localhost:8086/#/dev_showcase',
      width: 390,
      height: 844,
    },
    {
      name: 'glorov-audit-home-1280',
      url: 'http://localhost:8086/#/',
      width: 1280,
      height: 850,
    },
    {
      name: 'glorov-audit-pdp-768',
      url: 'http://localhost:8086/#/product_details?id=glr-seed-01',
      width: 768,
      height: 1024,
    },
    {
      name: 'glorov-audit-cart-390',
      url: 'http://localhost:8086/#/cart',
      width: 390,
      height: 844,
    },
    {
      name: 'glorov-audit-checkout-320',
      url: 'http://localhost:8086/#/checkout',
      width: 320,
      height: 640,
    },
  ];

  for (const s of screenshots) {
    console.log(`Capturing ${s.name} at ${s.url} (${s.width}x${s.height})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: s.width,
      height: s.height,
      deviceScaleFactor: 1,
      mobile: s.width < 768,
    });

    await send('Page.navigate', { url: s.url });
    await new Promise((r) => setTimeout(r, 2500));

    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(data, 'base64');
    writeFileSync(join(SCREENSHOTS_DIR, `${s.name}.png`), buf);
    writeFileSync(join(BRAIN_DIR, `${s.name}.png`), buf);
    console.log(`Saved ${s.name}.png`);
  }

  ws.close();
  chrome.kill();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
