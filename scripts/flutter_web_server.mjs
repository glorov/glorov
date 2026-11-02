import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = path.resolve('flutter/build/web');
const PORT = 8086;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {}
  let filePath = path.join(WEB_DIR, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      filePath = path.join(WEB_DIR, 'index.html');
    }
  }

  // If the file does not exist directly, try resolving relative asset paths from root
  if (!fs.existsSync(filePath)) {
    // Check if the relative asset exists directly under WEB_DIR (e.g. /checkout/main.dart.js -> /main.dart.js)
    const baseName = path.basename(urlPath);
    const rootCandidate = path.join(WEB_DIR, baseName);
    if (fs.existsSync(rootCandidate) && !fs.statSync(rootCandidate).isDirectory()) {
      filePath = rootCandidate;
    } else {
      // Check if subpath relative to root exists (e.g. /checkout/assets/... -> /assets/...)
      const matchAssets = urlPath.match(/\/(assets|canvaskit|icons)\/(.+)$/);
      if (matchAssets) {
        const subCandidate = path.join(WEB_DIR, matchAssets[1], matchAssets[2]);
        if (fs.existsSync(subCandidate)) {
          filePath = subCandidate;
        } else {
          filePath = path.join(WEB_DIR, 'index.html');
        }
      } else {
        filePath = path.join(WEB_DIR, 'index.html');
      }
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading ${filePath} for ${req.url}:`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`GLOROV Flutter Web SPA server running on http://localhost:${PORT}`);
});
