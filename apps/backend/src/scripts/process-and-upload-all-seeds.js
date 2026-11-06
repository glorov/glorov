const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const FLUTTER_ASSETS_DIR = path.join(ROOT_DIR, 'flutter/assets/images/products');
const CLOUDINARY_MAP_PATH = path.join(__dirname, '../../data/cloudinary-image-map.json');

const SPECIES = [
  {
    handle: 'brinjal-banarshi-giant-seeds',
    title: 'Brinjal Banarasi Giant Seeds',
    category: 'vegetable-seeds',
    images: [
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-2.jpg',
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-3.jpg',
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-4.jpg',
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-5.jpg',
      'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-6.jpg',
    ]
  },
  {
    handle: 'chinese-cabbage-seeds',
    title: 'Chinese Cabbage Seeds',
    category: 'vegetable-seeds',
    images: [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Raapstelen_gekiemde_zaden_%28Brassica_campestris_germinating_seeds%29.jpg',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=1200&q=80',
      'https://images.unsplash.com/photo-1550989460-0adc9f5e8957?w=1200&q=80',
      'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-6.jpg',
    ]
  },
  {
    handle: 'green-onion-seeds-leek',
    title: 'Green Onion Seeds (Leek)',
    category: 'vegetable-seeds',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/d/db/Allium_fistolosum_L.%3B_seeds.JPG',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=1200&q=80',
      'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=1200&q=80',
      'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-6.jpg',
    ]
  },
  {
    handle: 'drumstick-seeds-moringa',
    title: 'Drumstick Seeds (Moringa)',
    category: 'vegetable-seeds',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/Moringa_oleifera_pods_NP.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/Moringa_oleifera_TP01_seeds.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/64/Moringa_oleifera_%28seeds%29_06.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/Moringa_oleifera_branch.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/Moringa_oleifera_fruits.JPG',
      'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-6.jpg',
    ]
  },
  {
    handle: 'watermelon-seeds',
    title: 'Watermelon Seeds',
    category: 'vegetable-seeds',
    images: [
      'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Citrullus_lanatus_ies.jpg',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&q=80',
      'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-6.jpg',
    ]
  },
  {
    handle: 'white-cucumber-seeds-khira',
    title: 'White Cucumber Seeds (Khira)',
    category: 'vegetable-seeds',
    images: [
      'https://images.unsplash.com/photo-1449339854873-750e6913301b?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/9/98/Cucumis_sativus_Olimp_2022-08-26_9307.jpg',
      'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200&q=80',
      'https://images.unsplash.com/photo-1590165482129-1b8b27698980?w=1200&q=80',
      'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=1200&q=80',
      'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-6.jpg',
    ]
  },
  {
    handle: 'marigold-african-double-seeds',
    title: 'Marigold African Double Seeds',
    category: 'flower-seeds',
    images: [
      'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/t/m/q/100-sedflwmgpl9-glorov-original-imahrk8gruwhdbjw.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/Tagetes_patula_MHNT.BOT.2007.43.30.jpg',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80',
      'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/d/m/v/100-sedflwmgpl9-glorov-original-imahrk8gud2wqjqf.jpeg',
      'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-6.jpg',
    ]
  },
  {
    handle: 'cosmos-mix-seeds',
    title: 'Cosmos Mix Seeds',
    category: 'flower-seeds',
    images: [
      'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/8/h/l/30-sedflwcm0yc-glorov-original-imahrdkfmzrnszyr.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/9/9c/Cosmos_bipinnatus_pink%2C_Burdwan%2C_West_Bengal%2C_India_10_01_2013.jpg',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=1200&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
      'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-6.jpg',
    ]
  },
  {
    handle: 'dahlia-seeds',
    title: 'Dahlia Seeds',
    category: 'flower-seeds',
    images: [
      'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/s/j/3/200-sedflwdlsg5-glorov-original-imahrdkgsvhxcjwr.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/6/6b/%28MHNT%29_Dahlia_pinnata_%27Happy_Single_Wink%27_-_flower_and_foliage.jpg',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
      'flutter/assets/images/products/flower-seeds/dahlia-seeds-6.jpg',
    ]
  },
  {
    handle: 'petunia-mix-seeds',
    title: 'Petunia Mix Seeds',
    category: 'flower-seeds',
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/b/bd/Starr_080103-1144_Petunia_x_hybrida.jpg',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80',
      'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
      'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-6.jpg',
    ]
  },
  {
    handle: 'chrysanthemum-mix-250-seeds',
    title: 'Chrysanthemum Mix Seeds',
    category: 'flower-seeds',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a1/Chrysanthemum_indicum_11012013.jpg',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80',
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80',
      'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-6.jpg',
    ]
  },
  {
    handle: 'portulaca-mix-seeds',
    title: 'Portulaca Mix Seeds',
    category: 'flower-seeds',
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/2/2a/Portulaca_oleracea_MHNT.jpg',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
      'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-6.jpg',
    ]
  },
  {
    handle: 'italian-basil-1000-seeds',
    title: 'Italian Basil Seeds',
    category: 'herb-seeds',
    images: [
      'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-6.jpg',
    ]
  },
  {
    handle: 'oregano-1500-seeds',
    title: 'Oregano Seeds',
    category: 'herb-seeds',
    images: [
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/Origanum_vulgare_kz03.jpg',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=1200&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-6.jpg',
    ]
  },
  {
    handle: 'parsley-1000-seeds',
    title: 'Parsley Seeds',
    category: 'herb-seeds',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/4/42/Petroselinum_crispum_seeds.jpg',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80',
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=1200&q=80',
      'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-6.jpg',
    ]
  },
  {
    handle: 'thyme-750-seeds',
    title: 'Thyme Seeds',
    category: 'herb-seeds',
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/5/55/Thymus_vulgaris_seed-timjami_siemen.jpg',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/thyme-750-seeds-6.jpg',
    ]
  },
  {
    handle: 'tulsi-seeds-holy-basil',
    title: 'Tulsi Seeds (Holy Basil)',
    category: 'herb-seeds',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/d/d3/Ocimum_basilicum_flowers_in_Crimea.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&q=80',
      'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-6.jpg',
    ]
  },
  {
    handle: 'arugula-seeds-rocket-leaves',
    title: 'Arugula Seeds (Rocket Leaves)',
    category: 'herb-seeds',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Raapstelen_gekiemde_zaden_%28Brassica_campestris_germinating_seeds%29.jpg',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80',
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=1200&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
      'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-6.jpg',
    ]
  }
];

