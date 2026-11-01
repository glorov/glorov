import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/667b04b2-0f72-4a23-9f25-eebd01ed54cf';

mkdirSync(BRAIN_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'flutter_product_card_desktop',
    url: 'http://127.0.0.1:8086/#/',
    width: 1280,
    height: 950,
    isMobile: false,
    wheelScrolls: 7,
    scrollDelta: 200,
  },
  {
    name: 'flutter_product_card_mobile',
    url: 'http://127.0.0.1:8086/#/',
    width: 390,
    height: 844,
    isMobile: true,
    wheelScrolls: 8,
    scrollDelta: 160,
  },
  {
    name: 'flutter_product_detail_favorite',
    url: 'http://127.0.0.1:8086/#/product_details?id=glr-her-14',
    width: 1280,
    height: 950,
    isMobile: false,
    wheelScrolls: 1,
    scrollDelta: 100,
  },
];

async function captureTarget(t, port = 9980) {
  const userDataDir = `/tmp/glr-goal-shot-${t.name}-${Date.now()}`;
  console.log(`Launching Chrome for ${t.name} (${t.width}x${t.height}) -> ${t.url}`);

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

  await new Promise((res) => {
    ws.onopen = res;
  });
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });

  // Wait 7.5 seconds for Flutter CanvasKit glasspane rendering
  await new Promise((r) => setTimeout(r, 7500));

  if (t.wheelScrolls && t.wheelScrolls > 0) {
    for (let s = 0; s < t.wheelScrolls; s++) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.round(t.width / 2),
        y: Math.round(t.height / 2),
        deltaX: 0,
        deltaY: t.scrollDelta || 180,
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(result.data, 'base64');
  const brainFile = join(BRAIN_DIR, `${t.name}.png`);

  writeFileSync(brainFile, buffer);
  console.log(`✓ Saved ${brainFile} (${buffer.length} bytes)`);

  ws.close();
  chrome.kill('SIGKILL');
}

async function run() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i], 9980 + i);
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log('All Flutter goal screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running showcase capture:', err);
  process.exit(1);
});
