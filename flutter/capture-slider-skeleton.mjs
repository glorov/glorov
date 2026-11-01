import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';
const SCREENSHOTS_DIR = 'flutter/screenshots';

mkdirSync(ARTIFACT_DIR, { recursive: true });
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  const port = 9997;
  const userDataDir = `/tmp/glr-slider-skeleton-${Date.now()}`;

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
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

  if (!pageTarget?.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Chrome target not found');
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

  await new Promise((r) => {
    ws.onopen = r;
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  const targets = [
    {
      name: 'slider_skeleton_desktop_1440x900',
      url: 'http://localhost:8086/#/skeleton',
      width: 1440,
      height: 900,
      mobile: false,
      wait: 2200,
    },
    {
      name: 'slider_skeleton_tablet_768x1024',
      url: 'http://localhost:8086/#/skeleton',
      width: 768,
      height: 1024,
      mobile: true,
      wait: 2000,
    },
    {
      name: 'slider_skeleton_mobile_390x844',
      url: 'http://localhost:8086/#/skeleton',
      width: 390,
      height: 844,
      mobile: true,
      wait: 2000,
    },
    {
      name: 'slider_loaded_desktop_1440x900',
      url: 'http://localhost:8086/#/',
      width: 1440,
      height: 900,
      mobile: false,
      wait: 2600,
    },
    {
      name: 'slider_loaded_mobile_390x844',
      url: 'http://localhost:8086/#/',
      width: 390,
      height: 844,
      mobile: true,
      wait: 2600,
    },
  ];

  for (const t of targets) {
    console.log(`Setting viewport ${t.width}x${t.height}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: t.width,
      height: t.height,
      deviceScaleFactor: 2,
      mobile: t.mobile,
    });

    console.log(`Navigating to ${t.url}...`);
    await send('Page.navigate', { url: t.url });
    await new Promise((r) => setTimeout(r, t.wait));

    console.log(`Capturing ${t.name}...`);
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
    });

    const buffer = Buffer.from(screenshot.data, 'base64');
    const localPath = join(SCREENSHOTS_DIR, `${t.name}.png`);
    const artifactPath = join(ARTIFACT_DIR, `${t.name}.png`);

    writeFileSync(localPath, buffer);
    writeFileSync(artifactPath, buffer);
    console.log(`Saved: ${localPath} and ${artifactPath}`);
  }

  ws.close();
  chrome.kill();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
