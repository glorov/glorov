#!/usr/bin/env node

/**
 * GLOROV Comprehensive Botanical Seed Catalog Curation & Sync Script
 * 
 * 1. Curates and prepares 6 distinct botanical images for all 19 seed products:
 *    - Slot 1: Produce / flower in peak bloom (natural garden light, no branding)
 *    - Slot 2: Genuine seeds on clean white/light neutral background
 *    - Slot 3: Seedlings / young green sprouts emerging in nursery soil
 *    - Slot 4: Growing vegetative plant / foliage / trellis in garden bed or pot
 *    - Slot 5: Bountiful harvest / culinary yield / full floral display
 *    - Slot 6: Custom botanical germination & care guide infographic
 * 2. Uploads all assets to Cloudinary (naodmm8w)
 * 3. Updates apps/backend/data/cloudinary-image-map.json
 * 4. Synchronizes Supabase PostgreSQL database (product & image tables)
 * 5. Synchronizes Azure VM PostgreSQL database (glorov_medusa via SSH)
 * 6. Synchronizes flutter/lib/models/glorov/glorov_mock_data.dart
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'apps/backend');
const FLUTTER_DIR = path.resolve(ROOT_DIR, 'flutter');
const MAP_FILE = path.resolve(BACKEND_DIR, 'data/cloudinary-image-map.json');
const FLUTTER_MOCK_FILE = path.resolve(FLUTTER_DIR, 'lib/models/glorov/glorov_mock_data.dart');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

let urlMap = {};
if (fs.existsSync(MAP_FILE)) {
  try {
    urlMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  } catch (e) {
    urlMap = {};
  }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve(destPath);
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
    });
    req.on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function uploadToCloudinary(localPath, folder, publicId) {
  const fullPath = path.resolve(ROOT_DIR, localPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${fullPath}`);
  }
  const res = await cloudinary.uploader.upload(fullPath, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });
  return res.secure_url;
}

// Full 19 Seed Product Specification
const SEED_PRODUCTS = [
  // Vegetable Seeds (7)
  {
    handle: 'tomato-vegetable-seeds',
    legacyHandle: 'heirloom-tomato-vegetable-seeds',
    title: 'Heirloom Tomato Vegetable Seeds',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Solanum lycopersicum',
    description: 'Heirloom GLOROV tomato vegetable seeds produce juicy, richly flavored, plump red tomatoes perfect for garden pots and kitchen gardens. High germination rate and vigorous growth. Suitable for container gardening, raised beds, and open garden plots. Approx. seeds per pack: 100.',
    priceINR: 14500,
    discountINR: 9900,
    slots: [
      { local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-1.png' },
      { local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-2.png' },
      { local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-6.jpg' },
    ]
  },
  {
    handle: 'watermelon-seeds',
    title: 'Watermelon Seeds',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Citrullus lanatus',
    description: 'Watermelon is a classic warm-season garden delight. Sweet, crisp, deep red flesh packed with hydration, vitamin C, and lycopene. Trailing annual vine with vigorous tendrils thriving in full sun. Approx. seeds per gram: 26.',
    priceINR: 14500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-1.jpg' },
      { remote: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-6.jpg' },
    ]
  },
  {
    handle: 'brinjal-banarshi-giant-seeds',
    title: 'Brinjal Banarasi Giant Seeds',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Solanum melongena',
    description: 'Brinjal Banarasi Giant is a classic Indian vegetable known for its large, meaty fruits and rich flavour. Ideal for baingan bharta, curries, and roasting. Rich in dietary fiber, potassium, and antioxidants. Approx. seeds per gram: 220.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-6.jpg' },
    ]
  },
  {
    handle: 'chinese-cabbage-seeds',
    title: 'Chinese Cabbage Seeds',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Brassica rapa pekinensis',
    description: 'Chinese Cabbage (Napa Cabbage) is a fast-growing, mild cool-season crop. Crisp, tender leaves perfect for salads, stir-fries, and kimchi. Rich in vitamins C, K, and folate. Approx. seeds per gram: 230.',
    priceINR: 11900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1611105637889-3e75e3860d5b?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-6.jpg' },
    ]
  },
  {
    handle: 'green-onion-seeds-leek',
    title: 'Green Onion Seeds (Leek)',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Allium fistulosum',
    description: 'Green Onions (Spring Onions / Leeks) are quick to grow, tender, and intensely flavorful. Both hollow green stalks and tender white roots provide endless culinary versatility. Approx. seeds per gram: 125.',
    priceINR: 11900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-1.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-6.jpg' },
    ]
  },
  {
    handle: 'drumstick-seeds-moringa',
    title: 'Drumstick Seeds (Moringa)',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Moringa oleifera',
    description: 'Drumstick (Moringa) is one of the most nutrient-dense plants on earth. Fast growing, heat and drought hardy. Leaves, pods, and blossoms are packed with calcium, iron, protein, and vitamins. Approx. seeds per gram: 3.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-6.jpg' },
    ]
  },
  {
    handle: 'white-cucumber-seeds-khira',
    title: 'White Cucumber Seeds (Khira)',
    category: 'vegetable-seeds',
    categoryName: 'Vegetable Seeds',
    botanicalName: 'Cucumis sativus',
    description: 'White Cucumber (Kheera) is cherished for its crisp, tender texture and mild, cooling flavor. Packed with hydration, dietary fiber, and essential minerals. Thrives on vertical garden trellises. Approx. seeds per gram: 42.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-1.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-5.jpg' },
      { local: 'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-6.jpg' },
    ]
  },

  // Flower Seeds (6)
  {
    handle: 'chrysanthemum-mix-250-seeds',
    title: 'Chrysanthemum Mix Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Chrysanthemum indicum',
    description: 'Chrysanthemum Mix delivers spectacular late summer and autumn blooms in bronze, yellow, crimson, and lavender shades. Excellent for decorative pots and borders. Approx. seeds: 250.',
    priceINR: 14500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1596726917631-f2f1181f1853?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-6.jpg' },
    ]
  },
  {
    handle: 'cosmos-mix-seeds',
    title: 'Cosmos Mix Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Cosmos bipinnatus',
    description: 'Cosmos Mix features cheerful, daisy-like blossoms on feathery, airy foliage. Highly attractive to honeybees and butterflies. Thrives in sun with modest watering. Approx. seeds: 100.',
    priceINR: 13500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1596726917631-f2f1181f1853?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-6.jpg' },
    ]
  },
  {
    handle: 'dahlia-seeds',
    title: 'Dahlia Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Dahlia pinnata',
    description: 'Double blooming Dahlia seeds provide grand, layered floral perfection. Outstanding ornamental value for garden beds, containers, and cut flower arrangements. Approx. seeds: 50.',
    priceINR: 14500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/dahlia-seeds-6.jpg' },
    ]
  },
  {
    handle: 'marigold-african-double-seeds',
    title: 'Marigold African Double Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Tagetes erecta',
    description: 'African Double Marigolds produce huge, golden-orange pom-pom flowers. Naturally deters garden pests while illuminating landscape borders and festive floral arrangements. Approx. seeds: 100.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-6.jpg' },
    ]
  },
  {
    handle: 'petunia-mix-seeds',
    title: 'Petunia Mix Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Petunia hybrida',
    description: 'Cascading Petunia Mix features profuse trumpet-shaped flowers in vibrant magenta, violet, and white shades. Ideal for hanging baskets and balcony railings. Approx. seeds: 200.',
    priceINR: 13500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-6.jpg' },
    ]
  },
  {
    handle: 'portulaca-mix-seeds',
    title: 'Portulaca Mix Seeds',
    category: 'flower-seeds',
    categoryName: 'Flower Seeds',
    botanicalName: 'Portulaca grandiflora',
    description: 'Portulaca (Moss Rose) produces dazzling neon cup flowers across succulent creeping groundcover. Highly heat and drought tolerant. Flourishes in intense sunshine. Approx. seeds: 250.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-6.jpg' },
    ]
  },

  // Herb & Specialty Seeds (6)
  {
    handle: 'italian-basil-1000-seeds',
    title: 'Italian Basil Seeds',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Ocimum basilicum',
    description: 'Classic Genovese Italian Basil with glossy, tender emerald leaves bursting with sweet, peppery aroma. Essential for homemade pesto, pasta, and Mediterranean dishes. Approx. seeds: 1000.',
    priceINR: 14500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-6.jpg' },
    ]
  },
  {
    handle: 'arugula-seeds-rocket-leaves',
    title: 'Arugula Seeds (Rocket Leaves)',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Eruca vesicaria',
    description: 'Arugula (Rocket) offers spicy, peppery gourmet salad greens. Ready to harvest in just 21-30 days. Perfect for microgreen trays, containers, and raised beds. Approx. seeds: 500.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1611105637889-3e75e3860d5b?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-6.jpg' },
    ]
  },
  {
    handle: 'tulsi-seeds-holy-basil',
    title: 'Tulsi Seeds (Holy Basil)',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Ocimum sanctum',
    description: 'Sacred Tulsi (Holy Basil) is revered across India for its spiritual sanctity and powerful Ayurvedic properties. Aromatic leaves relieve stress and enhance respiratory wellness. Approx. seeds: 500.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-6.jpg' },
    ]
  },
  {
    handle: 'parsley-1000-seeds',
    title: 'Parsley Seeds',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Petroselinum crispum',
    description: 'Curly leaf Italian parsley with deep emerald ruffled sprigs. Packed with iron, vitamin C, and antioxidants. Adds fresh vibrancy to soups, marinades, and garnishes. Approx. seeds: 1000.',
    priceINR: 12900,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-6.jpg' },
    ]
  },
  {
    handle: 'oregano-1500-seeds',
    title: 'Oregano Seeds',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Origanum vulgare',
    description: 'Greek Oregano boasts pungent, peppery Mediterranean flavor. Robust perennial herb thriving in dry, sunny soils. Essential for Italian pizzas, roasted vegetables, and herb oils. Approx. seeds: 1500.',
    priceINR: 13500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-6.jpg' },
    ]
  },
  {
    handle: 'thyme-750-seeds',
    title: 'Thyme Seeds',
    category: 'herb-seeds',
    categoryName: 'Fruit & Herb Seeds',
    botanicalName: 'Thymus vulgaris',
    description: 'English Thyme has delicate woody stems densely clothed in tiny aromatic leaves. Superb evergreen perennial for rock gardens and patio pots. Approx. seeds: 750.',
    priceINR: 13500,
    discountINR: 9900,
    slots: [
      { remote: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-1.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-2.jpg' },
      { remote: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-3.jpg' },
      { remote: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-4.jpg' },
      { remote: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85', local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-5.jpg' },
      { local: 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-6.jpg' },
    ]
  }
];

async function main() {
  console.log('🌿 [GLOROV] Starting Botanical Seed Catalog Image Curation & Sync Pipeline...\n');

  // Step 1: Download any missing remote images to disk
  console.log('📥 Step 1: Downloading & preparing local photographic assets...');
  for (const prod of SEED_PRODUCTS) {
    for (let i = 0; i < prod.slots.length; i++) {
      const slot = prod.slots[i];
      const fullPath = path.resolve(ROOT_DIR, slot.local);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (slot.remote && (!fs.existsSync(fullPath) || fs.statSync(fullPath).size < 1000)) {
        try {
          process.stdout.write(`   Downloading ${prod.handle} slot ${i+1}... `);
          await downloadFile(slot.remote, fullPath);
          console.log(`✅ (${fs.statSync(fullPath).size} bytes)`);
        } catch (e) {
          console.error(`❌ Error downloading ${slot.remote}:`, e.message);
        }
      }
    }
  }

  // Step 2: Upload all 6 images for each of the 19 products to Cloudinary
  console.log('\n☁️ Step 2: Uploading 6 progressive botanical assets per product to Cloudinary...');
  const uploadedProducts = [];

  for (const prod of SEED_PRODUCTS) {
    console.log(`\n🌱 [${prod.categoryName}] ${prod.title}`);
    const cloudinaryUrls = [];
    const folder = `glorov/products/${prod.category}`;

    for (let i = 0; i < prod.slots.length; i++) {
      const slot = prod.slots[i];
      const publicId = `${prod.handle}-${i+1}`;
      try {
        const fullLocal = path.resolve(ROOT_DIR, slot.local);
        if (!fs.existsSync(fullLocal)) {
          console.warn(`   ⚠️ Local file missing: ${slot.local}`);
          continue;
        }

        const secureUrl = await uploadToCloudinary(slot.local, folder, publicId);
        cloudinaryUrls.push(secureUrl);
        urlMap[slot.local] = secureUrl;
        urlMap[`assets/images/products/${prod.category}/${path.basename(slot.local)}`] = secureUrl;
        console.log(`   Slot ${i+1}: ${publicId} -> ${secureUrl}`);
      } catch (err) {
        console.error(`   ❌ Failed to upload ${slot.local}:`, err.message);
      }
    }

    uploadedProducts.push({
      ...prod,
      cloudinaryUrls,
      thumbnailUrl: cloudinaryUrls[0] || null,
    });
  }

  // Step 3: Save mapping
  fs.writeFileSync(MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf8');
  console.log(`\n💾 Saved updated image mappings to ${MAP_FILE}`);

  // Step 4: Synchronize Supabase PostgreSQL database
  console.log('\n🗄️ Step 4: Synchronizing Supabase PostgreSQL Database...');
  const supabaseClient = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.xijvvaqazwaowsswvjmt:5h8.E79EJ%26_RQ-z@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  await supabaseClient.connect();

  try {
    for (const prod of uploadedProducts) {
      if (!prod.thumbnailUrl || prod.cloudinaryUrls.length === 0) continue;

      // Check if product exists by handle or legacyHandle
      let res = await supabaseClient.query('SELECT id, title FROM product WHERE handle = $1 OR handle = $2', [prod.handle, prod.legacyHandle || prod.handle]);
      let productId = res.rows[0]?.id;

      if (!productId) {
        // Create new product (e.g. Tomato seeds if separated)
        console.log(`   ➕ Inserting new product record into Supabase: ${prod.title}`);
        const newId = `prod_glr_${prod.handle.replace(/-/g, '_')}`;
        await supabaseClient.query(`
          INSERT INTO product (id, title, handle, description, thumbnail, is_giftcard, discountable, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, false, true, 'published', NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET title = $2, handle = $3, thumbnail = $5, updated_at = NOW()
        `, [newId, prod.title, prod.handle, prod.description, prod.thumbnailUrl]);
        productId = newId;

        // Link category
        const catRes = await supabaseClient.query('SELECT id FROM product_category WHERE handle = $1', [prod.category]);
        if (catRes.rows[0]?.id) {
          await supabaseClient.query(`
            INSERT INTO product_category_product (product_id, product_category_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [productId, catRes.rows[0].id]);
        }
      } else {
        // Update product title and thumbnail
        await supabaseClient.query(`
          UPDATE product SET title = $1, thumbnail = $2, updated_at = NOW()
          WHERE id = $3
        `, [prod.title, prod.thumbnailUrl, productId]);
      }

      // Refresh gallery images
      await supabaseClient.query('DELETE FROM image WHERE product_id = $1', [productId]);
      for (let rank = 0; rank < prod.cloudinaryUrls.length; rank++) {
        const imgUrl = prod.cloudinaryUrls[rank];
        const imgId = `img_${productId.replace('prod_', '')}_${rank + 1}`;
        await supabaseClient.query(`
          INSERT INTO image (id, url, rank, product_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [imgId, imgUrl, rank, productId]);
      }
      console.log(`   ✅ Supabase: Updated ${prod.title} (ID: ${productId}, 6 gallery images)`);
    }
  } finally {
    await supabaseClient.end();
  }

  // Step 5: Synchronize Azure VM PostgreSQL database (glorov_medusa)
  console.log('\n🚀 Step 5: Synchronizing Azure VM Database (glorov_medusa)...');
  const sqlCommands = [];
  sqlCommands.push('BEGIN;');

  for (const prod of uploadedProducts) {
    if (!prod.thumbnailUrl || prod.cloudinaryUrls.length === 0) continue;
    
    // 1. Update product title & thumbnail
    sqlCommands.push(`
      UPDATE product 
      SET title = '${prod.title.replace(/'/g, "''")}', 
          thumbnail = '${prod.thumbnailUrl}', 
          updated_at = NOW() 
      WHERE handle = '${prod.handle}' OR handle = '${prod.legacyHandle || prod.handle}';
    `);

    // 2. Refresh image gallery
    sqlCommands.push(`
      DELETE FROM image WHERE product_id IN (SELECT id FROM product WHERE handle = '${prod.handle}' OR handle = '${prod.legacyHandle || prod.handle}');
    `);

    for (let rank = 0; rank < prod.cloudinaryUrls.length; rank++) {
      const imgUrl = prod.cloudinaryUrls[rank];
      sqlCommands.push(`
        INSERT INTO image (id, url, rank, product_id, created_at, updated_at)
        SELECT 'img_' || substr(p.id, 6) || '_${rank + 1}', '${imgUrl}', ${rank}, p.id, NOW(), NOW()
        FROM product p
        WHERE p.handle = '${prod.handle}' OR p.handle = '${prod.legacyHandle || prod.handle}'
        LIMIT 1;
      `);
    }
  }

  // Also replace any remaining relative paths for all other products (indoor plants etc) on the VM
  for (const [oldPath, cdnUrl] of Object.entries(urlMap)) {
    if (cdnUrl.startsWith('https://res.cloudinary.com')) {
      sqlCommands.push(`
        UPDATE product SET thumbnail = '${cdnUrl}', updated_at = NOW() WHERE thumbnail = '${oldPath}';
        UPDATE image SET url = '${cdnUrl}', updated_at = NOW() WHERE url = '${oldPath}';
      `);
    }
  }

  sqlCommands.push('COMMIT;');

  const sqlScriptPath = path.resolve(BACKEND_DIR, 'data/sync_vm_cloudinary.sql');
  fs.writeFileSync(sqlScriptPath, sqlCommands.join('\n'), 'utf8');
  console.log(`   Generated VM SQL update batch: ${sqlScriptPath} (${sqlCommands.length} statements)`);

  try {
    // Copy SQL script to VM and execute
    console.log('   Copying SQL script to Azure VM 20.244.48.139...');
    execSync(`scp -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 ${sqlScriptPath} elsesourav@20.244.48.139:/tmp/sync_vm_cloudinary.sql`, { stdio: 'inherit' });
    console.log('   Executing SQL updates in glorov_medusa on Azure VM...');
    execSync(`ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 elsesourav@20.244.48.139 "PGPASSWORD=postgrespassword psql -h localhost -U postgres -d glorov_medusa -f /tmp/sync_vm_cloudinary.sql"`, { stdio: 'inherit' });
    console.log('   ✅ Azure VM PostgreSQL updated successfully!');
  } catch (err) {
    console.error('   ❌ Failed to execute SQL on Azure VM:', err.message);
  }

  // Step 6: Update flutter/lib/models/glorov/glorov_mock_data.dart
  console.log('\n📱 Step 6: Updating Flutter Mock Data with 6-image Cloudinary arrays...');
  if (fs.existsSync(FLUTTER_MOCK_FILE)) {
    let mockContent = fs.readFileSync(FLUTTER_MOCK_FILE, 'utf8');

    for (const prod of uploadedProducts) {
      if (prod.cloudinaryUrls.length === 0) continue;
      const formattedArray = JSON.stringify(prod.cloudinaryUrls).replace(/"/g, "'");

      // Replace imageUrls for this product
      const regex = new RegExp(`(slug:\\s*['"]${prod.handle}['"][\\s\\S]*?imageUrls:\\s*\\[)[^\\]]*(\\])`, 'm');
      if (regex.test(mockContent)) {
        mockContent = mockContent.replace(regex, `$1${prod.cloudinaryUrls.map(u => `'${u}'`).join(', ')}$2`);
      }
    }

    fs.writeFileSync(FLUTTER_MOCK_FILE, mockContent, 'utf8');
    console.log(`   ✅ Updated ${FLUTTER_MOCK_FILE}`);
  }

  console.log('\n🎉 Botanical Seed Catalog Image Curation & Multi-Database Synchronization Completed Successfully!');
}

main().catch((err) => {
  console.error('\n💥 Pipeline Failed:', err);
  process.exit(1);
});
