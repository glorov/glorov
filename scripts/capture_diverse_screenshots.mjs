import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('../node_modules/.pnpm/node_modules/puppeteer-core');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'docs/elsesourav-publish/screenshots');
const artifactDir = '/Users/sourav/.gemini/antigravity/brain/9d657dea-bcab-4b34-b46d-8f336ce394b0/screenshots';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function capture() {
  console.log('Launching Puppeteer Chrome for Diverse Screenshots...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const shots = [
    // 1. Desktop Views (1920x1080 at 2x Retina scale)
    {
      name: 'desktop_01_homepage.png',
      url: 'https://www.glorov.com',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2500,
      action: async (page) => {
        // Scroll slightly to settle animations
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'desktop_02_homepage_trust_bar.png',
      url: 'https://www.glorov.com',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2000,
      action: async (page) => {
        // Scroll down to show featured categories and 4 trust cards
        await page.evaluate(() => window.scrollTo({ top: 580, behavior: 'instant' }));
        await new Promise(r => setTimeout(r, 800));
      }
    },
    {
      name: 'desktop_03_categories_catalog.png',
      url: 'https://www.glorov.com/categories',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'desktop_04_product_detail_hero.png',
      url: 'https://www.glorov.com/products/tomato-vegetable-seeds',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2500,
      action: async (page) => {
        // Fill pincode input to show live pincode check feature
        await page.evaluate(() => {
          const inp = document.querySelector('input[placeholder*="Pincode"]');
          if (inp) {
            inp.value = '560001';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }
    },
    {
      name: 'desktop_05_product_specs_care.png',
      url: 'https://www.glorov.com/products/tomato-vegetable-seeds',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2000,
      action: async (page) => {
        // Scroll to specifications and description
        await page.evaluate(() => window.scrollTo({ top: 650, behavior: 'instant' }));
        await new Promise(r => setTimeout(r, 800));
      }
    },
    {
      name: 'desktop_06_cart_page.png',
      url: 'https://www.glorov.com/cart',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'desktop_07_search_discovery.png',
      url: 'https://www.glorov.com/search?q=seeds',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'desktop_08_admin_portal.png',
      url: 'https://admin.glorov.com',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
      waitFor: 3000,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },

    // 2. Mobile Views (iPhone 16 Pro Viewport 393 x 852 at 2x scale)
    {
      name: 'mobile_01_homepage.png',
      url: 'https://www.glorov.com',
      viewport: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'mobile_02_categories.png',
      url: 'https://www.glorov.com/categories',
      viewport: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'mobile_03_product_detail.png',
      url: 'https://www.glorov.com/products/tomato-vegetable-seeds',
      viewport: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    },
    {
      name: 'mobile_04_cart.png',
      url: 'https://www.glorov.com/cart',
      viewport: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      waitFor: 2500,
      action: async (page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    }
  ];

  for (const shot of shots) {
    console.log(`Capturing: ${shot.name}...`);
    const page = await browser.newPage();
    await page.setViewport(shot.viewport);
    try {
      await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch {
      console.log(`Warning: Navigation timeout on ${shot.url}, continuing...`);
    }

    if (shot.action) {
      await shot.action(page);
    }
    await new Promise(r => setTimeout(r, shot.waitFor || 1000));

    const outPath = path.join(outDir, shot.name);
    const artPath = path.join(artifactDir, shot.name);
    await page.screenshot({ path: outPath, type: 'png' });
    fs.copyFileSync(outPath, artPath);
    console.log(`  Saved to: ${outPath}`);
    await page.close();
  }

  await browser.close();
  console.log('All diverse screenshots captured successfully!');
}

capture().catch(console.error);
