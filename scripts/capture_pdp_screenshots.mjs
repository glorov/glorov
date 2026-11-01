import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/dbcd061f-9d07-40a6-9f91-706d752a10d9';
mkdirSync(ARTIFACT_DIR, { recursive: true });

async function createChrome(port, width, height, isMobile) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--user-data-dir=/tmp/flutter-pdp-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=' + width + ',' + height,
    '--remote-debugging-port=' + port,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let target = null;
  for (let attempt = 0; attempt < 50; attempt++) {
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

export async function captureScreenshot(url, filename, width, height, isMobile = false, scrollY = 0) {
  const port = 9330 + Math.floor(Math.random() * 100);
  const session = await createChrome(port, width, height, isMobile);
  try {
    await session.send('Page.navigate', { url });
    // Generous wait for Flutter web CanvasKit / Dom rendering
    await new Promise((r) => setTimeout(r, 4500));

    if (scrollY > 0) {
      if (isMobile) {
        try {
          await session.send('Input.synthesizeScrollGesture', {
            x: Math.floor(width / 2),
            y: Math.floor(height * 0.7),
            yDistance: -scrollY,
            gestureSourceType: 'touch',
          });
        } catch (_) {}
      }

      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.floor(width / 2),
        y: Math.floor(height / 2),
        deltaX: 0,
        deltaY: scrollY,
      });

      await session.send('Runtime.evaluate', {
        expression: `
          window.scrollTo({ top: ${scrollY}, behavior: 'instant' });
          if (document.documentElement) document.documentElement.scrollTop = ${scrollY};
          if (document.body) document.body.scrollTop = ${scrollY};
        `,
      });

      await new Promise((r) => setTimeout(r, 1500));
    }

    const { data } = await session.send('Page.captureScreenshot', {
      format: 'png',
    });

    const filePath = path.join(ARTIFACT_DIR, filename);
    writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot to: ${filePath}`);
    return filePath;
  } finally {
    session.ws.close();
    session.chrome.kill('SIGTERM');
  }
}

async function main() {
  const targetUrl = 'http://localhost:3000/product_details?id=glr-ind-19';

  console.log('1. Capturing Mobile PDP at top (scroll 0)...');
  await captureScreenshot(targetUrl, 'pdp_mobile_top_view.png', 390, 844, true, 0);

  console.log('2. Capturing Mobile PDP middle (scroll 450)...');
  await captureScreenshot(targetUrl, 'pdp_mobile_middle_view.png', 390, 844, true, 450);

  console.log('3. Capturing Mobile PDP scrolled down (scroll 950)...');
  await captureScreenshot(targetUrl, 'pdp_mobile_scrolled_sticky_bar.png', 390, 844, true, 950);

  console.log('4. Capturing Tablet Portrait PDP (768x1024)...');
  await captureScreenshot(targetUrl, 'pdp_tablet_portrait_view.png', 768, 1024, false, 0);

  console.log('5. Capturing Desktop PDP (1440x900)...');
  await captureScreenshot(targetUrl, 'pdp_desktop_view.png', 1440, 900, false, 0);

  console.log('All screenshots captured successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('capture_pdp_screenshots.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
