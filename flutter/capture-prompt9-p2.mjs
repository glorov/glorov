import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function capture() {
  const port = 9992;
  const userDataDir = `/tmp/glr-prompt9-p2-${Date.now()}`;

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

  const screenshots = [
    {
      name: 'glorov-interactive-profile-account',
      url: 'http://localhost:8086/#/profile',
      width: 1280,
      height: 850,
      hoverCoords: null,
    },
    {
      name: 'glorov-interactive-catalog-filters',
      url: 'http://localhost:8086/#/discover',
      width: 1280,
      height: 850,
      hoverCoords: { x: 450, y: 550 },
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
    await new Promise((r) => setTimeout(r, 2600));

    if (s.hoverCoords) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: s.hoverCoords.x,
        y: s.hoverCoords.y,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

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