async function run() {
  console.log('🌿 Starting End-to-End Botanical Seed Asset Curation & Cloudinary Upload...');
  
  let imageMap = {};
  if (fs.existsSync(CLOUDINARY_MAP_PATH)) {
    imageMap = JSON.parse(fs.readFileSync(CLOUDINARY_MAP_PATH, 'utf8'));
  }

  const results = {};

  for (const item of SPECIES) {
    console.log(`\n==========================================================`);
    console.log(`📦 Processing: ${item.title} (${item.handle})`);
    console.log(`==========================================================`);
    
    const productCloudinaryUrls = [];

    for (let slot = 1; slot <= 6; slot++) {
      const src = item.images[slot - 1];
      const targetLocalFile = path.join(FLUTTER_ASSETS_DIR, item.category, `${item.handle}-${slot}.jpg`);
      
      // Step 1: Prepare local square 1000x1000 image
      if (src.startsWith('http://') || src.startsWith('https://')) {
        console.log(`  [Slot ${slot}] Downloading & cropping: ${src.substring(0, 60)}...`);
        try {
          execSync(`python3 apps/backend/src/scripts/process_seed_images.py "${src}" "${targetLocalFile}"`, { stdio: 'pipe' });
        } catch (e) {
          console.error(`    ⚠️ Failed to process ${src}, using fallback if available:`, e.message);
        }
      } else {
        const fullLocalSrc = path.join(ROOT_DIR, src);
        if (fullLocalSrc !== targetLocalFile && fs.existsSync(fullLocalSrc)) {
          fs.copyFileSync(fullLocalSrc, targetLocalFile);
        }
      }

      if (!fs.existsSync(targetLocalFile)) {
        console.error(`  ❌ Local file missing: ${targetLocalFile}`);
        continue;
      }

      // Step 2: Upload to Cloudinary
      const publicId = `${item.handle}-${slot}`;
      const folder = `glorov/products/${item.category}`;
      console.log(`  [Slot ${slot}] Uploading to Cloudinary -> ${folder}/${publicId}...`);
      
      try {
        const uploadRes = await cloudinary.uploader.upload(targetLocalFile, {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
          quality: 'auto:good',
          fetch_format: 'auto',
        });
        
        console.log(`    ✅ Uploaded: ${uploadRes.secure_url}`);
        productCloudinaryUrls.push(uploadRes.secure_url);
        
        // Record in image map
        const key1 = `flutter/assets/images/products/${item.category}/${item.handle}-${slot}.jpg`;
        const key2 = `assets/images/products/${item.category}/${item.handle}-${slot}.jpg`;
        imageMap[key1] = uploadRes.secure_url;
        imageMap[key2] = uploadRes.secure_url;
      } catch (err) {
        console.error(`    ❌ Cloudinary upload failed for slot ${slot}:`, err.message);
      }
    }

    results[item.handle] = {
      title: item.title,
      thumbnail: productCloudinaryUrls[0],
      images: productCloudinaryUrls,
    };
  }

  // Save updated Cloudinary Map
  fs.writeFileSync(CLOUDINARY_MAP_PATH, JSON.stringify(imageMap, null, 2), 'utf8');
  console.log(`\n✅ Saved updated Cloudinary Image Map (${Object.keys(imageMap).length} entries)`);

  // Step 3: Database Synchronization (Supabase)
  console.log('\n🗄️ Synchronizing Supabase PostgreSQL...');
  const supabaseClient = new Client({
    connectionString: 'postgresql://postgres.xijvvaqazwaowsswvjmt:5h8.E79EJ%26_RQ-z@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false },
  });
  await supabaseClient.connect();

  for (const [handle, data] of Object.entries(results)) {
    if (!data.thumbnail || data.images.length === 0) continue;

    // Get product ID by handle
    const pRes = await supabaseClient.query('SELECT id FROM product WHERE handle = $1', [handle]);
    if (pRes.rows.length === 0) continue;
    const prodId = pRes.rows[0].id;

    // Update thumbnail
    await supabaseClient.query('UPDATE product SET thumbnail = $1 WHERE id = $2', [data.thumbnail, prodId]);

    // Replace gallery images
    await supabaseClient.query('DELETE FROM image WHERE product_id = $1', [prodId]);
    for (let i = 0; i < data.images.length; i++) {
      const imgId = `img_glr_${handle.replace(/-/g, '_')}_${i + 1}`;
      await supabaseClient.query(
        'INSERT INTO image (id, url, metadata, "rank", product_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [imgId, data.images[i], JSON.stringify({ source: 'cloudinary', species: handle }), i, prodId]
      );
    }
    console.log(`  ✅ Supabase: Updated ${handle} with ${data.images.length} images`);
  }
  await supabaseClient.end();
  console.log('✅ Supabase synchronization complete!');

  // Step 4: Database Synchronization (Azure VM)
  console.log('\n🗄️ Generating Azure VM SQL Sync Script...');
  let vmSql = 'BEGIN;\n';
  for (const [handle, data] of Object.entries(results)) {
    if (!data.thumbnail || data.images.length === 0) continue;
    vmSql += `\n-- ${handle}\n`;
    vmSql += `UPDATE product SET thumbnail = '${data.thumbnail}' WHERE handle = '${handle}';\n`;
    vmSql += `DELETE FROM image WHERE product_id IN (SELECT id FROM product WHERE handle = '${handle}');\n`;
    data.images.forEach((url, i) => {
      const imgId = `img_vm_${handle.replace(/-/g, '_')}_${i + 1}`;
      vmSql += `INSERT INTO image (id, url, metadata, "rank", product_id, created_at, updated_at) ` +
               `SELECT '${imgId}', '${url}', '{"source":"cloudinary"}', ${i}, id, NOW(), NOW() ` +
               `FROM product WHERE handle = '${handle}';\n`;
    });
  }
  vmSql += '\nCOMMIT;\n';

  const vmSqlPath = path.join(__dirname, '../../data/sync_vm_all_seeds.sql');
  fs.writeFileSync(vmSqlPath, vmSql, 'utf8');
  console.log(`✅ Generated ${vmSqlPath}`);

  // Copy and execute SQL on VM via SSH
  console.log('🚀 Copying and executing SQL on Azure VM (20.244.48.139)...');
  const sshCmd = `scp -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 "${vmSqlPath}" elsesourav@20.244.48.139:/tmp/sync_vm_all_seeds.sql`;
  execSync(sshCmd, { stdio: 'inherit' });
  const psqlCmd = `ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 elsesourav@20.244.48.139 "sudo -u postgres psql -d glorov_medusa -f /tmp/sync_vm_all_seeds.sql && pm2 restart glorov-backend"`;
  execSync(psqlCmd, { stdio: 'inherit' });
  console.log('✅ Azure VM database updated and Medusa restarted!');

  console.log('\n🎉 ALL SEED IMAGES SUCCESSFULLY CURATED, UPLOADED AND SYNCHRONIZED!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
