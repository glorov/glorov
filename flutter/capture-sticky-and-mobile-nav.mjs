import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'glorov-sticky-header-desktop-top',
    url: 'http://localhost:8086/#/',
    width: 1280,
    height: 720,
    isMobile: false,
    scrollDown: false,
  },
  {
    name: 'glorov-sticky-header-desktop-scrolled',
    url: 'http://localhost:8086/#/',
    width: 1280,
    height: 720,
    isMobile: false,
    scrollDown: true,
  },
  {
    name: 'glorov-sticky-header-mobile-top',
    url: 'http://localhost:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    scrollDown: false,
  },
  {
    name: 'glorov-sticky-header-mobile-scrolled',
    url: 'http://localhost:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    scrollDown: true,
  },
];

async function captureTarget(t, port = 9992) {
  const userDataDir = `/tmp/glr-sticky-${t.name}-${Date.now()}`;
  console.log(`Capturing ${t.name} (${t.width}x${t.height}) at ${t.url}`);

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
      if (pageTarget) break;
    } catch (_) {}
  }

  if (!pageTarget) {
    console.error('Could not find Chrome page target');
    chrome.kill();
    return;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2.0,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });

  // Wait for Flutter web rendering to stabilize
  await new Promise((r) => setTimeout(r, 4500));

  if (t.scrollDown) {
    // Scroll down 400px to trigger sticky header behavior
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: t.width / 2,
      y: t.height / 2,
      deltaX: 0,
      deltaY: 500,
    });
    await new Promise((r) => setTimeout(r, 1200));
  }

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
  });

  if (screenshot && screenshot.data) {
    const buffer = Buffer.from(screenshot.data, 'base64');
    const localPath = join(SCREENSHOTS_DIR, `${t.name}.png`);
    const brainPath = join(BRAIN_DIR, `${t.name}.png`);
    writeFileSync(localPath, buffer);
    writeFileSync(brainPath, buffer);
    console.log(`Saved screenshot to ${localPath} and ${brainPath}`);
  }

  ws.close();
  chrome.kill();
}

async function main() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i], 9992 + i);
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('All screenshots captured successfully.');
}

main().catch(console.error);
