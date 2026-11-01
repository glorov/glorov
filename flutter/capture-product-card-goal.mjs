import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LOCAL_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/667b04b2-0f72-4a23-9f25-eebd01ed54cf';

mkdirSync(LOCAL_DIR, { recursive: true });
mkdirSync(BRAIN_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'flutter_product_card_desktop',
    url: 'http://127.0.0.1:8086/#/',
    width: 1280,
    height: 950,
    isMobile: false,
    wheelScrolls: 14,
    scrollDelta: 160,
  },
  {
    name: 'flutter_product_card_mobile',
    url: 'http://127.0.0.1:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    wheelScrolls: 15,
    scrollDelta: 140,
  },
  {
    name: 'flutter_pdp_wishlist_desktop',
    url: 'http://127.0.0.1:8086/#/product_details?id=glr-her-14',
    width: 1280,
    height: 950,
    isMobile: false,
    wheelScrolls: 1,
    scrollDelta: 50,
  },
];

async function captureTarget(t) {
  const port = 12000 + Math.floor(Math.random() * 4000);
  const userDataDir = `/tmp/glr-goal-ui-${t.name}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  console.log(`Starting capture for ${t.name} (${t.width}x${t.height}) at ${t.url} on port ${port}...`);

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
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await res.json();
      pageTarget = pages.find((p) => p.type === 'page') || pages[0];
      if (pageTarget?.webSocketDebuggerUrl) break;
    } catch (_) {}
  }

  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    console.error(`Could not connect to Chrome page target for ${t.name}`);
    chrome.kill('SIGKILL');
    return;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      const handler = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        } catch (e) {
          reject(e);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });

  // Delay for Flutter CanvasKit / HTML rendering
  console.log(`Waiting for Flutter rendering on ${t.name}...`);
  await new Promise((r) => setTimeout(r, 8500));

  if (t.wheelScrolls && t.wheelScrolls > 0) {
    for (let s = 0; s < t.wheelScrolls; s++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.round(t.width / 2),
        y: Math.round(t.height / 2),
        deltaX: 0,
        deltaY: t.scrollDelta || 150,
      });
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(result.data, 'base64');
  const localFile = join(LOCAL_DIR, `${t.name}.png`);
  const brainFile = join(BRAIN_DIR, `${t.name}.png`);

  writeFileSync(localFile, buffer);
  writeFileSync(brainFile, buffer);
  console.log(`✓ Saved ${t.name}.png to ${brainFile} (${buffer.length} bytes)`);

  ws.close();
  chrome.kill('SIGKILL');
}

async function run() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i]);
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('All Flutter UI screenshots successfully captured!');
}

run().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
