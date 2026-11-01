import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373';
mkdirSync(ARTIFACT_DIR, { recursive: true });

async function captureViewport({ name, width, height, isMobile, url, scrollDeltaY, waitAfterScroll = 2000, extraActions }) {
  const port = 9800 + Math.floor(Math.random() * 100);
  const dataDir = `/tmp/flutter-view-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  console.log(`[${name}] Spawning Chrome on port ${port} (${width}x${height})...`);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${dataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  try {
    let target = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
        const pages = await listRes.json();
        target = pages.find((p) => p.type === 'page') || pages[0];
        if (target?.webSocketDebuggerUrl) break;
      } catch {}
    }

    if (!target?.webSocketDebuggerUrl) {
      throw new Error(`Failed to obtain target on port ${port}`);
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
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
    await new Promise((r) => { ws.onopen = r; });

    const send = (method, params = {}) => {
      const msgId = id++;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await send('Page.enable');
    await send('DOM.enable');
    await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile,
    });

    console.log(`[${name}] Navigating to ${url}...`);
    await send('Page.navigate', { url });

    // Wait for Flutter app initialization
    console.log(`[${name}] Waiting for Flutter app to settle...`);
    await new Promise((r) => setTimeout(r, 4500));

    if (scrollDeltaY) {
      console.log(`[${name}] Scrolling deltaY: ${scrollDeltaY}...`);
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.floor(width / 2),
        y: Math.floor(height / 2),
        deltaX: 0,
        deltaY: scrollDeltaY,
      });
      await new Promise((r) => setTimeout(r, waitAfterScroll));
    }

    if (extraActions) {
      await extraActions(send);
    }

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, name);
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`[${name}] Saved screenshot: ${filePath}`);

    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

async function main() {
  const baseUrl = 'http://localhost:8086';

  // 1. Mobile Product Cards
  await captureViewport({
    name: 'glorov_mobile_product_cards_verified.png',
    width: 390,
    height: 844,
    isMobile: true,
    url: `${baseUrl}/`,
    scrollDeltaY: 2450,
  });

  // 2. Mobile Product Cards Scrolled (second row)
  await captureViewport({
    name: 'glorov_mobile_product_cards_scrolled_verified.png',
    width: 390,
    height: 844,
    isMobile: true,
    url: `${baseUrl}/`,
    scrollDeltaY: 2770,
  });

  // 3. Mobile Cart Recommendations
  await captureViewport({
    name: 'glorov_mobile_cart_recommendations_verified.png',
    width: 390,
    height: 844,
    isMobile: true,
    url: `${baseUrl}/cart/`,
    scrollDeltaY: 280,
  });

  // 4. Tablet Product Grid (3 columns)
  await captureViewport({
    name: 'glorov_tablet_product_grid_verified.png',
    width: 768,
    height: 1024,
    isMobile: false,
    url: `${baseUrl}/`,
    scrollDeltaY: 2450,
  });

  // 5. Desktop Product Grid (4 columns)
  await captureViewport({
    name: 'glorov_desktop_product_grid_verified.png',
    width: 1280,
    height: 800,
    isMobile: false,
    url: `${baseUrl}/`,
    scrollDeltaY: 2700,
  });

  console.log('All viewports captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
