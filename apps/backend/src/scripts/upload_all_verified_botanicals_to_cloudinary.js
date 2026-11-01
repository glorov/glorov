const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'naodmm8w',
  api_key: '179253354861549',
  api_secret: '0FkMyyEi9taeWd2f8nEN55zqOUM',
  secure: true,
});

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const FLUTTER_DIR = path.resolve(ROOT_DIR, 'flutter');
const PRODUCTS_DIR = path.join(FLUTTER_DIR, 'assets/images/products');
const MAP_FILE = path.resolve(ROOT_DIR, 'apps/backend/data/cloudinary-image-map.json');

const CATEGORIES = ['vegetable-seeds', 'flower-seeds', 'herb-seeds'];

async function run() {
  console.log('🌿 [GLOROV] Uploading all 120 verified clean botanical seed assets to Cloudinary...');
  
  // Load existing map
  let urlMap = {};
  if (fs.existsSync(MAP_FILE)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    } catch (e) {
      urlMap = {};
    }
  }

  const filesToUpload = [];
  for (const cat of CATEGORIES) {
    const catDir = path.join(PRODUCTS_DIR, cat);
    if (!fs.existsSync(catDir)) continue;
    const files = fs.readdirSync(catDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('.'));
    for (const f of files) {
      const fullPath = path.join(catDir, f);
      const baseName = path.parse(f).name;
      filesToUpload.push({
        cat,
        filename: f,
        fullPath,
        folder: `glorov/products/${cat}`,
        publicId: baseName,
        flutterKey: `flutter/assets/images/products/${cat}/${f}`,
        assetKey: `assets/images/products/${cat}/${f}`
      });
    }
  }

  console.log(`Found ${filesToUpload.length} seed images to upload.`);

  // Upload in parallel batches of 5
  const concurrency = 5;
  const results = {};

  for (let i = 0; i < filesToUpload.length; i += concurrency) {
    const chunk = filesToUpload.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      try {
        const uploadRes = await cloudinary.uploader.upload(item.fullPath, {
          folder: item.folder,
          public_id: item.publicId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image'
        });
        
        results[item.flutterKey] = uploadRes.secure_url;
        urlMap[item.flutterKey] = uploadRes.secure_url;
        urlMap[item.assetKey] = uploadRes.secure_url;
        console.log(`✅ [${item.cat}] ${item.filename} -> ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`❌ Failed to upload ${item.filename}:`, err.message);
      }
    }));
  }

  // Save updated map
  fs.writeFileSync(MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf8');
  console.log(`\n💾 Saved updated image map to ${MAP_FILE}. Total keys: ${Object.keys(urlMap).length}`);
  
  // Output a JSON summary of seed uploads
  fs.writeFileSync('/tmp/seed_cloudinary_urls.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved /tmp/seed_cloudinary_urls.json');
}

run().catch(err => {
  console.error('Fatal upload error:', err);
  process.exit(1);
});
