import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function capture() {
  const port = 9995;
  const userDataDir = `/tmp/glr-prompt11-feedback-${Date.now()}`;

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
      name: 'glorov-feedback-notifications',
      url: 'http://localhost:8086/#/notifications',
      width: 1280,
      height: 850,
    },
    {
      name: 'glorov-feedback-profile',
      url: 'http://localhost:8086/#/user_info',
      width: 1280,
      height: 850,
    },
    {
      name: 'glorov-feedback-support',
      url: 'http://localhost:8086/#/contact_support',
      width: 1280,
      height: 850,
    },
    {
      name: 'glorov-feedback-wishlist-staggered',
      url: 'http://localhost:8086/#/bookmark',
      width: 1280,
      height: 850,
    },
    {
      name: 'glorov-feedback-orders-staggered',
      url: 'http://localhost:8086/#/orders',
      width: 1280,
      height: 850,
    },
  ];

  for (const s of screenshots) {
    console.log(`Capturing ${s.name} at ${s.url}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: s.width,
      height: s.height,
      deviceScaleFactor: 1,
      mobile: false,
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
