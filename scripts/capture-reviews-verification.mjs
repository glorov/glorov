import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/c602f241-a3d8-413a-9c7b-1b68ec3b738a';
const FLUTTER_SCREENSHOTS_DIR = 'flutter/screenshots';

mkdirSync(ARTIFACT_DIR, { recursive: true });
mkdirSync(FLUTTER_SCREENSHOTS_DIR, { recursive: true });

async function createChrome(port, width, height) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=/tmp/rev-verify-${Date.now()}-${Math.random()}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let target = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await listRes.json();
      target = pages.find((p) => p.type === 'page') || pages[0];
      if (target?.webSocketDebuggerUrl) break;
    } catch {}
  }

  if (!target?.webSocketDebuggerUrl) {
    chrome.kill('SIGTERM');
    throw new Error('Chrome remote debugging connection failed');
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

  await new Promise((r) => {
    ws.onopen = r;
  });

  const send = (method, params = {}) => {
    const msgId = id++;
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  return { chrome, ws, send };
}

async function captureScreenshot({ name, url, width, height, wheelEvents = 0, isMobile = false }) {
  const port = 9980 + Math.floor(Math.random() * 10);
  console.log(`Starting capture for ${name} (${width}x${height})...`);
  const { chrome, ws, send } = await createChrome(port, width, height);

  try {
    await send('Page.enable');
    await send('Network.enable');

    if (isMobile) {
      await send('Emulation.setUserAgentOverride', {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      });
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: true,
      });
    }

    await send('Page.navigate', { url });

    // Wait for Flutter web rendering
    await new Promise((r) => setTimeout(r, 4500));

    // Scroll if needed
    for (let i = 0; i < wheelEvents; i++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.floor(width / 2),
        y: Math.floor(height / 2),
        deltaX: 0,
        deltaY: 500,
      });
      await new Promise((r) => setTimeout(r, 150));
    }

    await new Promise((r) => setTimeout(r, 1200));

    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(data, 'base64');

    const outBrainPath = path.join(ARTIFACT_DIR, `${name}.png`);
    const outFlutterPath = path.join(FLUTTER_SCREENSHOTS_DIR, `${name}.png`);

    writeFileSync(outBrainPath, buffer);
    writeFileSync(outFlutterPath, buffer);

    console.log(`Saved screenshot: ${outBrainPath}`);
  } finally {
    ws.close();
    chrome.kill('SIGTERM');
  }
}

async function main() {
  const targets = [
    {
      name: 'glorov-reviews-desktop-seeds',
      url: 'http://localhost:8086/#/product_details?id=glr-seed-01',
      width: 1440,
      height: 900,
      wheelEvents: 7,
      isMobile: false,
    },
    {
      name: 'glorov-reviews-mobile-seeds',
      url: 'http://localhost:8086/#/product_details?id=glr-seed-01',
      width: 390,
      height: 844,
      wheelEvents: 14,
      isMobile: true,
    },
    {
      name: 'glorov-reviews-desktop-indoor-plant',
      url: 'http://localhost:8086/#/product_details?id=glr-ind-19',
      width: 1440,
      height: 900,
      wheelEvents: 7,
      isMobile: false,
    },
    {
      name: 'glorov-reviews-mobile-ceramic-pot',
      url: 'http://localhost:8086/#/product_details?id=glr-cer-43',
      width: 390,
      height: 844,
      wheelEvents: 14,
      isMobile: true,
    },
    {
      name: 'glorov-reviews-dedicated-screen',
      url: 'http://localhost:8086/#/product_reviews?id=glr-seed-01',
      width: 1440,
      height: 900,
      wheelEvents: 0,
      isMobile: false,
    },
  ];

  for (const t of targets) {
    try {
      await captureScreenshot(t);
    } catch (e) {
      console.error(`Error capturing ${t.name}:`, e);
    }
  }
  console.log('Finished capturing all verification screenshots.');
}

main();
