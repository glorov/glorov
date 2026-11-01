import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:8086';

const PAGES = [
  { name: 'Home Page', path: '/' },
  { name: 'Categories Page', path: '/categories' },
  { name: 'Product Details (Chilli Seeds)', path: '/product/glr-seed-01' },
  { name: 'Product Details (Fenugreek)', path: '/product/glr-her-14' },
  { name: 'Search Page', path: '/search' },
  { name: 'Cart Page', path: '/cart' },
  { name: 'Wishlist Page', path: '/wishlist' },
  { name: 'Checkout Page', path: '/checkout' },
  { name: 'Account Profile', path: '/profile' },
];

async function main() {
  console.log('====================================================');
  console.log('🌿 Starting Persistent Chrome Storefront Multi-Page Audit');
  console.log('====================================================');

  const port = 9977;
  const dataDir = `/tmp/chrome-persistent-audit-${Date.now()}`;

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${dataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,900',
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  try {
    let target = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 150));
      try {
        const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
        const pages = await listRes.json();
        target = pages.find((p) => p.type === 'page') || pages[0];
        if (target?.webSocketDebuggerUrl) break;
      } catch {}
    }
    if (!target) throw new Error('Could not connect to Chrome debugging target');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();
    let consoleLogs = [];
    let exceptions = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: data.params.type, text });
      }
      if (data.method === 'Runtime.exceptionThrown') {
        exceptions.push(data.params.exceptionDetails.text + ' ' + (data.params.exceptionDetails.exception?.description || ''));
      }
    };
    await new Promise((r) => (ws.onopen = r));

    const send = (method, params = {}) => {
      const msgId = id++;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    for (const page of PAGES) {
      consoleLogs = [];
      exceptions = [];
      const fullUrl = `${BASE_URL}${page.path}`;
      process.stdout.write(`Auditing ${page.name} (${page.path})... `);

      const startTime = Date.now();
      await send('Page.navigate', { url: fullUrl });

      let loaded = false;
      let loadDuration = 0;
      for (let check = 0; check < 40; check++) {
        await new Promise((r) => setTimeout(r, 200));
        const res = await send('Runtime.evaluate', {
          expression: `({
            title: document.title,
            hasFlutterView: !!document.querySelector('flutter-view') || !!document.querySelector('flt-glass-pane'),
            splashRemoved: !document.getElementById('glorov-splash'),
            canvasCount: document.querySelectorAll('canvas').length
          })`,
          returnByValue: true,
        });

        if (res.result?.value?.hasFlutterView) {
          loaded = true;
          loadDuration = Date.now() - startTime;
          break;
        }
      }

      if (loaded) {
        // Test responsiveness: dispatch mouse scroll and test event loop lag
        const pingStart = Date.now();
        await send('Runtime.evaluate', { expression: '1 + 1', returnByValue: true });
        const pingMs = Date.now() - pingStart;

        // Perform real scroll
        await send('Input.dispatchMouseEvent', {
          type: 'mouseWheel',
          x: 640,
          y: 400,
          deltaX: 0,
          deltaY: 600,
        });
        await new Promise((r) => setTimeout(r, 300));

        console.log(`✅ Loaded in ${loadDuration}ms (Responsive ping: ${pingMs}ms)`);
        const severeLogs = consoleLogs.filter(l => l.type === 'error' || l.text.includes('exception') || l.text.includes('Error'));
        if (severeLogs.length > 0) {
          console.log(`   ⚠️ Log errors:`, severeLogs.map(l => l.text));
        }
      } else {
        console.log(`❌ Timeout waiting for page render`);
      }
    }

    await send('Browser.close').catch(() => {});
    chrome.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
    console.log('\n🌿 Multi-page audit completed successfully!');
  } catch (err) {
    chrome.kill();
    console.error('Fatal audit error:', err);
  }
}

main();
