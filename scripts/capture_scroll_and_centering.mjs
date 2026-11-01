import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/667b04b2-0f72-4a23-9f25-eebd01ed54cf';
mkdirSync(ARTIFACT_DIR, { recursive: true });

async function createChrome(port, width, height, isMobile) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--user-data-dir=/tmp/flutter-verify-scroll-' + Date.now(),
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

  return { chrome, send, ws, width, height };
}

async function capture() {
  console.log('Starting verification captures...');

  // 1. Tablet Landscape (1024 x 768) - Verify category nav is centered (matches user's screenshot resolution)
  {
    console.log('1. Capturing Tablet Landscape (1024x768)...');
    const session = await createChrome(9581, 1024, 768, false);
    try {
      await session.send('Page.navigate', { url: 'http://localhost:8086/' });
      await new Promise((r) => setTimeout(r, 4500));

      const screenshot = await session.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, 'tablet_landscape_1024_centered_nav.png');
      writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved: ${filePath}`);
    } finally {
      session.ws.close();
      session.chrome.kill('SIGTERM');
    }
  }

  // 2. Tablet Portrait (768 x 1024) - Verify category nav is centered
  {
    console.log('2. Capturing Tablet Portrait (768x1024)...');
    const session = await createChrome(9582, 768, 1024, false);
    try {
      await session.send('Page.navigate', { url: 'http://localhost:8086/' });
      await new Promise((r) => setTimeout(r, 4500));

      const screenshot = await session.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, 'tablet_portrait_768_centered_nav.png');
      writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved: ${filePath}`);
    } finally {
      session.ws.close();
      session.chrome.kill('SIGTERM');
    }
  }

  // 3. Mobile Viewport (390 x 844) - Top of page (initial state)
  {
    console.log('3. Capturing Mobile initial state (390x844)...');
    const session = await createChrome(9583, 390, 844, true);
    try {
      await session.send('Page.navigate', { url: 'http://localhost:8086/' });
      await new Promise((r) => setTimeout(r, 4500));

      const screenshot = await session.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACT_DIR, 'mobile_top_initial_nav.png');
      writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved: ${filePath}`);

      // 4. Scroll down 400px - Top nav hides, mobile bottom nav appears
      console.log('4. Scrolling down on mobile...');
      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 195,
        y: 400,
        deltaX: 0,
        deltaY: 500,
      });
      await new Promise((r) => setTimeout(r, 1200));

      const downScreenshot = await session.send('Page.captureScreenshot', { format: 'png' });
      const downFilePath = path.join(ARTIFACT_DIR, 'mobile_scroll_down_nav_state.png');
      writeFileSync(downFilePath, Buffer.from(downScreenshot.data, 'base64'));
      console.log(`Saved: ${downFilePath}`);

      // 5. Scroll up 200px - Top nav reappears, mobile bottom nav hides
      console.log('5. Scrolling up on mobile...');
      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 195,
        y: 400,
        deltaX: 0,
        deltaY: -350,
      });
      await new Promise((r) => setTimeout(r, 1200));

      const upScreenshot = await session.send('Page.captureScreenshot', { format: 'png' });
      const upFilePath = path.join(ARTIFACT_DIR, 'mobile_scroll_up_nav_state.png');
      writeFileSync(upFilePath, Buffer.from(upScreenshot.data, 'base64'));
      console.log(`Saved: ${upFilePath}`);
    } finally {
      session.ws.close();
      session.chrome.kill('SIGTERM');
    }
  }

  console.log('All verification captures completed successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
