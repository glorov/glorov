import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/5524078c-a6b2-4de6-a4e4-4e42c2d0d373';
mkdirSync(ARTIFACT_DIR, { recursive: true });

async function createChrome(port, width, height, isMobile) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--user-data-dir=/tmp/flutter-verify-grid-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=' + width + ',' + height,
    '--remote-debugging-port=' + port,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let target = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const listRes = await fetch('http://127.0.0.1:' + port + '/json/list');
      const pages = await listRes.json();
      target = pages.find((p) => p.type === 'page') || pages[0];
      if (target?.webSocketDebuggerUrl) break;
    } catch {}
  }

  if (!target?.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Failed to obtain target webSocketDebuggerUrl on port ' + port);
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

  return { chrome, send, ws };
}

async function capture() {
  const port = 9590;
  // Create tablet session
  const session = await createChrome(port, 768, 1024, false);
  try {
    console.log('Navigating to http://localhost:8086/vegetables/ on tablet...');
    await session.send('Page.navigate', { url: 'http://localhost:8086/vegetables/' });
    await new Promise((r) => setTimeout(r, 4500));

    const screenshot = await session.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, 'glorov_tablet_product_grid_3col.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  } finally {
    session.ws.close();
    session.chrome.kill('SIGTERM');
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
