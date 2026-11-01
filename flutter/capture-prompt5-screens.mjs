import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = 'flutter/screenshots';
const BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f';

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TARGETS = [
  {
    name: 'glorov-cart-desktop',
    url: 'http://localhost:8086/#/cart',
    width: 1280,
    height: 960,
    isMobile: false,
  },
  {
    name: 'glorov-cart-mobile',
    url: 'http://localhost:8086/#/cart',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-wishlist-desktop',
    url: 'http://localhost:8086/#/bookmark',
    width: 1280,
    height: 960,
    isMobile: false,
  },
  {
    name: 'glorov-wishlist-mobile',
    url: 'http://localhost:8086/#/bookmark',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-checkout-desktop',
    url: 'http://localhost:8086/#/checkout',
    width: 1280,
    height: 1100,
    isMobile: false,
  },
  {
    name: 'glorov-checkout-mobile',
    url: 'http://localhost:8086/#/checkout',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-confirmation-desktop',
    url: 'http://localhost:8086/#/thanks_order',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-confirmation-mobile',
    url: 'http://localhost:8086/#/thanks_order',
    width: 390,
    height: 844,
    isMobile: true,
  },
  {
    name: 'glorov-orders-desktop',
    url: 'http://localhost:8086/#/orders',
    width: 1280,
    height: 1000,
    isMobile: false,
  },
  {
    name: 'glorov-orders-mobile',
    url: 'http://localhost:8086/#/orders',
    width: 390,
    height: 844,
    isMobile: true,
  },
];

async function captureTarget(t, port = 9970) {
  const userDataDir = `/tmp/glr-shot-${t.name}-${Date.now()}`;
  console.log(`Capturing ${t.name} (${t.width}x${t.height}) -> ${t.url}`);

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

  await new Promise((res) => { ws.onopen = res; });
  await send('Page.enable');
  await send('Runtime.enable');

  // Pre-seed localStorage with realistic botanical cart, wishlist, address, and orders
  await send('Page.navigate', { url: 'http://localhost:8086' });
  await new Promise((r) => setTimeout(r, 1000));

  await send('Runtime.evaluate', {
    expression: `
      window.localStorage.setItem('glorov_cart_items', JSON.stringify([
        { productId: 'glr-001', variantId: 'v1', quantity: 1 },
        { productId: 'glr-002', variantId: 'v1', quantity: 2 }
      ]));
      window.localStorage.setItem('glorov_wishlist', JSON.stringify([
        'glr-003', 'glr-004', 'glr-007'
      ]));
      window.localStorage.setItem('glorov_address', JSON.stringify({
        fullName: 'Ananya Sharma',
        phoneNumber: '9876543210',
        addressLine: 'Flat 402, Green Meadows, 12th Main',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        landmark: 'Near Botanical Garden Gate'
      }));
      window.localStorage.setItem('glorov_orders', JSON.stringify([
        {
          id: 'GLR-ORD-2026-8492',
          orderDate: new Date().toISOString(),
          items: [
            {
              productId: 'glr-001',
              title: 'Monstera Deliciosa (Swiss Cheese Plant)',
              botanicalName: 'Monstera deliciosa',
              imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
              variantName: '6-inch Nursery Pot',
              unitPrice: 1249.0,
              quantity: 1,
              lineTotal: 1249.0
            },
            {
              productId: 'glr-002',
              title: 'Italian Genovese Basil Heirloom Seeds',
              botanicalName: 'Ocimum basilicum',
              imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=800&q=80',
              variantName: 'Standard Pack (150 Seeds)',
              unitPrice: 249.0,
              quantity: 2,
              lineTotal: 498.0
            }
          ],
          address: {
            fullName: 'Ananya Sharma',
            phoneNumber: '9876543210',
            addressLine: 'Flat 402, Green Meadows, 12th Main',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            landmark: 'Near Botanical Garden Gate'
          },
          deliveryOption: 'standard',
          paymentMethod: 'cod',
          subtotal: 1747.0,
          shippingCost: 0.0,
          discountAmount: 174.7,
          appliedCoupon: 'GLOROV10',
          totalAmount: 1572.3,
          status: 'Confirmed'
        }
      ]));
    `
  });

  await send('Emulation.setDeviceMetricsOverride', {
    width: t.width,
    height: t.height,
    deviceScaleFactor: 2,
    mobile: t.isMobile,
  });

  await send('Page.navigate', { url: t.url });

  // Wait 7.0 seconds for Flutter CanvasKit / Skia engine and network images to fully render
  await new Promise((r) => setTimeout(r, 7000));

  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(result.data, 'base64');
  const localFile = join(SCREENSHOTS_DIR, `${t.name}.png`);
  const brainFile = join(BRAIN_DIR, `${t.name}.png`);
  const brainAlias = join(BRAIN_DIR, `${t.name.replace(/-/g, '_')}.png`);

  writeFileSync(localFile, buffer);
  writeFileSync(brainFile, buffer);
  writeFileSync(brainAlias, buffer);
  console.log(`✓ Saved ${localFile} (${buffer.length} bytes) and copied to brain.`);

  ws.close();
  chrome.kill('SIGKILL');
}

async function run() {
  for (let i = 0; i < TARGETS.length; i++) {
    await captureTarget(TARGETS[i], 9960 + i);
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log('All Prompt 5 GLOROV screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running capture script:', err);
  process.exit(1);
});
