import { spawn, execFile } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9944;
const USER_DATA_DIR = `/tmp/glorov-catalog-fetch-${Date.now()}`;

// 11 Subcategories matching Flutter Category taxonomy
const CATEGORY_MAPPINGS = [
  {
    category: 'Seeds',
    categorySlug: 'seeds',
    subcategory: 'Vegetable Seeds',
    subcategorySlug: 'vegetable-seeds',
    collectionHandle: 'indian-essential-vegetables',
    fallbackHandle: 'easy-to-grow-vegetables',
    productType: 'GlorovProductType.seeds',
    defaultTag: '98% Germination',
    targetCount: 6,
  },
  {
    category: 'Seeds',
    categorySlug: 'seeds',
    subcategory: 'Flower Seeds',
    subcategorySlug: 'flower-seeds',
    collectionHandle: 'flower-seeds',
    fallbackHandle: 'garden-flower-seeds',
    productType: 'GlorovProductType.seeds',
    defaultTag: 'Vibrant Blooms',
    targetCount: 6,
  },
  {
    category: 'Seeds',
    categorySlug: 'seeds',
    subcategory: 'Fruit & Herb Seeds',
    subcategorySlug: 'herb-seeds',
    collectionHandle: 'herb-seeds',
    fallbackHandle: 'open-pollinated-fruit-seeds',
    productType: 'GlorovProductType.seeds',
    defaultTag: 'Culinary Herb',
    targetCount: 6,
  },
  {
    category: 'Live Plants',
    categorySlug: 'live-plants',
    subcategory: 'Indoor Plants',
    subcategorySlug: 'indoor-plants',
    collectionHandle: 'indoor-plants',
    fallbackHandle: 'foliage-plants',
    productType: 'GlorovProductType.plants',
    defaultTag: 'Low Maintenance',
    targetCount: 6,
  },
  {
    category: 'Live Plants',
    categorySlug: 'live-plants',
    subcategory: 'Air-Purifying Plants',
    subcategorySlug: 'air-purifying-plants',
    collectionHandle: 'air-purifying-plants',
    fallbackHandle: 'oxygen-plants',
    productType: 'GlorovProductType.plants',
    defaultTag: 'NASA Air Purifier',
    targetCount: 6,
  },
  {
    category: 'Live Plants',
    categorySlug: 'live-plants',
    subcategory: 'Flowering Plants',
    subcategorySlug: 'flowering-plants',
    collectionHandle: 'flowering-plants',
    fallbackHandle: 'flowering-plants-1',
    productType: 'GlorovProductType.plants',
    defaultTag: 'Continuous Blooms',
    targetCount: 6,
  },
  {
    category: 'Live Plants',
    categorySlug: 'live-plants',
    subcategory: 'Succulents & Bonsai',
    subcategorySlug: 'succulents-bonsai',
    collectionHandle: 'cacti-succulents',
    fallbackHandle: 'jade-plant',
    productType: 'GlorovProductType.plants',
    defaultTag: 'Drought Tolerant',
    targetCount: 6,
  },
  {
    category: 'Planters & Pots',
    categorySlug: 'planters-pots',
    subcategory: 'Ceramic Planters',
    subcategorySlug: 'ceramic-planters',
    collectionHandle: 'ceramic-pots',
    fallbackHandle: 'decorative-pots',
    productType: 'GlorovProductType.accessories',
    defaultTag: 'Glazed Ceramic',
    targetCount: 6,
  },
  {
    category: 'Planters & Pots',
    categorySlug: 'planters-pots',
    subcategory: 'Terracotta Pots',
    subcategorySlug: 'terracotta-pots',
    collectionHandle: 'planters',
    fallbackHandle: 'round-pots',
    productType: 'GlorovProductType.accessories',
    defaultTag: 'Natural Clay',
    targetCount: 6,
  },
  {
    category: 'Plant Care & Soil',
    categorySlug: 'plant-care-soil',
    subcategory: 'Potting Mix & Fertilizers',
    subcategorySlug: 'potting-mix-fertilizers',
    collectionHandle: 'soil-manure',
    fallbackHandle: 'organic-fertilizers',
    productType: 'GlorovProductType.accessories',
    defaultTag: '100% Organic',
    targetCount: 6,
  },
  {
    category: 'Plant Care & Soil',
    categorySlug: 'plant-care-soil',
    subcategory: 'Gardening Tools & Kits',
    subcategorySlug: 'gardening-tools',
    collectionHandle: 'garden-tools',
    fallbackHandle: 'pruning-cutting-tools',
    productType: 'GlorovProductType.accessories',
    defaultTag: 'Ergonomic Steel',
    targetCount: 6,
  },
];

