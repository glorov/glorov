import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:8086';

async function runA11yDeepAudit() {
  const port = 9966;
  const dataDir = `/tmp/chrome-a11y-deep-${Date.now()}`;

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
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
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
    await send('Accessibility.enable');

    console.log('Navigating to Home Page and testing keyboard navigation & accessibility tree...');
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await new Promise((r) => setTimeout(r, 2000));

    // Send Tab keypresses to trigger Flutter semantics activation
    for (let k = 0; k < 5; k++) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
      await new Promise((r) => setTimeout(r, 100));
    }

    // Capture semantic AXTree after keyboard focus
    const axTree = await send('Accessibility.getFullAXTree');
    console.log(`Semantic AXTree nodes count: ${axTree.nodes.length}`);

    // Inspect semantic DOM structure
    const domEval = await send('Runtime.evaluate', {
      expression: `({
        semanticsCount: document.querySelectorAll('[aria-label], [role], button, input, a').length,
        buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
          label: b.getAttribute('aria-label') || b.innerText,
          role: b.getAttribute('role'),
        })).slice(0, 10),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          hasAriaLabel: !!i.getAttribute('aria-label')
        }))
      })`,
      returnByValue: true,
    });

    console.log('DOM Semantics Summary:', JSON.stringify(domEval.result?.value, null, 2));

    await send('Browser.close').catch(() => {});
    chrome.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  } catch (err) {
    chrome.kill();
    console.error('A11y audit error:', err);
  }
}

runA11yDeepAudit();
