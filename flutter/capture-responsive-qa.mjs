import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const QA_DIR = 'flutter/screenshots/qa';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(QA_DIR, { recursive: true });

// Breakpoints required by Section 6 of Prompt 7:
// - Desktop: 1440 px
// - Laptop: 1280 px
// - Tablet: 768 px
// - Mobile: 390 px
// - Narrow mobile: 320 px
const BREAKPOINTS = [
  { label: 'desktop-1440', width: 1440, height: 900, isMobile: false },
  { label: 'laptop-1280', width: 1280, height: 800, isMobile: false },
  { label: 'tablet-768', width: 768, height: 1024, isMobile: true },
  { label: 'mobile-390', width: 390, height: 844, isMobile: true },
  { label: 'narrow-320', width: 320, height: 640, isMobile: true },
];

const PAGES = [
  { name: 'home', route: '#/entry_point' },
  { name: 'catalog', route: '#/discover' },
  { name: 'cart', route: '#/cart' },
  { name: 'account', route: '#/profile' },
];

async function captureViewport(page, bp) {
  const port = 9250 + Math.floor(Math.random() * 40);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--hide-scrollbars',
    `--window-size=${bp.width},${bp.height}`,
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        if (wsUrl) break;
      } catch (_) {}
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome port');

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        const handler = (evt) => {
          const res = JSON.parse(evt.data);
          if (res.id === msgId) {
            ws.removeEventListener('message', handler);
            if (res.error) reject(res.error);
            else resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Target.setDiscoverTargets', { discover: true });
    const targetUrl = `http://localhost:8086/${page.route}`;
    const { targetId } = await send('Target.createTarget', { url: targetUrl });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function sendSession(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        const handler = (evt) => {
          const res = JSON.parse(evt.data);
          if (res.id === msgId) {
            ws.removeEventListener('message', handler);
            if (res.error) reject(res.error);
            else resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
      });
    }

    await sendSession('Page.enable');
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: bp.width,
      height: bp.height,
      deviceScaleFactor: 2,
      mobile: bp.isMobile,
    });

    // Wait for Flutter Web render to settle
    await new Promise((r) => setTimeout(r, 3600));

    // Evaluate if there is unintended horizontal overflow
    const evalResult = await sendSession('Runtime.evaluate', {
      expression: 'document.documentElement.scrollWidth > document.documentElement.clientWidth',
      returnByValue: true,
    });
    const hasHorizontalOverflow = evalResult?.result?.value;

    const { data } = await sendSession('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
    });

    const filename = `glorov-qa-${page.name}-${bp.label}.png`;
    const localPath = join(QA_DIR, filename);
    const brainPath = join(BRAIN_DIR, filename);
    const buffer = Buffer.from(data, 'base64');
    writeFileSync(localPath, buffer);
    writeFileSync(brainPath, buffer);

    console.log(`[QA CAPTURED] ${page.name} @ ${bp.label} (${bp.width}x${bp.height}) | Overflow: ${hasHorizontalOverflow ? 'YES (Defect)' : 'None (Clean)'}`);

    ws.close();
  } finally {
    chrome.kill();
  }
}

async function run() {
  console.log(`Running QA responsive audit across ${PAGES.length} pages x ${BREAKPOINTS.length} breakpoints...`);
  for (const page of PAGES) {
    for (const bp of BREAKPOINTS) {
      try {
        await captureViewport(page, bp);
      } catch (e) {
        console.error(`[ERROR] Failed ${page.name} @ ${bp.label}:`, e.message);
      }
    }
  }
  console.log('QA responsive audit finished.');
}

run();
