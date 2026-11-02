#!/usr/bin/env node
/**
 * ==============================================================================
 * GLOROV — Dynamic Product Metadata Pre-renderer & SEO Social Share Generator
 * ==============================================================================
 * Generates static HTML entrypoints for every product (by slug and by ID) under:
 *   - flutter/build/web/product/<slug>/index.html
 *   - flutter/build/web/product/<id>/index.html
 *   - flutter/build/web/products/<slug>/index.html
 *   - flutter/build/web/products/<id>/index.html
 *
 * Each generated page embeds:
 *   1. Full Open Graph metadata (og:title, og:image, og:description, og:url, og:price)
 *   2. Twitter Cards (summary_large_image)
 *   3. Schema.org JSON-LD Structured Data (Product + Offer)
 *   4. Base href="/" so all Flutter Web assets (Wasm, CanvasKit, JS) boot smoothly.
 *
 * When WhatsApp, Facebook, Twitter, LinkedIn, iMessage, Discord, or Slack bot
 * crawls the product link, it instantly gets rich previews with the product image,
 * title, and pricing without needing to run JavaScript or Flutter Web.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_BUILD_DIR = path.join(ROOT_DIR, 'flutter', 'build', 'web');
const BASE_INDEX_PATH = path.join(WEB_BUILD_DIR, 'index.html');
const MOCK_DATA_PATH = path.join(
  ROOT_DIR,
  'flutter',
  'lib',
  'models',
  'glorov',
  'glorov_mock_data.dart'
);

const MEDUSA_HOST = process.env.MEDUSA_HOST || 'api.glorov.tech';
const MEDUSA_PATH = process.env.MEDUSA_PATH || '/medusa/store/products?limit=100';
const PUBLISHABLE_KEY =
  process.env.PUBLISHABLE_KEY ||
  'pk_3e00679a810ca538ba78aedc23b336788d82631606792292cbecad4fc422316a';
const SITE_URL = process.env.SITE_URL || 'https://glorov.tech';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Escapes characters for HTML attribute insertion
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Cleans descriptions of excessive whitespace, newlines, and truncates safely.
 */
