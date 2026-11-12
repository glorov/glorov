import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('../node_modules/.pnpm/node_modules/puppeteer-core');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'docs/elsesourav-publish');
const artifactDir = '/Users/sourav/.gemini/antigravity/brain/9d657dea-bcab-4b34-b46d-8f336ce394b0';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Read assets & fonts as base64
function getBase64(relPath, mimeType) {
  const full = path.join(rootDir, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`File not found: ${full}`);
  }
  const b64 = fs.readFileSync(full).toString('base64');
  return `data:${mimeType};base64,${b64}`;
}

console.log('Loading fonts and images...');
const frauncesBoldB64 = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/Fraunces-Bold.ttf')).toString('base64');
const frauncesSemiBoldB64 = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/Fraunces-SemiBold.ttf')).toString('base64');
const pjdBoldB64 = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/PlusJakartaDisplay-Bold.otf')).toString('base64');
const pjdMedB64 = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/PlusJakartaDisplay-Medium.otf')).toString('base64');
const pjdRegB64 = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/PlusJakartaDisplay-Regular.otf')).toString('base64');

const desktopHomeB64 = getBase64('screenshots/live_desktop_home.png', 'image/png');
const mobileHomeB64 = getBase64('screenshots/live_mobile_home.png', 'image/png');

const gloroLogoSvg = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/logo/glorov-logo-stroked.svg'), 'utf8');
const gloroSymbolSvg = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/logo/glorov-g-symbol.svg'), 'utf8');

// Shared font-face CSS
const fontFaceCss = `
  @font-face {
    font-family: 'Fraunces';
    src: url('data:font/truetype;charset=utf-8;base64,${frauncesBoldB64}') format('truetype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fraunces';
    src: url('data:font/truetype;charset=utf-8;base64,${frauncesSemiBoldB64}') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Plus Jakarta Display';
    src: url('data:font/opentype;charset=utf-8;base64,${pjdBoldB64}') format('opentype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Plus Jakarta Display';
    src: url('data:font/opentype;charset=utf-8;base64,${pjdMedB64}') format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Plus Jakarta Display';
    src: url('data:font/opentype;charset=utf-8;base64,${pjdRegB64}') format('opentype');
    font-weight: 400;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Plus Jakarta Display', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    background: #030805;
    overflow: hidden;
  }
`;

// Helper SVG icons
const icons = {
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  checkShield: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  bolt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  box: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  server: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
  sparkle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  rocket: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2 5-2"></path><path d="M12 9v5s3.03-.55 4.5-2c1.63-1.62 2-5 2-5"></path></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  card: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  location: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  wifi: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  cellular: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="2" y2="17"></line><line x1="7" y1="20" x2="7" y2="13"></line><line x1="12" y1="20" x2="12" y2="9"></line><line x1="17" y1="20" x2="17" y2="5"></line></svg>`,
  battery: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line><line x1="6" y1="11" x2="12" y2="11"></line></svg>`,
};

// 1. APP ICON HTML (512x512)
const appIconHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
${fontFaceCss}
body {
  width: 512px;
  height: 512px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  margin: 0;
}
.icon-container {
  width: 512px;
  height: 512px;
  border-radius: 112px;
  background: radial-gradient(circle at 35% 25%, #184428 0%, #0d2717 48%, #030e07 100%);
  border: 2px solid rgba(52, 211, 153, 0.4);
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.28),
    inset 0 -20px 40px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.glow-spot {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  height: 250px;
  background: radial-gradient(ellipse at center, rgba(52, 211, 153, 0.32), transparent 70%);
  pointer-events: none;
}
.symbol-wrapper {
  width: 300px;
  height: 300px;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 28px rgba(52, 211, 153, 0.45));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  margin-top: -12px;
}
.symbol-wrapper svg {
  width: 100%;
  height: 100%;
}
.brand-wordmark {
  margin-top: 8px;
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 27px;
  letter-spacing: 0.26em;
  color: #f1fdf8;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}
.brand-wordmark span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
}
</style>
</head>
<body>
<div class="icon-container">
  <div class="glow-spot"></div>
  <div class="symbol-wrapper">
    ${gloroSymbolSvg}
  </div>
  <div class="brand-wordmark">
    <span></span>GLOROV<span></span>
  </div>
</div>
</body>
</html>
`;

// 2. DESKTOP FEATURED BANNER HTML (2520x1080 - 21:9)
const desktopBannerHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
${fontFaceCss}
body {
  width: 2520px;
  height: 1080px;
  background: #030805;
  display: flex;
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
.bg-glow-left {
  position: absolute;
  top: 10%;
  left: -8%;
  width: 1200px;
  height: 1000px;
  background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.18), transparent 65%);
  pointer-events: none;
}
.bg-glow-right {
  position: absolute;
  bottom: -15%;
  right: 5%;
  width: 1200px;
  height: 1000px;
  background: radial-gradient(ellipse at center, rgba(5, 150, 105, 0.15), transparent 65%);
  pointer-events: none;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 80px 100px;
  gap: 80px;
  position: relative;
  z-index: 2;
}

