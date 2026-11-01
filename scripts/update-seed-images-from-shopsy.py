#!/usr/bin/env python3
"""
GLOROV Shopsy Seed Imagery Pipeline
Extracts authentic GLOROV brand seed imagery directly from Shopsy (shopsy.in)
for all 18 seed products across:
- vegetable-seeds (6 products x 3 images = 18 images)
- flower-seeds (6 products x 3 images = 18 images)
- herb-seeds (6 products x 3 images = 18 images)
Total: 54 high-resolution images.

Applies discrete GLOROV watermark and dual-syncs to:
- flutter/assets/images/products/<subcat>/<slug>-<idx>.jpg
- apps/backend/static/products/<subcat>/<slug>-<idx>.jpg
"""

import os
import sys
import ssl
import json
import urllib.request
import io
from PIL import Image

sys.path.append(os.path.dirname(__file__))
from watermark_utils import apply_glorov_watermark

ctx = ssl._create_unverified_context()

# Load harvested Shopsy GLOROV seed catalog
with open('artifacts/shopsy-glorov-seeds.json') as f:
    shopsy_data = json.load(f)

# Exact 1-to-1 Mapping to user's updated GLOROV Shopsy listings
SEED_MAPPING = {
    # =========================================================================
    # 1. VEGETABLE SEEDS
    # =========================================================================
    'brinjal-banarshi-giant-seeds': {
        'subcat': 'vegetable-seeds',
        'keywords': ['brinjal', 'baigan'],
        'title': 'GLOROV Brinjal Seeds (Baingan)',
        'description': 'Premium GLOROV hybrid brinjal vegetable seeds. High germination rate, disease resistant, yielding tender, rich-flavor purple glossy eggplants.',
    },
    'chinese-cabbage-seeds': {
        'subcat': 'vegetable-seeds',
        'keywords': ['cabbage'],
        'title': 'GLOROV Cabbage Seeds',
        'description': 'Crisp, dense, tender cabbage seeds from GLOROV. Fast germinating and ideal for home garden vegetable beds and containers.',
    },
    'green-onion-seeds-leek': {
        'subcat': 'vegetable-seeds',
        'keywords': ['onion'],
        'title': 'GLOROV Red Onion Seeds',
        'description': 'Authentic GLOROV onion seeds for planting. Produces firm, pungent, high-yield heirloom red onions.',
    },
    'drumstick-seeds-moringa': {
        'subcat': 'vegetable-seeds',
        'keywords': ['drumstick'],
        'title': 'GLOROV Drumstick Vegetable Seeds (Moringa)',
        'description': 'GLOROV premium moringa oleifera drumstick seeds. High nutritional density, fast growing, yielding tender green pods.',
    },
    'watermelon-seeds': {
        'subcat': 'vegetable-seeds',
        'keywords': ['tomato'],
        'title': 'GLOROV Tomato Vegetable Seeds',
        'description': 'GLOROV heirloom tomato seeds. Produces juicy, richly flavored, plump red tomatoes perfect for garden pots and kitchen gardens.',
    },
    'white-cucumber-seeds-khira': {
        'subcat': 'vegetable-seeds',
        'keywords': ['cucumber'],
        'title': 'GLOROV Cucumber Vegetable Seeds (Kheera)',
        'description': 'GLOROV crisp white/green cucumber vegetable seeds. Fresh, crunchy, high moisture yield for refreshing home harvest.',
    },

    # =========================================================================
    # 2. FLOWER SEEDS
    # =========================================================================
    'petunia-mix-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['zinnia'],
        'title': 'GLOROV Zinnia Flower Seeds',
        'description': 'Vibrant multicolor GLOROV zinnia flower seeds. Long blooming, heat tolerant, attracting pollinating bees and butterflies.',
    },
    'dahlia-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['dahlia'],
        'title': 'GLOROV Dahlia Annual Flower Seeds',
        'description': 'Spectacular double-flowering GLOROV dahlia seeds. Large radiant blooms with stunning color variety for ornamental gardens.',
    },
    'marigold-african-double-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['marigold', 'gende'],
        'title': 'GLOROV Marigold Flower Seeds (Genda Phool)',
        'description': 'Glorious golden orange GLOROV marigold flower seeds. Natural pest deterrent, robust blooms ideal for garden borders and festive decor.',
    },
    'cosmos-mix-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['cosmos'],
        'title': 'GLOROV Mixed Winter Cosmos Flower Seeds',
        'description': 'Delicate feathery foliage with profuse pastel blooms. Easy to grow GLOROV cosmos seeds that bloom abundantly.',
    },
    'chrysanthemum-mix-250-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['sunflower'],
        'title': 'GLOROV Sunflower Ornamental Seeds',
        'description': 'Cheerful, golden-yellow GLOROV sunflower seeds. Sun-tracking, strong-stemmed, perfect for border plantings and sunny garden beds.',
    },
    'portulaca-mix-seeds': {
        'subcat': 'flower-seeds',
        'keywords': ['gomphrena'],
        'title': 'GLOROV Gomphrena Globe Amaranth Seeds',
        'description': 'Hardy globe amaranth flower seeds by GLOROV. Vibrant magenta/purple spherical blossoms that retain color even when dried.',
    },

    # =========================================================================
    # 3. HERB SEEDS
    # =========================================================================
    'italian-basil-1000-seeds': {
        'subcat': 'herb-seeds',
        'keywords': ['coriander', 'dhania'],
        'title': 'GLOROV Coriander Planting Seeds (Dhania)',
        'description': 'Aromatic GLOROV sabut dhania seeds for kitchen gardening. High-germination seed yielding fresh lush cilantro leaves.',
    },
    'arugula-seeds-rocket-leaves': {
        'subcat': 'herb-seeds',
        'keywords': ['fenugreek', 'methi'],
        'title': 'GLOROV Fenugreek Seeds (Methi Bij)',
        'description': 'Nutrient-rich GLOROV fenugreek methi seeds. Quick sprouting in containers, providing rich aromatic microgreens and leafy greens.',
    },
    'tulsi-seeds-holy-basil': {
        'subcat': 'herb-seeds',
        'keywords': ['salvia', 'tulsi', 'sage'],
        'title': 'GLOROV Scarlet Sage & Tulsi Botanical Seeds',
        'description': 'Revered medicinal and ornamental GLOROV seeds. Known for soothing aroma, high vitality, and vibrant botanical foliage.',
    },
    'parsley-1000-seeds': {
        'subcat': 'herb-seeds',
        'keywords': ['spinach', 'saag'],
        'title': 'GLOROV Red Spinach Seeds (Lal Saag)',
        'description': 'Tender, iron-rich GLOROV red spinach seeds. Rapid growth cycle, heat-tolerant, produces vibrant deep-red nutrient-packed leaves.',
    },
    'oregano-1500-seeds': {
        'subcat': 'herb-seeds',
        'keywords': ['radish', 'mooli'],
        'title': 'GLOROV White Radish Seeds (Mooli)',
        'description': 'Crisp, peppery GLOROV white radish seeds. Fast root maturation, high yield, and crisp succulent garden harvest.',
    },
    'thyme-750-seeds': {
        'subcat': 'herb-seeds',
        'keywords': ['carrot', 'gajar'],
        'title': 'GLOROV Carrot Seeds (Karnal Gajar)',
        'description': 'Sweet, tender GLOROV carrot seeds. Straight, deep orange roots with high sweetness and crisp snacking texture.',
    },
}

