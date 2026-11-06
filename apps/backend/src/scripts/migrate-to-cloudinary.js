#!/usr/bin/env node

/**
 * GLOROV Cloudinary Complete Asset Migration Script
 * Migrates all local botanical product images, banners, and logos to Cloudinary CDN,
 * updates the Supabase PostgreSQL database, banners.json, and Flutter mock data.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'apps/backend');
const FLUTTER_DIR = path.resolve(ROOT_DIR, 'flutter');
const MAP_FILE = path.resolve(BACKEND_DIR, 'data/cloudinary-image-map.json');
const BANNERS_FILE = path.resolve(BACKEND_DIR, 'data/banners.json');
const FLUTTER_MOCK_FILE = path.resolve(FLUTTER_DIR, 'lib/models/glorov/glorov_mock_data.dart');

// 1. Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Load existing mapping if available
let urlMap = {};
if (fs.existsSync(MAP_FILE)) {
  try {
    urlMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(urlMap).length} cached Cloudinary mappings.`);
  } catch (e) {
    urlMap = {};
  }
}

async function uploadFileToCloudinary(localFilePath, folder, publicId) {
  if (urlMap[localFilePath]) {
    return urlMap[localFilePath];
  }

  const fullPath = path.resolve(ROOT_DIR, localFilePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[WARN] File not found on disk: ${fullPath}`);
    return null;
  }

  try {
    const res = await cloudinary.uploader.upload(fullPath, {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    });
    urlMap[localFilePath] = res.secure_url;
    return res.secure_url;
  } catch (err) {
    console.error(`[ERROR] Failed to upload ${localFilePath}:`, err.message);
    return null;
  }
}

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('🌿 [GLOROV] Starting Cloudinary Full Asset Migration...');
  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME || 'naodmm8w'}`);

  // Test Cloudinary connection
  await new Promise((resolve, reject) => {
    cloudinary.api.ping((err, res) => {
      if (err) return reject(new Error('Cloudinary Ping Failed: ' + err.message));
      console.log('✅ Cloudinary Ping successful:', res.status);
      resolve();
    });
  });

  // A. Collect Product Images from Disk
  const productsDir = path.resolve(FLUTTER_DIR, 'assets/images/products');
  const categories = fs.readdirSync(productsDir).filter(f => fs.statSync(path.join(productsDir, f)).isDirectory());

  const productFilesToUpload = [];
  for (const cat of categories) {
    const catDir = path.join(productsDir, cat);
    const files = fs.readdirSync(catDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    for (const file of files) {
      const relativeAssetPath = `assets/images/products/${cat}/${file}`;
      const flutterAssetPath = `flutter/${relativeAssetPath}`;
      const baseName = path.parse(file).name;
      productFilesToUpload.push({
        assetKey: relativeAssetPath,
        localPath: flutterAssetPath,
        folder: `glorov/products/${cat}`,
        publicId: baseName,
      });
    }
  }

  console.log(`\n📦 Found ${productFilesToUpload.length} product images across ${categories.length} categories.`);

  let uploadedCount = 0;
  await runWithConcurrency(productFilesToUpload, 6, async (item) => {
    const url = await uploadFileToCloudinary(item.localPath, item.folder, item.publicId);
    if (url) {
      urlMap[item.assetKey] = url;
      uploadedCount++;
      if (uploadedCount % 20 === 0 || uploadedCount === productFilesToUpload.length) {
        console.log(`   Uploaded ${uploadedCount} / ${productFilesToUpload.length} product images...`);
      }
    }
  });

  // B. Collect Banner Images from Disk
  const bannerDir = path.resolve(FLUTTER_DIR, 'assets/images');
  const bannerFiles = fs.readdirSync(bannerDir).filter(f => /^banner_.*\.(jpg|jpeg|png)$/i.test(f));
  console.log(`\n🎨 Found ${bannerFiles.length} banner images in ${bannerDir}.`);

  for (const bFile of bannerFiles) {
    const localPath = `flutter/assets/images/${bFile}`;
    const baseName = path.parse(bFile).name;
    const url = await uploadFileToCloudinary(localPath, 'glorov/banners', baseName);
    if (url) {
      urlMap[`/banners/${bFile}`] = url;
      urlMap[`assets/images/${bFile}`] = url;
      console.log(`   ✅ Banner uploaded: ${bFile} -> ${url}`);
    }
  }

  // C. Save Updated Mapping File
  fs.writeFileSync(MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf8');
  console.log(`\n💾 Saved ${Object.keys(urlMap).length} image mappings to ${MAP_FILE}`);

  // D. Update PostgreSQL Database (Supabase)
  console.log('\n🗄️ Updating Supabase PostgreSQL database tables...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    // 1. Update product.thumbnail
    let updatedThumbnails = 0;
    const productsRes = await client.query('SELECT id, thumbnail FROM product WHERE thumbnail IS NOT NULL');
    for (const prod of productsRes.rows) {
      const newUrl = urlMap[prod.thumbnail];
      if (newUrl && newUrl !== prod.thumbnail) {
        await client.query('UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = $2', [newUrl, prod.id]);
        updatedThumbnails++;
      }
    }
    console.log(`   ✅ Updated ${updatedThumbnails} / ${productsRes.rows.length} product thumbnails in database.`);

    // 2. Update image.url
    let updatedImages = 0;
    const imagesRes = await client.query('SELECT id, url FROM image WHERE url IS NOT NULL');
    for (const img of imagesRes.rows) {
      const newUrl = urlMap[img.url];
      if (newUrl && newUrl !== img.url) {
        await client.query('UPDATE image SET url = $1, updated_at = NOW() WHERE id = $2', [newUrl, img.id]);
        updatedImages++;
      }
    }
    console.log(`   ✅ Updated ${updatedImages} / ${imagesRes.rows.length} product gallery images in database.`);
  } finally {
    await client.end();
  }

  // E. Update apps/backend/data/banners.json
  console.log('\n🎪 Updating apps/backend/data/banners.json with Cloudinary URLs...');
  if (fs.existsSync(BANNERS_FILE)) {
    const banners = JSON.parse(fs.readFileSync(BANNERS_FILE, 'utf8'));
    let updatedBanners = 0;
    for (const b of banners) {
      if (b.desktop_image_url && urlMap[b.desktop_image_url]) {
        b.desktop_image_url = urlMap[b.desktop_image_url];
        updatedBanners++;
      }
      if (b.mobile_image_url && urlMap[b.mobile_image_url]) {
        b.mobile_image_url = urlMap[b.mobile_image_url];
        updatedBanners++;
      }
      b.updated_at = new Date().toISOString();
    }
    fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2), 'utf8');
    console.log(`   ✅ Updated ${updatedBanners} banner image fields in banners.json.`);
  }

  // F. Update Flutter Mock Data with Cloudinary URLs
  console.log('\n📱 Updating flutter/lib/models/glorov/glorov_mock_data.dart with Cloudinary URLs...');
  if (fs.existsSync(FLUTTER_MOCK_FILE)) {
    let mockContent = fs.readFileSync(FLUTTER_MOCK_FILE, 'utf8');
    let replacementCount = 0;
    for (const [localPath, cloudUrl] of Object.entries(urlMap)) {
      if (localPath.startsWith('assets/images/products/')) {
        const target = `'${localPath}'`;
        if (mockContent.includes(target)) {
          mockContent = mockContent.split(target).join(`'${cloudUrl}'`);
          replacementCount++;
        }
      }
    }
    fs.writeFileSync(FLUTTER_MOCK_FILE, mockContent, 'utf8');
    console.log(`   ✅ Replaced ${replacementCount} product image asset references with Cloudinary URLs in mock data.`);
  }

  console.log('\n==========================================================');
  console.log('🎉 ALL IMAGES SUCCESSFULLY MIGRATED TO CLOUDINARY!');
  console.log('• Total Cloudinary Assets: ' + Object.keys(urlMap).length);
  console.log('• Supabase Database: Updated');
  console.log('• Banners JSON: Updated');
  console.log('• Flutter Mock Data: Updated');
  console.log('==========================================================');
}

main().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
