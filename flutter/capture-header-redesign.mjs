import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'glorov-header-desktop-new',
    url: 'http://localhost:8086/#/',
    width: 1280,
    height: 600,
    isMobile: false,
  },
  {
    name: 'glorov-header-mobile-new',
    url: 'http://localhost:8086/#/',
    width: 390,
    height: 700,
    isMobile: true,
  },
];

async function captureTarget(t, port = 9990) {
  const userDataDir = `/tmp/glr-header-new-${t.name}-${Date.now()}`;
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

  // Initial render delay for CanvasKit
  await new Promise((r) => setTimeout(r, 7000));

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
    await captureTarget(TARGETS[i], 9990 + i);
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log('New header screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error in header capture:', err);
  process.exit(1);
});
