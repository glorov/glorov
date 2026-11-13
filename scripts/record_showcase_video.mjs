import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('../node_modules/.pnpm/node_modules/puppeteer-core');

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'docs/elsesourav-publish');
const artifactDir = '/Users/sourav/.gemini/antigravity/brain/9d657dea-bcab-4b34-b46d-8f336ce394b0';
const tempDir = path.join(rootDir, '.temp_video_record');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const fontFraunces = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/Fraunces-Bold.ttf')).toString('base64');
const fontPjd = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/fonts/PlusJakartaDisplay-Bold.otf')).toString('base64');
const gloroLogoSvg = fs.readFileSync(path.join(rootDir, 'apps/storefront/public/logo/glorov-logo-stroked.svg'), 'utf8');

const titleCardHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  @font-face {
    font-family: 'Fraunces';
    src: url('data:font/truetype;charset=utf-8;base64,${fontFraunces}') format('truetype');
  }
  @font-face {
    font-family: 'PJD';
    src: url('data:font/opentype;charset=utf-8;base64,${fontPjd}') format('opentype');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px;
    height: 1080px;
    background: #030805;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'PJD', sans-serif;
  }
  .bg-glow {
    position: absolute;
    width: 1000px;
    height: 800px;
    background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.22), transparent 70%);
  }
  .brand-logo {
    height: 60px;
    margin-bottom: 24px;
    filter: drop-shadow(0 0 15px rgba(52, 211, 153, 0.4));
  }
  .brand-logo svg { height: 60px; width: auto; }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 999px;
    padding: 8px 24px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #34d399;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .headline {
    font-family: 'Fraunces', serif;
    font-size: 64px;
    font-weight: 700;
    line-height: 1.15;
    text-align: center;
    margin-bottom: 20px;
  }
  .headline span {
    background: linear-gradient(135deg, #a7f3d0, #34d399, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .sub {
    font-size: 22px;
    color: #94a3b8;
    text-align: center;
    max-width: 900px;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="brand-logo">${gloroLogoSvg}</div>
  <div class="pill">● LIVE PRODUCTION PLATFORM SHOWCASE</div>
  <h1 class="headline">Enterprise-Grade<br><span>Indian Botanical Commerce</span></h1>
  <p class="sub">Full-Stack Next.js 15 App Router &amp; Headless Medusa v2 Monorepo</p>
</body>
</html>
`;

const outroCardHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  @font-face {
    font-family: 'Fraunces';
    src: url('data:font/truetype;charset=utf-8;base64,${fontFraunces}') format('truetype');
  }
  @font-face {
    font-family: 'PJD';
    src: url('data:font/opentype;charset=utf-8;base64,${fontPjd}') format('opentype');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px;
    height: 1080px;
    background: #030805;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'PJD', sans-serif;
  }
  .bg-glow {
    position: absolute;
    width: 1100px;
    height: 800px;
    background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25), transparent 70%);
  }
  .brand-logo {
    height: 56px;
    margin-bottom: 28px;
    filter: drop-shadow(0 0 15px rgba(52, 211, 153, 0.4));
  }
  .brand-logo svg { height: 56px; width: auto; }
  .headline {
    font-family: 'Fraunces', serif;
    font-size: 56px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 24px;
  }
  .headline span {
    background: linear-gradient(135deg, #a7f3d0, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .badges-grid {
    display: flex;
    gap: 20px;
    margin-bottom: 36px;
  }
  .badge-item {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 14px;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .badge-val {
    font-family: 'Fraunces', serif;
    font-size: 28px;
    font-weight: 700;
    color: #34d399;
  }
  .badge-lbl {
    font-size: 13px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .url-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 12px 32px;
    font-size: 20px;
    color: #f1f5f9;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="brand-logo">${gloroLogoSvg}</div>
  <h1 class="headline">GLOROV Botanical Monorepo<br><span>Production Architecture Verified</span></h1>
  <div class="badges-grid">
    <div class="badge-item">
      <div class="badge-val">624 / 624</div>
      <div class="badge-lbl">Tests Passing</div>
    </div>
    <div class="badge-item">
      <div class="badge-val">&lt; 100 ms</div>
      <div class="badge-lbl">Redis Latency</div>
    </div>
    <div class="badge-item">
      <div class="badge-val">103 kB</div>
      <div class="badge-lbl">First Load JS</div>
    </div>
    <div class="badge-item">
      <div class="badge-val">99.9%+</div>
      <div class="badge-lbl">Production SLA</div>
    </div>
  </div>
  <div class="url-pill">Explore Live: https://www.glorov.com</div>
</body>
</html>
`;

async function recordClip({ page, name, durationSec, fps = 30, setup, action }) {
  console.log(`Recording clip [${name}] (${durationSec}s @ ${fps}fps)...`);
  const clipDir = path.join(tempDir, name);
  if (fs.existsSync(clipDir)) fs.rmSync(clipDir, { recursive: true, force: true });
  fs.mkdirSync(clipDir, { recursive: true });

  if (setup) await setup(page);

  const totalFrames = Math.round(durationSec * fps);
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / (totalFrames - 1);
    if (action) await action(page, progress, i, totalFrames);
    const frameFile = path.join(clipDir, `frame_${String(i).padStart(5, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
  }

  // Compile clip to MP4 using ffmpeg
  const clipMp4 = path.join(tempDir, `${name}.mp4`);
  console.log(`  Encoding ${name}.mp4 with ffmpeg...`);
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${path.join(clipDir, 'frame_%05d.jpg')}" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast "${clipMp4}"`,
    { stdio: 'pipe' }
  );
  return clipMp4;
}

async function main() {
  console.log('Launching Chrome for Video Recording...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--force-device-scale-factor=1',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const clipFiles = [];

  // 1. Title Intro Card (3.0 seconds)
  const clip1 = await recordClip({
    page,
    name: 'clip_01_intro',
    durationSec: 3.0,
    fps: 30,
    setup: async (p) => {
      await p.setContent(titleCardHtml, { waitUntil: 'load' });
    },
    action: async (p, progress) => {
      // gentle zoom-in effect
      const scale = 1.0 + progress * 0.03;
      await p.evaluate((s) => {
        document.body.style.transform = `scale(${s})`;
      }, scale);
    }
  });
  clipFiles.push(clip1);

  // 2. Homepage Hero & Smooth Scroll down to Trust Badges (5.0 seconds)
  const clip2 = await recordClip({
    page,
    name: 'clip_02_home_scroll',
    durationSec: 5.0,
    fps: 30,
    setup: async (p) => {
      await p.goto('https://www.glorov.com', { waitUntil: 'networkidle2' });
      await p.evaluate(() => window.scrollTo(0, 0));
    },
    action: async (p, progress) => {
      // Hold at top for 20%, then smooth scroll to 650px
      let scrollTarget = 0;
      if (progress > 0.2) {
        const scrollProg = (progress - 0.2) / 0.8;
        scrollTarget = easeInOutCubic(scrollProg) * 650;
      }
      await p.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    }
  });
  clipFiles.push(clip2);

  // 3. Categories Catalog Exploration (4.0 seconds)
  const clip3 = await recordClip({
    page,
    name: 'clip_03_categories',
    durationSec: 4.0,
    fps: 30,
    setup: async (p) => {
      await p.goto('https://www.glorov.com/categories', { waitUntil: 'networkidle2' });
      await p.evaluate(() => window.scrollTo(0, 0));
    },
    action: async (p, progress) => {
      // Gentle scroll across catalog
      let scrollTarget = 0;
      if (progress > 0.25) {
        const scrollProg = (progress - 0.25) / 0.75;
        scrollTarget = easeInOutCubic(scrollProg) * 450;
      }
      await p.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    }
  });
  clipFiles.push(clip3);

  // 4. Product Detail Page & Live Pincode Check (5.0 seconds)
  const clip4 = await recordClip({
    page,
    name: 'clip_04_product_pincode',
    durationSec: 5.0,
    fps: 30,
    setup: async (p) => {
      await p.goto('https://www.glorov.com/products/tomato-vegetable-seeds', { waitUntil: 'networkidle2' });
      await p.evaluate(() => window.scrollTo(0, 150));
    },
    action: async (p, progress) => {
      // At progress 0.35, type pincode '560001'
      if (progress > 0.35 && progress < 0.65) {
        const textProgress = (progress - 0.35) / 0.3;
        const fullPin = '560001';
        const chars = Math.floor(textProgress * fullPin.length);
        await p.evaluate((val) => {
          const inp = document.querySelector('input[placeholder*="Pincode"]');
          if (inp) {
            inp.value = val;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, fullPin.slice(0, chars));
      } else if (progress >= 0.65) {
        await p.evaluate(() => {
          const inp = document.querySelector('input[placeholder*="Pincode"]');
          if (inp && inp.value !== '560001') {
            inp.value = '560001';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }
    }
  });
  clipFiles.push(clip4);

  // 5. Outro Architecture Card (3.0 seconds)
  const clip5 = await recordClip({
    page,
    name: 'clip_05_outro',
    durationSec: 3.0,
    fps: 30,
    setup: async (p) => {
      await p.setContent(outroCardHtml, { waitUntil: 'load' });
    },
    action: async (p, progress) => {
      const scale = 1.0 + progress * 0.02;
      await p.evaluate((s) => {
        document.body.style.transform = `scale(${s})`;
      }, scale);
    }
  });
  clipFiles.push(clip5);

  await browser.close();

  // Concat all clips into final showcase MP4 using ffmpeg
  console.log('Concatenating clips with ffmpeg...');
  const concatList = path.join(tempDir, 'concat_list.txt');
  const fileLines = clipFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatList, fileLines);

  const finalMp4 = path.join(outDir, 'glorov_showcase_video.mp4');
  const artMp4 = path.join(artifactDir, 'glorov_showcase_video.mp4');

  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -r 30 "${finalMp4}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(finalMp4, artMp4);
  console.log(`Saved Final Video: ${finalMp4} and ${artMp4}`);

  // Also create a lightweight, high-quality animated preview GIF (720p, 12fps, palettegen)
  console.log('Generating high-quality preview GIF...');
  const finalGif = path.join(outDir, 'glorov_showcase_preview.gif');
  const artGif = path.join(artifactDir, 'glorov_showcase_preview.gif');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -ss 0 -t 12 -i "${finalMp4}" -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${finalGif}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(finalGif, artGif);
  console.log(`Saved Preview GIF: ${finalGif} and ${artGif}`);

  // Clean up temporary frame directories
  console.log('Cleaning up temporary files...');
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('Video recording and joining complete!');
}

main().catch(err => {
  console.error('Error during video recording:', err);
  process.exit(1);
});
