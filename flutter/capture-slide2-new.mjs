import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

async function capture(t) {
  const userDataDir = `/tmp/glr-b-${t.name}-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${t.width},${t.height}`,
    `--remote-debugging-port=${t.port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${t.port}/json/list`);
      const pages = await res.json();
      pageTarget = pages.find((p) => p.type === 'page') || pages[0];
      if (pageTarget) break;
    } catch (_) {}
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => { ws.onopen = resolve; });

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
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });
  await new Promise((r) => setTimeout(r, t.delay));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');

  writeFileSync(join(SCREENSHOTS_DIR, `${t.name}.png`), buf);
  writeFileSync(join(BRAIN_DIR, `${t.name}.png`), buf);
  console.log(`Saved ${t.name}.png`);

  ws.close();
  chrome.kill();
}

async function main() {
  await capture({
    name: 'glorov-hero-banner-new-desktop-slide2',
    url: 'http://127.0.0.1:8086/#/',
    width: 1280,
    height: 800,
    isMobile: false,
    delay: 7500,
    port: 9991,
  });
  await capture({
    name: 'glorov-hero-banner-new-mobile-slide2',
    url: 'http://127.0.0.1:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    delay: 7500,
    port: 9992,
  });
}

main().catch(console.error);
