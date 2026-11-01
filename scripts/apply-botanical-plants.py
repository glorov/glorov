#!/usr/bin/env python3
"""
GLOROV Botanical Plant Asset Overhaul & Watermarking
Downloads verified species-accurate botanical photography for all 18 live plant products
across 4 categories (indoor-plants, air-purifying-plants, flowering-plants, succulents-bonsai).
Applies the official GLOROV watermark logo and saves to Flutter assets and Backend static directories.
"""

import os
import sys
import json
import ssl
import urllib.request
import io
from PIL import Image

sys.path.append(os.path.dirname(__file__))
from watermark_utils import apply_glorov_watermark

ctx = ssl._create_unverified_context()
HEADERS = {'User-Agent': 'GlorovBotanicalCatalog/1.0 (contact@glorov.com)'}

SLUG_TO_SUBCATS = {
    'the-china-doll-plant-xl': ['indoor-plants', 'air-purifying-plants'],
    'areca-palm-plant-xl': ['indoor-plants'],
    'zz-plant-xl': ['air-purifying-plants'],
    'bird-of-paradise-plant': ['flowering-plants'],
    'sansevieria-laurentii-plant-xl': ['succulents-bonsai'],
    'snake-plant-golden-hahnii': ['succulents-bonsai'],
    'snake-plant-futura-superba': ['succulents-bonsai'],
    'sansevieria-zeylanica-xl': ['succulents-bonsai'],
    'aglaonema-pink-beauty-plant': ['air-purifying-plants'],
    'aglaonema-red-plant': ['air-purifying-plants'],
    'aglaonema-snow-white-plant': ['flowering-plants'],
    'weeping-jade-with-hanging-pot': ['succulents-bonsai'],
    'jade-plant-mini': ['indoor-plants', 'succulents-bonsai'],
    'money-plant-golden': ['indoor-plants', 'air-purifying-plants'],
    'peace-lily-plant': ['indoor-plants', 'air-purifying-plants', 'flowering-plants'],
    'peace-lily-large-spathiphyllum-sensation': ['flowering-plants'],
    'peace-lily-plant-set-of-2': ['flowering-plants'],
    'anthurium-red-plant': ['indoor-plants', 'flowering-plants'],
}

def process_and_save_plant_images():
    print("=" * 70)
    print("Executing GLOROV Botanical Live Plant Asset Ingestion")
    print("=" * 70)
    
    with open('artifacts/verified-plant-candidates.json') as f:
        candidates = json.load(f)
        
    total_images_processed = 0
    total_files_written = 0
    
    for slug, subcats in SLUG_TO_SUBCATS.items():
        items = candidates.get(slug, [])
        if not items:
            print(f"❌ No candidates found for {slug}!")
            continue
            
        print(f"\n🌿 Product: {slug} (Subcategories: {', '.join(subcats)})")
        # Process up to 3 distinct images for this plant
        for idx in range(min(3, len(items))):
            img_num = idx + 1
            cand_item = items[idx]
            url = cand_item['url']
            title = cand_item['title']
            
            print(f"   [{img_num}/3] Fetching '{title}'...")
            req = urllib.request.Request(url, headers=HEADERS)
            try:
                with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
                    data = r.read()
                    
                im = Image.open(io.BytesIO(data))
                if im.mode != 'RGB':
                    im = im.convert('RGB')
                    
                # Downscale gracefully if larger than 1800px to maintain crispness and reasonable app bundle size
                max_dim = max(im.size)
                if max_dim > 1800:
                    scale = 1800.0 / max_dim
                    new_w = int(im.size[0] * scale)
                    new_h = int(im.size[1] * scale)
                    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    
                # Apply GLOROV watermark
                watermarked = apply_glorov_watermark(im)
                total_images_processed += 1
                
                # Save to all target subcategory directories for Flutter & Backend
                for subcat in subcats:
                    flutter_path = f"flutter/assets/images/products/{subcat}/{slug}-{img_num}.jpg"
                    backend_path = f"apps/backend/static/products/{subcat}/{slug}-{img_num}.jpg"
                    
                    os.makedirs(os.path.dirname(flutter_path), exist_ok=True)
                    os.makedirs(os.path.dirname(backend_path), exist_ok=True)
                    
                    watermarked.save(flutter_path, 'JPEG', quality=92, optimize=True)
                    watermarked.save(backend_path, 'JPEG', quality=92, optimize=True)
                    total_files_written += 2
                    
                size_kb = os.path.getsize(f"flutter/assets/images/products/{subcats[0]}/{slug}-{img_num}.jpg") / 1024
                print(f"       ✓ Saved {im.size[0]}x{im.size[1]} ({size_kb:.1f} KB) -> {len(subcats)} subcats")
                
            except Exception as e:
                print(f"       ❌ Failed to fetch/process image {img_num}: {e}")
                
    print("\n" + "=" * 70)
    print(f"🎉 Live Plant Ingestion Complete!")
    print(f"   Distinct Botanical Images Processed: {total_images_processed}")
    print(f"   Total Asset Files Written: {total_files_written}")
    print("=" * 70)

if __name__ == '__main__':
    process_and_save_plant_images()