function cleanDescription(desc, maxLength = 165) {
  if (!desc) return 'Shop authentic premium seeds, live indoor & outdoor plants, and gardening supplies from GLOROV.';
  const cleaned = desc.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Fetches products from live Medusa API
 */
function fetchMedusaProducts() {
  return new Promise((resolve) => {
    const options = {
      hostname: MEDUSA_HOST,
      port: 443,
      path: MEDUSA_PATH,
      method: 'GET',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      rejectUnauthorized: false,
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const products = json.products || [];
          console.log(`✅ Loaded ${products.length} live products from Medusa API`);
          resolve(
            products.map((p) => {
              const firstVariant = p.variants && p.variants[0];
              const price =
                firstVariant && firstVariant.calculated_price
                  ? firstVariant.calculated_price.calculated_amount
                  : 49;
              return {
                id: p.id,
                slug: p.handle || p.id,
                title: p.title,
                description: p.description,
                image: p.thumbnail || (p.images && p.images[0] && p.images[0].url) || DEFAULT_OG_IMAGE,
                price: price || 49,
                category: (p.categories && p.categories[0] && p.categories[0].name) || 'Gardening',
              };
            })
          );
        } catch (e) {
          console.warn('⚠️  Could not parse Medusa products response:', e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (err) => {
      console.warn('⚠️  Medusa API fetch failed (using fallback mock data):', err.message);
      resolve([]);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn('⚠️  Medusa API request timed out (using fallback mock data)');
      resolve([]);
    });

    req.end();
  });
}

/**
 * Extracts products from GlorovMockData in Dart
 */
function extractMockProducts() {
  if (!fs.existsSync(MOCK_DATA_PATH)) {
    console.warn('⚠️  Mock data file not found:', MOCK_DATA_PATH);
    return [];
  }

  const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
  const products = [];

  // Match GlorovProduct blocks
  const productBlocks = content.split('GlorovProduct(');
  for (let i = 1; i < productBlocks.length; i++) {
    const block = productBlocks[i];
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
    const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
    const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
    const descMatch = block.match(/description:\s*['"]([^'"]+)['"]/);
    const priceMatch = block.match(/price:\s*([0-9.]+)/);
    const imgMatch = block.match(/imageUrls:\s*\[\s*['"]([^'"]+)['"]/);
    const catMatch = block.match(/category:\s*['"]([^'"]+)['"]/);

    if (idMatch && titleMatch) {
      products.push({
        id: idMatch[1],
        slug: slugMatch ? slugMatch[1] : idMatch[1],
        title: titleMatch[1],
        description: descMatch ? descMatch[1] : '',
        image: imgMatch ? imgMatch[1] : DEFAULT_OG_IMAGE,
        price: priceMatch ? parseFloat(priceMatch[1]) : 49,
        category: catMatch ? catMatch[1] : 'Gardening',
      });
    }
  }

  console.log(`✅ Extracted ${products.length} products from GlorovMockData`);
  return products;
}

/**
 * Generates the HTML for a single product with full Open Graph and Schema.org tags
 */
function generateProductHtml(baseHtml, product) {
  const pageTitle = `${product.title} • Premium Seeds & Live Plants | GLOROV`;
  const escapedTitle = escapeHtml(pageTitle);
  const escapedProductTitle = escapeHtml(product.title);
  const desc = cleanDescription(product.description);
  const escapedDesc = escapeHtml(desc);
  const canonicalUrl = `${SITE_URL}/product/${product.slug}`;
  const imageUrl = product.image.startsWith('http') ? product.image : `${SITE_URL}/${product.image}`;
  const escapedImage = escapeHtml(imageUrl);
  const priceFormatted = product.price ? Number(product.price).toFixed(2) : '49.00';

  // Build the rich meta tag block
  const metaTags = `
  <!-- Primary Product SEO -->
  <title>${escapedTitle}</title>
  <meta name="title" content="${escapedTitle}">
  <meta name="description" content="${escapedDesc}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn / Discord -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="GLOROV">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDesc}">
  <meta property="og:image" content="${escapedImage}">
  <meta property="og:image:secure_url" content="${escapedImage}">
  <meta property="og:image:alt" content="${escapedProductTitle}">
  <meta property="og:image:width" content="1000">
  <meta property="og:image:height" content="1000">
  <meta property="og:price:amount" content="${priceFormatted}">
  <meta property="og:price:currency" content="INR">
  <meta property="product:brand" content="GLOROV">
  <meta property="product:availability" content="in stock">
  <meta property="product:condition" content="new">
  <meta property="product:price:amount" content="${priceFormatted}">
  <meta property="product:price:currency" content="INR">
  <meta property="product:retailer_item_id" content="${escapeHtml(product.id)}">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@glorov_in">
  <meta name="twitter:creator" content="@glorov_in">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDesc}">
  <meta name="twitter:image" content="${escapedImage}">
  <meta name="twitter:image:alt" content="${escapedProductTitle}">

  <!-- Schema.org JSON-LD Structured Data for Google Rich Snippets -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": ${JSON.stringify(product.title)},
    "image": [${JSON.stringify(imageUrl)}],
    "description": ${JSON.stringify(desc)},
    "sku": ${JSON.stringify(product.id)},
    "mpn": ${JSON.stringify(product.id)},
    "brand": {
      "@type": "Brand",
      "name": "GLOROV"
    },
    "offers": {
      "@type": "Offer",
      "url": ${JSON.stringify(canonicalUrl)},
      "priceCurrency": "INR",
      "price": ${JSON.stringify(priceFormatted)},
      "priceValidUntil": "2028-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "GLOROV",
        "url": "${SITE_URL}"
      }
    }
  }
  </script>
`;

  let html = baseHtml;

  // Clean out generic fallback tags so there are zero duplicates
  html = html.replace(/<title>.*?<\/title>/gi, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["']title["'][^>]*>/gi, '');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+property=["']product:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');

  // Ensure base href="/" is strictly set to root for nested routes
  if (html.includes('<base href="')) {
    html = html.replace(/<base href="[^"]*">/, '<base href="/">');
  } else {
    html = html.replace('<head>', '<head>\n  <base href="/">');
  }

  // Inject product-specific meta tags right before </head>
  html = html.replace('</head>', `${metaTags}\n</head>`);

  return html;
}

/**
 * Main execution
 */
async function main() {
  console.log('==========================================================');
  console.log('🌿 GLOROV: Generating Dynamic Product Metadata & OG Tags');
  console.log('==========================================================');

  if (!fs.existsSync(BASE_INDEX_PATH)) {
    console.error(`❌ Base index.html not found at: ${BASE_INDEX_PATH}`);
    console.error('Please run `flutter build web` before generating metadata.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(BASE_INDEX_PATH, 'utf8');

  // 1. Gather all products from both Medusa and Mock
  const [medusaProducts, mockProducts] = await Promise.all([
    fetchMedusaProducts(),
    Promise.resolve(extractMockProducts()),
  ]);

  const productMap = new Map();

  // Prefer Medusa live products, then fill in mock products
  for (const p of medusaProducts) {
    if (p.id) productMap.set(p.id, p);
    if (p.slug) productMap.set(p.slug, p);
  }
  for (const p of mockProducts) {
    if (p.id && !productMap.has(p.id)) productMap.set(p.id, p);
    if (p.slug && !productMap.has(p.slug)) productMap.set(p.slug, p);
  }

  const uniqueProducts = Array.from(new Set(productMap.values()));
  console.log(`📦 Generating pre-rendered metadata for ${uniqueProducts.length} unique products...`);

  let count = 0;
  for (const product of uniqueProducts) {
    const productHtml = generateProductHtml(baseHtml, product);

    // Target directory paths:
    // 1. /product/<slug>
    // 2. /product/<id>
    // 3. /products/<slug>
    // 4. /products/<id>
    const targets = [
      path.join(WEB_BUILD_DIR, 'product', product.slug),
      path.join(WEB_BUILD_DIR, 'product', product.id),
      path.join(WEB_BUILD_DIR, 'products', product.slug),
      path.join(WEB_BUILD_DIR, 'products', product.id),
    ];

    for (const targetDir of targets) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), productHtml, 'utf8');
    }

    count++;
  }

  // Also write fallback for /product_details/index.html
  const productDetailsDir = path.join(WEB_BUILD_DIR, 'product_details');
  fs.mkdirSync(productDetailsDir, { recursive: true });
  fs.writeFileSync(
    path.join(productDetailsDir, 'index.html'),
    baseHtml.replace(/<base href="[^"]*">/, '<base href="/">'),
    'utf8'
  );

  console.log(`✨ Successfully pre-rendered metadata for ${count} products (${count * 4} entrypoints created).`);
  console.log('✅ Social crawlers (WhatsApp, Facebook, Twitter, LinkedIn) will now display rich previews!');
}

main().catch((err) => {
  console.error('❌ Metadata generation failed:', err);
  process.exit(1);
});