.left-col {
  width: 1080px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.brand-logo {
  height: 48px;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}
.brand-logo svg {
  height: 48px;
  width: auto;
}
.pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #34d399;
  text-transform: uppercase;
}
.pill-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.headline {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 74px;
  line-height: 1.08;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}
.headline .gradient-text {
  background: linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subheadline {
  font-size: 23px;
  line-height: 1.5;
  color: #94a3b8;
  max-width: 980px;
  font-weight: 400;
}

.pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}
.tech-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 10px;
}
.stat-box {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(52, 211, 153, 0.2);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-value {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 32px;
  color: #ffffff;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.stat-value .unit {
  font-family: 'Plus Jakarta Display', sans-serif;
  font-size: 16px;
  color: #34d399;
  font-weight: 600;
}
.stat-label {
  font-size: 13px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

/* Right Column: Browser Window */
.right-col {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.browser-frame {
  width: 1180px;
  height: 728px;
  border-radius: 20px;
  background: #0f1712;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 35px 80px rgba(0, 0, 0, 0.8),
    0 0 50px rgba(16, 185, 129, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.browser-header {
  height: 52px;
  background: #141f18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  flex-shrink: 0;
}

.traffic-lights {
  display: flex;
  gap: 8px;
}
.traffic-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #10b981; }

.url-bar {
  flex: 1;
  max-width: 580px;
  margin: 0 auto;
  height: 32px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  font-family: -apple-system, monospace;
}
.url-bar .host {
  color: #f1f5f9;
  font-weight: 500;
}

.browser-viewport {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #08120b;
}
.browser-screenshot {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: top center;
}

.floating-badge-top {
  position: absolute;
  top: 70px;
  right: -25px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(52, 211, 153, 0.45);
  backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  z-index: 10;
}
.floating-badge-top .badge-text {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.floating-badge-top .badge-sub {
  font-size: 11px;
  color: #34d399;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.floating-badge-bottom {
  position: absolute;
  bottom: 40px;
  left: -35px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.45);
  backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  z-index: 10;
}
.floating-badge-bottom .badge-text {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}
.floating-badge-bottom .badge-sub {
  font-size: 12px;
  color: #38bdf8;
  font-weight: 500;
}
</style>
</head>
<body>
<div class="bg-grid"></div>
<div class="bg-glow-left"></div>
<div class="bg-glow-right"></div>

<div class="content">
  <div class="left-col">
    <div class="brand-header">
      <div class="brand-logo">${gloroLogoSvg}</div>
      <div class="pill-badge">
        <span class="dot"></span>
        v1.0.0 Production Release
      </div>
    </div>

    <h1 class="headline">
      Enterprise-Grade<br>
      <span class="gradient-text">Indian Botanical</span><br>
      Commerce Engine
    </h1>

    <p class="subheadline">
      A battle-hardened full-stack monorepo uniting Next.js 15 App Router, Medusa.js headless commerce, Razorpay webhooks, and live Shiprocket logistics.
    </p>

    <div class="pills-row">
      <div class="tech-pill">${icons.bolt} Next.js 15 & React 19</div>
      <div class="tech-pill">${icons.box} Medusa.js Engine</div>
      <div class="tech-pill">${icons.card} Razorpay UPI & COD</div>
      <div class="tech-pill">${icons.truck} Shiprocket Logistics</div>
      <div class="tech-pill">${icons.check} 624 Unit Tests Passed</div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">&lt; 100 <span class="unit">ms</span></div>
        <div class="stat-label">Redis API Latency</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">103 <span class="unit">kB</span></div>
        <div class="stat-label">First Load JS Bundle</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">₹5,000 <span class="unit">Max</span></div>
        <div class="stat-label">COD Safeguard Cap</div>
      </div>
    </div>
  </div>

  <div class="right-col">
    <div class="browser-frame">
      <div class="browser-header">
        <div class="traffic-lights">
          <div class="traffic-dot dot-red"></div>
          <div class="traffic-dot dot-yellow"></div>
          <div class="traffic-dot dot-green"></div>
        </div>
        <div class="url-bar">
          ${icons.lock}
          <span class="host">https://www.glorov.com</span>
        </div>
      </div>
      <div class="browser-viewport">
        <img class="browser-screenshot" src="${desktopHomeB64}" alt="Glorov Storefront Desktop">
      </div>
    </div>

    <div class="floating-badge-top">
      ${icons.sparkle}
      <div>
        <div class="badge-text">Live Production Storefront</div>
        <div class="badge-sub">Sub-100ms Edge Delivery</div>
      </div>
    </div>

    <div class="floating-badge-bottom">
      ${icons.checkShield}
      <div>
        <div class="badge-text">Audited Security & Logistics</div>
        <div class="badge-sub">100% Automated CI/CD Passing</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
`;

// 3. MOBILE FEATURED BANNER HTML (1080x1440 - 3:4)
const mobileBannerHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
${fontFaceCss}
body {
  width: 1080px;
  height: 1440px;
  background: #030805;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  align-items: center;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
.bg-glow-center {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 850px;
  height: 750px;
  background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.22), transparent 70%);
  pointer-events: none;
}
.bg-glow-bottom {
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(5, 150, 105, 0.16), transparent 70%);
  pointer-events: none;
}

.top-section {
  width: 100%;
  padding: 55px 70px 20px 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand-logo {
  height: 42px;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.35));
}
.brand-logo svg {
  height: 42px;
  width: auto;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  border-radius: 999px;
  padding: 6px 18px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #34d399;
  text-transform: uppercase;
}
.category-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.headline {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 48px;
  line-height: 1.14;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.headline .gradient-text {
  background: linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subheadline {
  font-size: 19.5px;
  line-height: 1.45;
  color: #94a3b8;
  max-width: 840px;
  font-weight: 400;
}

/* Phone Mockup Section */
.phone-section {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  margin-top: 10px;
}

.phone-mockup {
  width: 480px;
  height: 988px;
  border-radius: 56px;
  background: #0f1712;
  border: 10px solid #1f2a24;
  box-shadow: 
    0 35px 85px rgba(0, 0, 0, 0.85),
    0 0 55px rgba(16, 185, 129, 0.18);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* iPhone Status Bar */
.phone-status-bar {
  height: 44px;
  background: #08120b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  z-index: 15;
  flex-shrink: 0;
}
.status-time {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  font-family: -apple-system, sans-serif;
  letter-spacing: -0.01em;
}
.dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 26px;
  background: #000000;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
}
.camera-lens {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #07130a;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.status-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-viewport {
  flex: 1;
  overflow: hidden;
  background: #07130a;
  position: relative;
}
.phone-screenshot {
  width: 100%;
  height: auto;
  display: block;
}

/* Floating Glass Cards */
.floating-card-left {
  position: absolute;
  top: 250px;
  left: 40px;
  width: 255px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(52, 211, 153, 0.45);
  backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
  z-index: 20;
}
.card-icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}
.card-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

.floating-card-right {
  position: absolute;
  top: 480px;
  right: 40px;
  width: 265px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.45);
  backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
  z-index: 20;
}
</style>
</head>
<body>
<div class="bg-grid"></div>
<div class="bg-glow-center"></div>
<div class="bg-glow-bottom"></div>

<div class="top-section">
  <div class="brand-row">
    <div class="brand-logo">${gloroLogoSvg}</div>
    <div class="category-pill">
      <span class="dot"></span>
      Mobile-First Experience
    </div>
  </div>

  <h1 class="headline">
    Living Plants &amp; Rare Seeds<br>
    <span class="gradient-text">Delivered to Your Door</span>
  </h1>

  <p class="subheadline">
    Optimized PWA storefront with 103 kB first-load bundle, instant pincode validation across 30,000+ Indian zones, and high-security COD checkout.
  </p>
</div>

<div class="phone-section">
  <div class="phone-mockup">
    <div class="phone-status-bar">
      <span class="status-time">9:41</span>
      <div class="dynamic-island">
        <div class="camera-lens"></div>
      </div>
      <div class="status-icons">
        ${icons.cellular}
        ${icons.wifi}
        ${icons.battery}
      </div>
    </div>
    <div class="phone-viewport">
      <img class="phone-screenshot" src="${mobileHomeB64}" alt="Glorov Mobile Storefront">
    </div>
  </div>

  <div class="floating-card-left">
    <div class="card-icon-row">
      ${icons.location}
      <div class="card-title">Live Pincode Check</div>
    </div>
    <div class="card-desc">Instant Shiprocket courier ETA &amp; cash-on-delivery validation.</div>
  </div>

  <div class="floating-card-right">
    <div class="card-icon-row">
      ${icons.bolt}
      <div class="card-title">103 kB JS Payload</div>
    </div>
    <div class="card-desc">Sub-second First Contentful Paint with Next.js 15 streaming.</div>
  </div>
</div>
</body>
</html>
`;

// 4. UPDATE COVER IMAGE HTML (1920x1080 - 16:9)
const updateCoverHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
${fontFaceCss}
body {
  width: 1920px;
  height: 1080px;
  background: #030805;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding: 70px 90px;
  justify-content: space-between;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
.bg-glow-top {
  position: absolute;
  top: -10%;
  left: 20%;
  width: 1100px;
  height: 650px;
  background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.18), transparent 70%);
  pointer-events: none;
}
.bg-glow-bottom {
  position: absolute;
  bottom: -15%;
  right: 15%;
  width: 1200px;
  height: 750px;
  background: radial-gradient(ellipse at center, rgba(5, 150, 105, 0.16), transparent 70%);
  pointer-events: none;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}
.brand-logo {
  height: 46px;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.35));
}
.brand-logo svg {
  height: 46px;
  width: auto;
}
.release-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 999px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #34d399;
  text-transform: uppercase;
}
.release-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.center-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  position: relative;
  z-index: 2;
  margin: 10px 0;
}

