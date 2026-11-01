import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function captureInteraction() {
  const port = 9995;
  const userDataDir = `/tmp/glr-header-interaction-${Date.now()}`;

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,600',
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 600,
    deviceScaleFactor: 2,
    mobile: false,
  });

  await send('Page.navigate', { url: 'http://localhost:8086/#/' });
  await new Promise((r) => setTimeout(r, 7000));

  // Move mouse over "Live Plants" category button (approx x: 420, y: 105)
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 420,
    y: 105,
  });
  await new Promise((r) => setTimeout(r, 800));

  const result = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(result.data, 'base64');
  writeFileSync(join(SCREENSHOTS_DIR, 'glorov-header-hover-interaction.png'), buffer);
  writeFileSync(join(BRAIN_DIR, 'glorov-header-hover-interaction.png'), buffer);
  console.log('✓ Saved glorov-header-hover-interaction.png');

  ws.close();
  chrome.kill('SIGKILL');
}

captureInteraction().catch(console.error);
