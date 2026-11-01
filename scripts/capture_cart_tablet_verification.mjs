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
  const port = 9550 + Math.floor(Math.random() * 100);
  console.log(`Starting Chrome session on port ${port}...`);

  // --- Session 1: Mobile Cart Verification (390x844) ---
  const mobileSession = await createChrome(port, 390, 844, true);
  try {
    const { send } = mobileSession;

    // 1. Visit Home first to establish origin & set localStorage cart items
    console.log('1. Setting cart items in mobile session...');
    await send('Page.navigate', { url: `${baseUrl}/` });
    await new Promise((r) => setTimeout(r, 3000));

    await send('Runtime.evaluate', {
      expression: `
        window.localStorage.setItem('glorov_cart_items', JSON.stringify([
          { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 3 },
          { "productId": "glr-seed-01", "variantId": "var-methi-1", "quantity": 2 }
        ]));
        window.localStorage.removeItem('glorov_applied_coupon');
      `
    });

    // Navigate to Cart
    console.log('2. Navigating to mobile /cart/...');
    await send('Page.navigate', { url: `${baseUrl}/cart/` });
    await new Promise((r) => setTimeout(r, 4000));

    // Capture Mobile Cart Top View
    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    let filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_cart_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

    // Scroll down to show recommendations and custom scrollbar
    console.log('3. Scrolling down mobile cart to reveal scrollbar & recommendations...');
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 195,
      y: 400,
      deltaX: 0,
      deltaY: 500,
    });
    await new Promise((r) => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_cart_scrolled_scrollbar.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

    // Navigate to Home and scroll down to verify bottom nav clearance
    console.log('4. Navigating to Home and scrolling to bottom for nav clearance verification...');
    await send('Page.navigate', { url: `${baseUrl}/` });
    await new Promise((r) => setTimeout(r, 3500));

    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 195,
      y: 400,
      deltaX: 0,
      deltaY: 1400,
    });
    await new Promise((r) => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    filePath = path.join(ARTIFACT_DIR, 'glorov_mobile_home_bottom_nav_clearance.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

  } finally {
    mobileSession.ws.close();
    mobileSession.chrome.kill('SIGTERM');
  }

  // --- Session 2: Tablet Verification (768x1024) ---
  const tabletPort = port + 1;
  console.log(`Starting Tablet Chrome session on port ${tabletPort}...`);
  const tabletSession = await createChrome(tabletPort, 768, 1024, false);
  try {
    const { send } = tabletSession;

    // Set localStorage cart items
    await send('Page.navigate', { url: `${baseUrl}/` });
    await new Promise((r) => setTimeout(r, 3000));

    await send('Runtime.evaluate', {
      expression: `
        window.localStorage.setItem('glorov_cart_items', JSON.stringify([
          { "productId": "glr-flo-10", "variantId": "var-cosmos-mix-seeds-1", "quantity": 3 },
          { "productId": "glr-seed-01", "variantId": "var-methi-1", "quantity": 2 }
        ]));
        window.localStorage.removeItem('glorov_applied_coupon');
      `
    });

    // Navigate to Cart in tablet mode
    console.log('5. Navigating to tablet /cart/...');
    await send('Page.navigate', { url: `${baseUrl}/cart/` });
    await new Promise((r) => setTimeout(r, 4000));

    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    let filePath = path.join(ARTIFACT_DIR, 'glorov_tablet_cart_2col_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

    // Navigate to Discover / Catalog in tablet mode to verify 3-column product grid
    console.log('6. Navigating to tablet /discover/ for 3-column grid verification...');
    await send('Page.navigate', { url: `${baseUrl}/discover/` });
    await new Promise((r) => setTimeout(r, 4000));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    filePath = path.join(ARTIFACT_DIR, 'glorov_tablet_3col_grid_verified.png');
    writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);

  } finally {
    tabletSession.ws.close();
    tabletSession.chrome.kill('SIGTERM');
  }

  console.log('All verification screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
