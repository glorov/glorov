import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/6704a0fd-6670-4208-accd-c4c92f976319';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });
mkdirSync(BRAIN_DIR, { recursive: true });

const TARGETS = [
  // Mobile Breakpoints (390 x 844)
  {
    name: 'glorov-categories-mobile-for-you',
    url: 'http://localhost:8089/#/categories',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-categories-mobile-seeds',
    url: 'http://localhost:8089/#/categories?category=seeds',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-categories-mobile-live-plants',
    url: 'http://localhost:8089/#/categories?category=live-plants',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-categories-mobile-pots',
    url: 'http://localhost:8089/#/categories?category=planters-pots',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-categories-mobile-care',
    url: 'http://localhost:8089/#/categories?category=plant-care-soil',
    width: 390,
    height: 844,
    isMobile: true,
  },
  // Desktop Breakpoints (1280 x 1000)
  {
    name: 'glorov-categories-desktop-all',
    url: 'http://localhost:8089/#/categories',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-categories-desktop-seeds',
    url: 'http://localhost:8089/#/categories?category=seeds',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-categories-desktop-live-plants',
    url: 'http://localhost:8089/#/categories?category=live-plants',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-categories-desktop-pots',
    url: 'http://localhost:8089/#/categories?category=planters-pots',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
];

async function captureTarget(t, port = 9970) {
  const userDataDir = `/tmp/glr-shot-${t.name}-${Date.now()}`;
  console.log(`Launching Chrome for ${t.name} (${t.width}x${t.height}) -> ${t.url}`);

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${t.width},${t.height}`,
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

  if (!pageTarget) {
    console.error(`Failed to find CDP page for ${t.name}`);
    chrome.kill('SIGKILL');
    return;
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });

  // Wait 4.5s for Flutter CanvasKit / Skia engine and network images to fully render
  await new Promise((r) => setTimeout(r, 4500));

  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(result.data, 'base64');
  const localFile = join(SCREENSHOTS_DIR, `${t.name}.png`);
  const brainFile = join(BRAIN_DIR, `${t.name}.png`);

  writeFileSync(localFile, buffer);
  writeFileSync(brainFile, buffer);
  console.log(`✓ Saved ${localFile} (${buffer.length} bytes) and copied to brain.`);

  ws.close();
  chrome.kill('SIGKILL');
}

async function run() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i], 9950 + i);
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('All GLOROV Category screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running capture script:', err);
  process.exit(1);
});
