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
    '--user-data-dir=/tmp/flutter-verify-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
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

async function run() {
  const baseUrl = 'http://localhost:8086';
  const port = 9600 + Math.floor(Math.random() * 100);
  console.log(`Starting Chrome session on port ${port}...`);

  // --- Session 1: Mobile Product Cards Verification (390x844) ---
  const mobileSession = await createChrome(port, 390, 844, true);
  try {
    const { send } = mobileSession;

    console.log('1. Navigating to Mobile Home...');
    await send('Page.navigate', { url: `${baseUrl}/` });
    await new Promise((r) => setTimeout(r, 4500));

    // Scroll down directly to Featured Seeds & Plants grid into full view (~2450px)
    console.log('2. Scrolling down to Featured Seeds & Plants section...');
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 195,
      y: 400,
      deltaX: 0,
      deltaY: 2450,
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Capture Mobile Featured Product Cards in Full View
    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    let filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_product_cards_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

    // Scroll down another 320px to see the second and third rows of product cards
    console.log('3. Scrolling down to capture second row of product cards...');
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 195,
      y: 400,
      deltaX: 0,
      deltaY: 320,
    });
    await new Promise((r) => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_product_cards_scrolled_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

    // Navigate to Mobile Cart to verify recommendation cards & milestone bar
    console.log('4. Navigating to mobile /cart/...');
    await send('Page.navigate', { url: `${baseUrl}/cart/` });
    await new Promise((r) => setTimeout(r, 4000));

    // Scroll slightly to bring recommendations into full view
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 195,
      y: 400,
      deltaX: 0,
      deltaY: 280,
    });
    await new Promise((r) => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_cart_recommendations_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

  } finally {
    mobileSession.ws.close();
    mobileSession.chrome.kill('SIGTERM');
  }

  // --- Session 2: Tablet Catalog Grid (768x1024) ---
  const tabletPort = port + 1;
  console.log(`Starting Tablet Chrome session on port ${tabletPort}...`);
  const tabletSession = await createChrome(tabletPort, 768, 1024, false);
  try {
    const { send } = tabletSession;

    console.log('5. Navigating to tablet /discover/...');
    await send('Page.navigate', { url: `${baseUrl}/discover/` });
    await new Promise((r) => setTimeout(r, 4500));

    // Scroll to products
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 384,
      y: 500,
      deltaX: 0,
      deltaY: 300,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, 'glorov_tablet_product_grid_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

  } finally {
    tabletSession.ws.close();
    tabletSession.chrome.kill('SIGTERM');
  }

  // --- Session 3: Desktop Verification (1280x800) ---
  const desktopPort = port + 2;
  console.log(`Starting Desktop Chrome session on port ${desktopPort}...`);
  const desktopSession = await createChrome(desktopPort, 1280, 800, false);
  try {
    const { send } = desktopSession;

    console.log('6. Navigating to desktop /discover/...');
    await send('Page.navigate', { url: `${baseUrl}/discover/` });
    await new Promise((r) => setTimeout(r, 4500));

    // Scroll to products
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 640,
      y: 400,
      deltaX: 0,
      deltaY: 280,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, 'glorov_desktop_product_grid_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

  } finally {
    desktopSession.ws.close();
    desktopSession.chrome.kill('SIGTERM');
  }

  console.log('All product card verification screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
