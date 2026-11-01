#!/usr/bin/env python3
"""
Harvest all GLOROV seed listings from Shopsy sorted by recency:
https://www.shopsy.in/search?q=glorov+seeds&sort=recency_desc
Iterates through all pages, extracts metadata, prices, and high-res image URLs.
"""

import urllib.request
import ssl
import re
import json
import os
import time

ctx = ssl._create_unverified_context()

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def harvest():
    print("=" * 70)
    print("Harvesting GLOROV Products from Shopsy (sort=recency_desc)")
    print("=" * 70)
    
    all_products = {}
    page = 1
    max_pages = 20
    
    while page <= max_pages:
        url = f"https://www.shopsy.in/search?q=glorov+seeds&sort=recency_desc&page={page}"
        print(f"Fetching Page {page}: {url}")
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                html = r.read().decode('utf-8', errors='ignore')
                
            m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
            if not m:
                print(f"  No __NEXT_DATA__ found on page {page}.")
                break
                
            data = json.loads(m.group(1))
            slots = data.get('props', {}).get('pageProps', {}).get('initialState', {}).get('pageData', {}).get('RESPONSE', {}).get('slots', [])
            
            page_count = 0
            for s in slots:
                for p in s.get('widget', {}).get('data', {}).get('products', []):
                    info = p.get('productInfo', {}).get('value', {})
                    title = info.get('titles', {}).get('title', '')
                    pid = info.get('id')
                    purl = info.get('baseUrl', '')
                    pricing = info.get('pricing', {})
                    media = info.get('media', {})
                    raw_imgs = media.get('images', [])
                    
                    if not pid or not title:
                        continue
                        
                    # Filter for GLOROV brand or relevant seed items
                    if 'glorov' in title.lower() or 'seed' in title.lower():
                        highres_imgs = []
                        for img in raw_imgs:
                            u = img.get('url', '')
                            if u:
                                # High resolution 1200x1200px
                                hr = u.replace('{@width}', '1200').replace('{@height}', '1200').replace('{@quality}', '90')
                                highres_imgs.append(hr)
                                
                        selling_price = pricing.get('finalPrice', {}).get('value')
                        mrp = None
                        prices = pricing.get('prices', [])
                        for pr in prices:
                            if pr.get('priceType') == 'MRP':
                                mrp = pr.get('value')
                                
                        if pid not in all_products:
                            all_products[pid] = {
                                'pid': pid,
                                'title': title,
                                'url': purl,
                                'selling_price': selling_price,
                                'mrp': mrp,
                                'image_count': len(highres_imgs),
                                'images': highres_imgs,
                                'page_found': page
                            }
                            page_count += 1
                            
            print(f"  Page {page}: Extracted {page_count} new products (Total unique: {len(all_products)})")
            if page_count == 0:
                print(f"  No new products on page {page}. Terminating crawl.")
                break
                
            page += 1
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  Error on page {page}: {e}")
            break
            
    os.makedirs('artifacts', exist_ok=True)
    out_path = 'artifacts/shopsy-recency-catalog.json'
    with open(out_path, 'w') as f:
        json.dump(all_products, f, indent=2)
        
    print("\n" + "=" * 70)
    print(f"🎉 Harvest Complete: {len(all_products)} products saved to {out_path}")
    print("=" * 70)

if __name__ == '__main__':
    harvest()
