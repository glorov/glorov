import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/6704a0fd-6670-4208-accd-c4c92f976319';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });
mkdirSync(BRAIN_DIR, { recursive: true });

async function createCdpSession(port, width, height, isMobile) {
  const userDataDir = `/tmp/glr-shot-session-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
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
    chrome.kill('SIGKILL');
    throw new Error(`Failed to find CDP page on port ${port}`);
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
    width,
    height,
    deviceScaleFactor: 2,
    mobile: isMobile,
  });

  async function click(x, y) {
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    await new Promise((r) => setTimeout(r, 100));
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
  }

  async function takeScreenshot(name) {
    const result = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    const buffer = Buffer.from(result.data, 'base64');
    const localFile = join(SCREENSHOTS_DIR, `${name}.png`);
    const brainFile = join(BRAIN_DIR, `${name}.png`);

    writeFileSync(localFile, buffer);
    writeFileSync(brainFile, buffer);
    console.log(`✓ Saved ${localFile} (${buffer.length} bytes) and copied to brain.`);
  }

  async function close() {
    ws.close();
    chrome.kill('SIGKILL');
  }

  return { send, click, takeScreenshot, close };
}

async function run() {
  console.log('=== Step 1: Mobile Category Navigation & Smooth Transitions ===');
  const mobileSession = await createCdpSession(9985, 390, 844, true);
  await mobileSession.send('Page.navigate', { url: 'http://localhost:8089/#/discover' });
  await new Promise((r) => setTimeout(r, 4500));
  await mobileSession.takeScreenshot('glorov-categories-mobile-for-you');

  // Index 1: Seeds (center ~ 44, 230)
  console.log('Clicking Seeds (index 1) in mobile rail (44, 230)...');
  await mobileSession.click(44, 230);
  await new Promise((r) => setTimeout(r, 700));
  await mobileSession.takeScreenshot('glorov-categories-mobile-seeds');

  // Index 2: Live Plants (center ~ 44, 350)
  console.log('Clicking Live Plants (index 2) in mobile rail (44, 350)...');
  await mobileSession.click(44, 350);
  await new Promise((r) => setTimeout(r, 700));
  await mobileSession.takeScreenshot('glorov-categories-mobile-live-plants');

  // Index 3: Planters & Pots (center ~ 44, 470)
  console.log('Clicking Planters & Pots (index 3) in mobile rail (44, 470)...');
  await mobileSession.click(44, 470);
  await new Promise((r) => setTimeout(r, 700));
  await mobileSession.takeScreenshot('glorov-categories-mobile-pots');

  // Index 4: Plant Care & Soil (center ~ 44, 590)
  console.log('Clicking Plant Care & Soil (index 4) in mobile rail (44, 590)...');
  await mobileSession.click(44, 590);
  await new Promise((r) => setTimeout(r, 700));
  await mobileSession.takeScreenshot('glorov-categories-mobile-care');

  await mobileSession.close();

  console.log('=== Step 2: Desktop Responsive Category Showcase ===');
  const desktopSession = await createCdpSession(9986, 1280, 1050, false);
  await desktopSession.send('Page.navigate', { url: 'http://localhost:8089/#/discover' });
  await new Promise((r) => setTimeout(r, 4500));
  await desktopSession.takeScreenshot('glorov-categories-desktop-all');

  // Seeds Tab: center x ~ 185, y ~ 575
  console.log('Clicking Seeds filter tab in desktop view (185, 575)...');
  await desktopSession.click(185, 575);
  await new Promise((r) => setTimeout(r, 800));
  await desktopSession.takeScreenshot('glorov-categories-desktop-seeds');

  // Live Plants Tab: center x ~ 276, y ~ 575
  console.log('Clicking Live Plants filter tab in desktop view (276, 575)...');
  await desktopSession.click(276, 575);
  await new Promise((r) => setTimeout(r, 800));
  await desktopSession.takeScreenshot('glorov-categories-desktop-live-plants');

  // Planters & Pots Tab: center x ~ 392, y ~ 575
  console.log('Clicking Planters & Pots filter tab in desktop view (392, 575)...');
  await desktopSession.click(392, 575);
  await new Promise((r) => setTimeout(r, 800));
  await desktopSession.takeScreenshot('glorov-categories-desktop-pots');

  await desktopSession.close();
  console.log('All goal verification screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running capture script:', err);
  process.exit(1);
});