def resolve_shopsy_product(keywords):
    for pid, p in shopsy_data.items():
        title = p['title'].lower()
        if any(kw in title for kw in keywords) and len(p.get('images', [])) >= 3:
            return p
    return None

def download_and_process_image(url, flutter_dest, backend_dest):
    os.makedirs(os.path.dirname(flutter_dest), exist_ok=True)
    os.makedirs(os.path.dirname(backend_dest), exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20, context=ctx) as resp:
        data = resp.read()
        
    im = Image.open(io.BytesIO(data))
    
    # Apply subtle luxury Glorov watermark logo
    watermarked = apply_glorov_watermark(im)
    
    # Save high quality JPEG to Flutter assets and backend static
    watermarked.save(flutter_dest, 'JPEG', quality=95)
    watermarked.save(backend_dest, 'JPEG', quality=95)
    return True

def run():
    print("=" * 70)
    print("Starting GLOROV Shopsy Seed Imagery Extraction & Replacement")
    print("=" * 70)
    
    success_count = 0
    total_imgs = 0
    
    for slug, meta in SEED_MAPPING.items():
        subcat = meta['subcat']
        keywords = meta['keywords']
        shopsy_p = resolve_shopsy_product(keywords)
        
        if not shopsy_p:
            print(f"❌ Failed to find Shopsy product for {slug} with keywords {keywords}")
            continue
            
        print(f"\n📦 [{subcat}] {slug}")
        print(f"   Matched Shopsy listing: \"{shopsy_p['title']}\" (PID: {shopsy_p['id']})")
        
        imgs = shopsy_p['images'][:3]
        for idx, img_url in enumerate(imgs):
            img_num = idx + 1
            total_imgs += 1
            f_dest = f"flutter/assets/images/products/{subcat}/{slug}-{img_num}.jpg"
            b_dest = f"apps/backend/static/products/{subcat}/{slug}-{img_num}.jpg"
            
            try:
                download_and_process_image(img_url, f_dest, b_dest)
                size_kb = os.path.getsize(f_dest) / 1024
                print(f"   ✓ Image {img_num}: {f_dest} ({size_kb:.1f} KB)")
                success_count += 1
            except Exception as e:
                print(f"   ❌ Image {img_num} failed: {e}")

    print("\n" + "=" * 70)
    print(f"🎉 Completed: {success_count}/{total_imgs} seed images updated from Shopsy!")
    print("=" * 70)

if __name__ == '__main__':
    run()