function sanitizeBrandText(text) {
  if (!text) return '';
  return text
    .replace(/ugaoo['’]?s/gi, "GLOROV's")
    .replace(/ugaoo/gi, 'GLOROV')
    .replace(/www\.glorov\.com/gi, 'glorov.in')
    .replace(/ugaoo\.com/gi, 'glorov.in')
    .trim();
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function startChrome() {
  console.log(`Starting headless Chrome on port ${PORT}...`);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    'about:blank',
  ]);

  let target = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      target = list.find((p) => p.type === 'page');
      if (target?.webSocketDebuggerUrl) break;
    } catch {}
  }

  if (!target) throw new Error('Could not connect to Chrome debugging port.');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 1;

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (e) => {
        const data = JSON.parse(e.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await new Promise((r) => (ws.onopen = r));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.setUserAgentOverride', {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });

  return { chrome, ws, send };
}

async function downloadAndProcessImage(imgUrl, subcategorySlug, prodSlug, imgIndex) {
  const fullUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl;
  const tempPath = `/tmp/glr-raw-${prodSlug}-${imgIndex}.jpg`;
  const flutterAssetPath = `flutter/assets/images/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`;
  const backendStaticPath = `apps/backend/static/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`;

  if (existsSync(flutterAssetPath) && existsSync(backendStaticPath)) {
    return {
      flutterAssetPath: `assets/images/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`,
      backendStaticPath: `/static/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`,
      cdnUrl: fullUrl,
      brandingReplaced: false,
    };
  }

  // Download raw image via native fetch
  try {
    const res = await fetch(fullUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(tempPath, buf);
  } catch (err) {
    console.error(`  ⚠️ Download failed for ${fullUrl}:`, err.message);
    return null;
  }

  // Run python rebrand worker asynchronously
  try {
    const pyOutput = await new Promise((resolve, reject) => {
      execFile(
        'python3',
        ['scripts/rebrand-image-worker.py', tempPath, flutterAssetPath],
        { timeout: 35000, encoding: 'utf-8' },
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        }
      );
    });

    const result = JSON.parse(pyOutput.trim());
    if (result.branding_found) {
      console.log(`  🎨 Brand Replaced in Image ${imgIndex}: Ugaoo -> Glorov (${result.boxes_detected} box)`);
    }

    // Mirror to backend static directory
    mkdirSync(dirname(backendStaticPath), { recursive: true });
    copyFileSync(flutterAssetPath, backendStaticPath);

    // Clean temp raw file
    try {
      unlinkSync(tempPath);
    } catch {}

    return {
      flutterAssetPath: `assets/images/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`,
      backendStaticPath: `/static/products/${subcategorySlug}/${prodSlug}-${imgIndex}.jpg`,
      cdnUrl: fullUrl,
      brandingReplaced: result.branding_found,
    };
  } catch (err) {
    console.error(`  ⚠️ Image processing worker error for ${tempPath}:`, err.message);
    return null;
  }
}

async function main() {
  const { chrome, ws, send } = await startChrome();
  console.log('🌿 Chrome automation session established.');

  const allExtractedProducts = [];
  let productCounter = 1;

  for (const catDef of CATEGORY_MAPPINGS) {
    console.log(`\n============================================================`);
    console.log(`🌱 Fetching Category: [${catDef.category} > ${catDef.subcategory}]`);
    console.log(`🔗 Target URL: https://www.ugaoo.com/collections/${catDef.collectionHandle}`);

    let collUrl = `https://www.ugaoo.com/collections/${catDef.collectionHandle}`;
    await send('Page.navigate', { url: collUrl });
    await new Promise((r) => setTimeout(r, 5500));

    // Scroll to trigger lazy product card renders
    await send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, 1200);',
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Extract product hrefs from Main Content
    let evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.querySelector('main, #MainContent, [id*="Collection"], [id*="collection"], .main-content') || document;
        const links = Array.from(container.querySelectorAll('a[href*="/products/"]'))
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.includes('/products/'))
          .map(h => h.split('?')[0]);
        return Array.from(new Set(links));
      })()`,
      returnByValue: true,
    });

    let rawLinks = evalRes.result?.value || [];

    // Filter out gift cards, non-products, and tiger-lily from non-flower categories
    let productLinks = rawLinks.filter(
      (l) =>
        !l.includes('gift-card') &&
        !l.includes('subscription') &&
        !l.includes('voucher') &&
        (catDef.subcategorySlug === 'flower-seeds' || !l.includes('tiger-lily'))
    );

    // If too few products found, try fallback collection
    if (productLinks.length < catDef.targetCount && catDef.fallbackHandle) {
      console.log(`⚠️ Few items in ${catDef.collectionHandle}, trying fallback: ${catDef.fallbackHandle}...`);
      await send('Page.navigate', { url: `https://www.ugaoo.com/collections/${catDef.fallbackHandle}` });
      await new Promise((r) => setTimeout(r, 5500));
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1200);' });
      await new Promise((r) => setTimeout(r, 2000));

      evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const container = document.querySelector('main, #MainContent, [id*="Collection"], [id*="collection"], .main-content') || document;
          const links = Array.from(container.querySelectorAll('a[href*="/products/"]'))
            .map(a => a.getAttribute('href'))
            .filter(h => h && h.includes('/products/'))
            .map(h => h.split('?')[0]);
          return Array.from(new Set(links));
        })()`,
        returnByValue: true,
      });
      const extraLinks = (evalRes.result?.value || []).filter(
        (l) =>
          !l.includes('gift-card') &&
          !l.includes('subscription') &&
          !l.includes('voucher') &&
          (catDef.subcategorySlug === 'flower-seeds' || !l.includes('tiger-lily'))
      );
      productLinks = Array.from(new Set([...productLinks, ...extraLinks]));
    }

    const selectedLinks = productLinks.slice(0, catDef.targetCount);
    console.log(`📦 Selected ${selectedLinks.length} products to extract for ${catDef.subcategory}:`);

    for (const link of selectedLinks) {
      const prodHandle = link.replace('/products/', '').trim();
      const jsUrl = `https://www.ugaoo.com/products/${prodHandle}.js`;
      console.log(`\n  ➡️ Fetching product: ${prodHandle}`);

      let prodJson = null;
      try {
        const fetchRes = await send('Runtime.evaluate', {
          expression: `fetch('${jsUrl}').then(r => r.json())`,
          awaitPromise: true,
          returnByValue: true,
        });
        prodJson = fetchRes.result?.value;
      } catch (err) {
        console.error(`  ❌ Failed to fetch ${jsUrl}:`, err);
        continue;
      }

      if (!prodJson || !prodJson.title) {
        console.error(`  ❌ Empty data for ${jsUrl}`);
        continue;
      }

      // Generate Clean Glorov Product Metadata
      const cleanTitle = sanitizeBrandText(prodJson.title);
      const cleanDesc = sanitizeBrandText(stripHtml(prodJson.description || prodJson.content || ''));
      const cleanSlug = prodHandle
        .replace(/ugaoo-?/gi, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '') || `product-${productCounter}`;

      const rawPrice = prodJson.price ? prodJson.price / 100 : 199.0;
      const comparePrice = prodJson.compare_at_price ? prodJson.compare_at_price / 100 : rawPrice * 1.35;
      const effectivePrice = Math.round(rawPrice);
      const effectiveOriginalPrice = Math.round(Math.max(comparePrice, effectivePrice * 1.25));
      const discountPercent = Math.max(
        10,
        Math.min(50, Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100))
      );

      // Process Images (primary + gallery up to 3 images)
      const rawImages = (prodJson.images || []).slice(0, 3);
      const processedImages = [];

      for (let imgIdx = 0; imgIdx < rawImages.length; imgIdx++) {
        const procImg = await downloadAndProcessImage(
          rawImages[imgIdx],
          catDef.subcategorySlug,
          cleanSlug,
          imgIdx + 1
        );
        if (procImg) {
          processedImages.push(procImg);
        }
      }

      if (processedImages.length === 0) {
        console.log(`  ⚠️ No images successfully processed for ${cleanSlug}, skipping.`);
        continue;
      }

      // Parse Variants
      const variants = (prodJson.variants || []).slice(0, 4).map((v, vIdx) => {
        const vPrice = v.price ? Math.round(v.price / 100) : effectivePrice;
        const vOrigPrice = v.compare_at_price ? Math.round(v.compare_at_price / 100) : Math.round(vPrice * 1.3);
        const vTitle = sanitizeBrandText(v.title || `Variant ${vIdx + 1}`);
        return {
          id: `var-${cleanSlug}-${vIdx + 1}`,
          name: vTitle === 'Default Title' ? 'Standard Pack' : vTitle,
          price: vOrigPrice,
          discountPrice: vPrice,
        };
      });

      if (variants.length === 0) {
        variants.push({
          id: `var-${cleanSlug}-1`,
          name: 'Standard Unit',
          price: effectiveOriginalPrice,
          discountPrice: effectivePrice,
        });
      }

      // Ratings & badges
      const rating = +(4.6 + Math.random() * 0.35).toFixed(1);
      const reviewCount = Math.floor(15 + Math.random() * 85);

      const productRecord = {
        id: `glr-${catDef.subcategorySlug.slice(0, 3)}-${String(productCounter).padStart(2, '0')}`,
        slug: cleanSlug,
        title: cleanTitle,
        botanicalName: cleanTitle.split('(')[1]?.replace(')', '')?.trim() || cleanTitle,
        shortDescription: cleanDesc.slice(0, 120).trim() + (cleanDesc.length > 120 ? '...' : ''),
        description: cleanDesc,
        category: catDef.category,
        categorySlug: catDef.categorySlug,
        subcategory: catDef.subcategory,
        subcategorySlug: catDef.subcategorySlug,
        productType: catDef.productType,
        price: effectiveOriginalPrice,
        discountPrice: effectivePrice,
        discountPercent,
        rating,
        reviewCount,
        imageUrls: processedImages.map((i) => i.flutterAssetPath),
        backendImageUrls: processedImages.map((i) => i.backendStaticPath),
        cdnUrls: processedImages.map((i) => i.cdnUrl),
        isBestSeller: productCounter % 3 === 0,
        isFeatured: productCounter % 2 === 0,
        badges: [catDef.defaultTag],
        variants,
      };

      allExtractedProducts.push(productRecord);
      productCounter++;
      console.log(`  ✅ Stored: [${productRecord.id}] "${cleanTitle}" - ₹${effectivePrice} (Orig ₹${effectiveOriginalPrice}) - ${processedImages.length} images`);
    }
  }

  // Save full extracted dataset
  const outputPath = 'artifacts/glorov-extracted-catalog.json';
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(allExtractedProducts, null, 2), 'utf-8');
  console.log(`\n🎉 CATALOG EXTRACTION COMPLETE!`);
  console.log(`Total Products Extracted & Rebranded: ${allExtractedProducts.length}`);
  console.log(`Saved to: ${outputPath}`);

  ws.close();
  chrome.kill();
}

main().catch((err) => {
  console.error('Fatal extraction error:', err);
  process.exit(1);
});
