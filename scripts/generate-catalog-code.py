#!/usr/bin/env python3
"""
Generates production-grade Dart, TypeScript, and SQL definitions from
artifacts/glorov-extracted-catalog.json.
"""

import json
import re

with open('artifacts/glorov-extracted-catalog.json') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from catalog JSON.")

# -------------------------------------------------------------------------
# 1. GENERATE DART GLOROV MOCK DATA
# -------------------------------------------------------------------------
dart_lines = []
for p in products:
    p_id = p['id']
    p_slug = p['slug']
    p_title = p['title'].replace("'", "\\'")
    p_botanical = p['botanicalName'].replace("'", "\\'")
    p_short = p['shortDescription'].replace("'", "\\'").replace("\n", " ")
    p_desc = p['description'].replace("'", "\\'").replace("\n", "\\n")
    p_cat = p['category']
    p_sub = p['subcategory']
    p_type = p['productType']
    p_price = float(p['price'])
    p_disc = float(p['discountPrice'])
    p_pct = int(p['discountPercent'])
    p_rating = float(p['rating'])
    p_reviews = int(p['reviewCount'])
    p_imgs = ", ".join(f"'{img}'" for img in p['imageUrls'])
    p_best = "true" if p['isBestSeller'] else "false"
    p_feat = "true" if p['isFeatured'] else "false"
    p_badge = ", ".join(f"'{b}'" for b in p['badges'])

    var_entries = []
    for v in p['variants']:
        v_id = v['id']
        v_name = v['name'].replace("'", "\\'")
        v_p = float(v['price'])
        v_dp = float(v['discountPrice'])
        var_entries.append(
            f"        GlorovProductVariant(id: '{v_id}', name: '{v_name}', price: {v_p}, discountPrice: {v_dp}),"
        )
    variants_block = "\n".join(var_entries)

    dart_lines.append(f"""    // {p_id}: {p['title']}
    GlorovProduct(
      id: '{p_id}',
      slug: '{p_slug}',
      title: '{p_title}',
      botanicalName: '{p_botanical}',
      shortDescription: '{p_short}',
      description: '{p_desc}',
      category: '{p_cat}',
      subcategory: '{p_sub}',
      productType: {p_type},
      price: {p_price},
      discountPrice: {p_disc},
      discountPercent: {p_pct},
      rating: {p_rating},
      reviewCount: {p_reviews},
      imageUrls: [{p_imgs}],
      isBestSeller: {p_best},
      isFeatured: {p_feat},
      badges: [{p_badge}],
      variants: [
{variants_block}
      ],
    ),""")

all_dart_products = "\n\n".join(dart_lines)
with open('artifacts/generated_dart_products.dart', 'w') as f:
    f.write(all_dart_products)
print("Wrote artifacts/generated_dart_products.dart")

# -------------------------------------------------------------------------
# 2. GENERATE MEDUSA TYPESCRIPT SEEDER
# -------------------------------------------------------------------------
ts_lines = []
for p in products:
    p_title = p['title'].replace('"', '\\"')
    p_handle = p['slug']
    p_desc = p['description'].replace('"', '\\"').replace('\n', ' ')
    p_cat_handle = p['subcategorySlug']
    p_thumb = p['imageUrls'][0]
    p_imgs = json.dumps(p['imageUrls'])
    
    variant_objs = []
    for v_idx, v in enumerate(p['variants']):
        sku = f"GLR-{p['slug'].upper()[:8]}-{v_idx+1:02d}"
        var_objs = {
            "title": v['name'],
            "sku": sku,
            "priceINR": int(v['discountPrice'] * 100),
            "stockQuantity": 80,
            "optionValue": v['name'],
        }
        variant_objs.append(var_objs)

    v_json = json.dumps(variant_objs, indent=8)
    
    ts_lines.append(f"""    {{
      title: "{p_title}",
      handle: "{p_handle}",
      description: "{p_desc}",
      categoryHandle: "{p_cat_handle}",
      collectionHandle: "{p['categorySlug']}",
      optionTitle: "Option",
      optionValues: {json.dumps([v['name'] for v in p['variants']])},
      thumbnail: "{p_thumb}",
      images: {p_imgs},
      metadata: {{
        botanical_name: "{p['botanicalName']}",
        rating: "{p['rating']}",
        review_count: "{p['reviewCount']}",
      }},
      variants: {v_json},
    }},""")

all_ts_products = "\n".join(ts_lines)
with open('artifacts/generated_ts_products.ts', 'w') as f:
    f.write(all_ts_products)
print("Wrote artifacts/generated_ts_products.ts")

# -------------------------------------------------------------------------
# 3. GENERATE POSTGRESQL DIRECT SEED SQL
# -------------------------------------------------------------------------
sql_statements = [
    "-- GLOROV 66 Botanical Products Direct PostgreSQL Seed Script",
    "BEGIN;",
]

for p in products:
    p_id = f"prod_{p['id'].replace('-', '_')}"
    p_title = p['title'].replace("'", "''")
    p_handle = p['slug']
    p_desc = p['description'].replace("'", "''")
    p_thumb = p['imageUrls'][0]
    
    sql_statements.append(f"""
-- Product: {p_title}
INSERT INTO product (id, title, handle, description, thumbnail, status, is_giftcard, discountable, created_at, updated_at)
VALUES ('{p_id}', '{p_title}', '{p_handle}', '{p_desc}', '{p_thumb}', 'published', false, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  thumbnail = EXCLUDED.thumbnail;
""")

sql_statements.append("COMMIT;")
with open('apps/backend/data/setup-botanical-catalog-55.sql', 'w') as f:
    f.write("\n".join(sql_statements))
print("Wrote apps/backend/data/setup-botanical-catalog-55.sql")
