import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'glorov-account-desktop',
    url: 'http://localhost:8086/#/profile',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-account-mobile',
    url: 'http://localhost:8086/#/profile',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-profile-desktop',
    url: 'http://localhost:8086/#/user_info',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-profile-mobile',
    url: 'http://localhost:8086/#/user_info',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-addressbook-desktop',
    url: 'http://localhost:8086/#/addresses',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-addressbook-mobile',
    url: 'http://localhost:8086/#/addresses',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-notifications-desktop',
    url: 'http://localhost:8086/#/notifications',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-notifications-mobile',
    url: 'http://localhost:8086/#/notifications',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-help-faq-desktop',
    url: 'http://localhost:8086/#/faq',
    width: 1280,
    height: 1100,
    isMobile: false,
  },
  {
    name: 'glorov-help-faq-mobile',
    url: 'http://localhost:8086/#/faq',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-support-desktop',
    url: 'http://localhost:8086/#/contact_support',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-support-mobile',
    url: 'http://localhost:8086/#/contact_support',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-settings-desktop',
    url: 'http://localhost:8086/#/preferences',
    width: 1280,
    height: 1100,
    isMobile: false,
  },
  {
    name: 'glorov-settings-mobile',
    url: 'http://localhost:8086/#/preferences',
    width: 390,
    height: 844,
    isMobile: true,
  },
];

async function captureTarget(target) {
  const port = 9223 + Math.floor(Math.random() * 50);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--hide-scrollbars',
    `--window-size=${target.width},${target.height}`,
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

    if (!wsUrl) throw new Error('Could not connect to Chrome debugging port');

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
    const { targetId } = await send('Target.createTarget', { url: target.url });
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
      width: target.width,
      height: target.height,
      deviceScaleFactor: 2,
      mobile: target.isMobile,
    });

    // Wait for Flutter web rendering to complete
    await new Promise((r) => setTimeout(r, 3800));

    const { data } = await sendSession('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
    });

    const localPath = join(SCREENSHOTS_DIR, `${target.name}.png`);
    const brainPath = join(BRAIN_DIR, `${target.name}.png`);
    const buffer = Buffer.from(data, 'base64');
    writeFileSync(localPath, buffer);
    writeFileSync(brainPath, buffer);
    console.log(`[CAPTURED] ${target.name} (${target.width}x${target.height}) -> ${localPath}`);

    ws.close();
  } finally {
    chrome.kill();
  }
}

async function run() {
  console.log(`Starting capture of ${TARGETS.length} account & support views...`);
  for (const target of TARGETS) {
    try {
      await captureTarget(target);
    } catch (e) {
      console.error(`[ERROR] Failed to capture ${target.name}:`, e.message);
    }
  }
  console.log('Capture process finished.');
}

run();
