const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const MAP_FILE = path.resolve(ROOT_DIR, 'apps/backend/data/cloudinary-image-map.json');
const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

const PRODUCTS = [
  {
    handle: 'brinjal-banarshi-giant-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-${i}.jpg`])
  },
  {
    handle: 'chinese-cabbage-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-${i}.jpg`])
  },
  {
    handle: 'green-onion-seeds-leek',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-${i}.jpg`])
  },
  {
    handle: 'drumstick-seeds-moringa',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-${i}.jpg`])
  },
  {
    handle: 'watermelon-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/watermelon-seeds-${i}.jpg`])
  },
  {
    handle: 'white-cucumber-seeds-khira',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-${i}.jpg`])
  },
  {
    handle: 'tomato-vegetable-seeds',
    images: [
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-1.png'],
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-2.png'],
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-3.jpg'],
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-4.jpg'],
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-5.jpg'],
      map['flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-6.jpg']
    ]
  },
  {
    handle: 'marigold-african-double-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-${i}.jpg`])
  },
  {
    handle: 'cosmos-mix-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-${i}.jpg`])
  },
  {
    handle: 'dahlia-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/dahlia-seeds-${i}.jpg`])
  },
  {
    handle: 'petunia-mix-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/petunia-mix-seeds-${i}.jpg`])
  },
  {
    handle: 'chrysanthemum-mix-250-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-${i}.jpg`])
  },
  {
    handle: 'portulaca-mix-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-${i}.jpg`])
  },
  {
    handle: 'italian-basil-1000-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-${i}.jpg`])
  },
  {
    handle: 'oregano-1500-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/oregano-1500-seeds-${i}.jpg`])
  },
  {
    handle: 'parsley-1000-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/parsley-1000-seeds-${i}.jpg`])
  },
  {
    handle: 'thyme-750-seeds',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/thyme-750-seeds-${i}.jpg`])
  },
  {
    handle: 'tulsi-seeds-holy-basil',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-${i}.jpg`])
  },
  {
    handle: 'arugula-seeds-rocket-leaves',
    images: [1, 2, 3, 4, 5, 6].map(i => map[`flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-${i}.jpg`])
  }
];

// Check for missing URLs
for (const p of PRODUCTS) {
  for (let idx = 0; idx < p.images.length; idx++) {
    if (!p.images[idx]) {
      console.error(`Missing image for ${p.handle} slot ${idx + 1}`);
      process.exit(1);
    }
  }
}
console.log('✅ All 19 seed products have all 6 verified Cloudinary URLs.');

async function run() {
  // 1. Supabase PostgreSQL update
  console.log('🔄 Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString: 'postgresql://postgres.xijvvaqazwaowsswvjmt:5h8.E79EJ%26_RQ-z@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  await client.query('BEGIN');
  for (const p of PRODUCTS) {
    const heroUrl = p.images[0];
    await client.query('UPDATE product SET thumbnail = $1 WHERE handle = $2', [heroUrl, p.handle]);
    await client.query('DELETE FROM image WHERE product_id IN (SELECT id FROM product WHERE handle = $1)', [p.handle]);
    
    for (let r = 0; r < p.images.length; r++) {
      const url = p.images[r];
      const imgId = `img_sb_${p.handle.replace(/[^a-zA-Z0-9]/g, '_')}_${r + 1}`;
      await client.query(
        `INSERT INTO image (id, url, metadata, "rank", product_id, created_at, updated_at)
         SELECT $1, $2, $3, $4, id, NOW(), NOW()
         FROM product WHERE handle = $5`,
        [imgId, url, JSON.stringify({ source: 'cloudinary', species: p.handle }), r, p.handle]
      );
    }
    console.log(`✅ Supabase updated: ${p.handle}`);
  }
  await client.query('COMMIT');
  await client.end();
  console.log('✅ Supabase sync complete.');

  // 2. Generate SQL script for Azure VM
  const sqlLines = ['BEGIN;'];
  for (const p of PRODUCTS) {
    sqlLines.push(`\n-- ${p.handle}`);
    sqlLines.push(`UPDATE product SET thumbnail = '${p.images[0]}' WHERE handle = '${p.handle}';`);
    sqlLines.push(`DELETE FROM image WHERE product_id IN (SELECT id FROM product WHERE handle = '${p.handle}');`);
    for (let r = 0; r < p.images.length; r++) {
      const imgId = `img_vm_${p.handle.replace(/[^a-zA-Z0-9]/g, '_')}_${r + 1}`;
      sqlLines.push(
        `INSERT INTO image (id, url, metadata, "rank", product_id, created_at, updated_at) ` +
        `SELECT '${imgId}', '${p.images[r]}', '{"source":"cloudinary"}', ${r}, id, NOW(), NOW() ` +
        `FROM product WHERE handle = '${p.handle}';`
      );
    }
  }
  sqlLines.push('\nCOMMIT;\n');

  const sqlPath = path.resolve(ROOT_DIR, 'apps/backend/data/sync_vm_all_seeds.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`💾 Generated ${sqlPath}`);

  // 3. Sync to Azure VM
  console.log('🚀 Copying SQL to Azure VM and applying to glorov_medusa...');
  const sshCmd = `scp -o StrictHostKeyChecking=no -o BatchMode=yes -i ~/.ssh/id_ed25519 ${sqlPath} elsesourav@20.244.48.139:/tmp/sync_vm_all_seeds.sql`;
  execSync(sshCmd, { stdio: 'inherit' });

  const psqlCmd = `ssh -o StrictHostKeyChecking=no -o BatchMode=yes -i ~/.ssh/id_ed25519 elsesourav@20.244.48.139 "sudo -u postgres psql -d glorov_medusa -f /tmp/sync_vm_all_seeds.sql && pm2 restart glorov-backend"`;
  execSync(psqlCmd, { stdio: 'inherit' });

  console.log('🎉 Successfully updated Azure VM database and restarted backend!');
}

run().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