.center-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.headline {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 66px;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.headline .gradient-text {
  background: linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subheadline {
  font-size: 22.5px;
  line-height: 1.45;
  color: #94a3b8;
  font-weight: 400;
}
.pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tech-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.center-right {
  width: 620px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.preview-card {
  width: 100%;
  height: 340px;
  border-radius: 18px;
  background: #0f1712;
  border: 1.5px solid rgba(52, 211, 153, 0.35);
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.8),
    0 0 40px rgba(16, 185, 129, 0.15);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}
.preview-bar {
  height: 38px;
  background: #141f18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}
.preview-viewport {
  flex: 1;
  overflow: hidden;
  background: #0d1611;
  position: relative;
}
.preview-viewport img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.preview-badge-overlay {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(52, 211, 153, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #34d399;
}

/* Metric Cards Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  position: relative;
  z-index: 2;
}

.metric-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-value {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 38px;
  line-height: 1;
  color: #ffffff;
}
.card-label {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.02em;
}
.card-detail {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.45;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 14.5px;
  color: #64748b;
  position: relative;
  z-index: 2;
}
.footer-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-weight: 600;
}
.footer-badge {
  color: #34d399;
  font-weight: 600;
}
</style>
</head>
<body>
<div class="bg-grid"></div>
<div class="bg-glow-top"></div>
<div class="bg-glow-bottom"></div>

<div class="header-row">
  <div class="brand-logo">${gloroLogoSvg}</div>
  <div class="release-pill">
    <span class="dot"></span>
    OFFICIAL RELEASE ANNOUNCEMENT • v1.0.0
  </div>
</div>

<div class="center-section">
  <div class="center-left">
    <h1 class="headline">
      GLOROV: Enterprise-Grade<br>
      <span class="gradient-text">Botanical E-Commerce Monorepo</span><br>
      Production Architecture
    </h1>
    <p class="subheadline">
      Full-stack Medusa.js headless backend, Next.js 15 App Router storefront, automated Shiprocket fulfillment, Razorpay webhook safeguards, and 624-test verification suite.
    </p>
    <div class="pills-row">
      <div class="tech-tag">${icons.bolt} Next.js 15 &amp; React 19</div>
      <div class="tech-tag">${icons.box} Medusa.js Headless</div>
      <div class="tech-tag">${icons.card} Razorpay UPI &amp; COD</div>
      <div class="tech-tag">${icons.truck} Shiprocket Logistics</div>
      <div class="tech-tag">${icons.check} 624 Unit Tests Passed</div>
    </div>
  </div>

  <div class="center-right">
    <div class="preview-card">
      <div class="preview-bar">
        <div style="display: flex; gap: 6px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
        </div>
        <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-left: 8px;">glorov.com</div>
      </div>
      <div class="preview-viewport">
        <img src="${desktopHomeB64}" alt="Glorov Desktop UI">
        <div class="preview-badge-overlay">
          ${icons.checkShield}
          <span>Verified Production SLA</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="metrics-grid">
  <div class="metric-card" style="border-color: rgba(52, 211, 153, 0.35);">
    <div class="card-top">
      <div class="card-value" style="color: #34d399;">624 / 624</div>
      <div class="card-icon-wrapper">${icons.checkShield}</div>
    </div>
    <div>
      <div class="card-label">Monorepo Tests Passing</div>
      <div class="card-detail">100% pass rate across storefront &amp; backend modules</div>
    </div>
  </div>

  <div class="metric-card" style="border-color: rgba(251, 191, 36, 0.35);">
    <div class="card-top">
      <div class="card-value" style="color: #fbbf24;">&lt; 100 ms</div>
      <div class="card-icon-wrapper">${icons.bolt}</div>
    </div>
    <div>
      <div class="card-label">API Response Latency</div>
      <div class="card-detail">Sliding-window Redis rate limiting &amp; caching</div>
    </div>
  </div>

  <div class="metric-card" style="border-color: rgba(167, 139, 250, 0.35);">
    <div class="card-top">
      <div class="card-value" style="color: #c084fc;">103 kB</div>
      <div class="card-icon-wrapper">${icons.box}</div>
    </div>
    <div>
      <div class="card-label">Storefront First Load JS</div>
      <div class="card-detail">Next.js 15 App Router + React 19 tree-shaken bundle</div>
    </div>
  </div>

  <div class="metric-card" style="border-color: rgba(56, 189, 248, 0.35);">
    <div class="card-top">
      <div class="card-value" style="color: #38bdf8;">99.9%+</div>
      <div class="card-icon-wrapper">${icons.server}</div>
    </div>
    <div>
      <div class="card-label">Production SLA</div>
      <div class="card-detail">Dual-domain Azure PM2 cluster + log rotation</div>
    </div>
  </div>
</div>

<div class="footer-row">
  <div class="footer-tag">
    ${icons.sparkle}
    <span>Engineered &amp; Audited for Production Go-Live</span>
  </div>
  <div class="footer-badge">
    ElseSourav Studio Platform Architecture
  </div>
</div>
</body>
</html>
`;

async function main() {
  console.log('Launching Puppeteer Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=max',
      '--enable-font-antialiasing',
      '--force-device-scale-factor=1'
    ]
  });

  const tasks = [
    {
      name: 'glorov-app-icon.png',
      width: 512,
      height: 512,
      html: appIconHtml,
      omitBackground: true
    },
    {
      name: 'glorov-desktop-banner-21x9.png',
      width: 2520,
      height: 1080,
      html: desktopBannerHtml,
      omitBackground: false
    },
    {
      name: 'glorov-mobile-banner-3x4.png',
      width: 1080,
      height: 1440,
      html: mobileBannerHtml,
      omitBackground: false
    },
    {
      name: 'glorov-update-cover-16x9.png',
      width: 1920,
      height: 1080,
      html: updateCoverHtml,
      omitBackground: false
    }
  ];

  for (const task of tasks) {
    console.log(`Rendering ${task.name} (${task.width}x${task.height})...`);
    const page = await browser.newPage();
    await page.setViewport({
      width: task.width,
      height: task.height,
      deviceScaleFactor: 1
    });

    await page.setContent(task.html, { waitUntil: 'networkidle0' });
    
    // Ensure all fonts are ready
    await page.evaluateHandle('document.fonts.ready');

    const destPath = path.join(outDir, task.name);
    await page.screenshot({
      path: destPath,
      type: 'png',
      omitBackground: task.omitBackground
    });

    // Also copy to artifact directory for embedding
    const artifactPath = path.join(artifactDir, task.name);
    fs.copyFileSync(destPath, artifactPath);

    console.log(`Saved: ${destPath} & ${artifactPath}`);
    await page.close();
  }

  await browser.close();
  console.log('All studio assets rendered successfully!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
