import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'glorov-hero-banner-new-desktop-slide1',
    url: 'http://127.0.0.1:8086/#/',
    width: 1280,
    height: 800,
    isMobile: false,
    delay: 4500,
  },
  {
    name: 'glorov-hero-banner-new-mobile-slide1',
    url: 'http://127.0.0.1:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    delay: 4500,
  },
];

async function captureTarget(t, port = 9993) {
  const userDataDir = `/tmp/glr-banner-${t.name}-${Date.now()}`;
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
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });
  await new Promise((r) => setTimeout(r, t.delay));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');

  const localFile = join(SCREENSHOTS_DIR, `${t.name}.png`);
  const brainFile = join(BRAIN_DIR, `${t.name}.png`);
  writeFileSync(localFile, buf);
  writeFileSync(brainFile, buf);
  console.log(`Saved screenshot to ${localFile} and ${brainFile}`);

  ws.close();
  chrome.kill();
}

async function main() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i], 9993 + i);
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('Capture complete!');
}

main().catch(console.error);
