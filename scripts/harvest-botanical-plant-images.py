#!/usr/bin/env python3
"""
Harvest verified authentic botanical photography for all live plant products from Wikimedia Commons:
1. China Doll Plant (Radermachera sinica)
2. Areca Palm (Dypsis lutescens)
3. ZZ Plant (Zamioculcas zamiifolia)
4. Bird of Paradise (Strelitzia reginae)
5. Snake Plant varieties (Sansevieria trifasciata, Laurentii, Zeylanica, Golden Hahnii)
6. Chinese Evergreen varieties (Aglaonema costatum, Aglaonema commutatum)
7. Jade Plant (Crassula ovata)
8. Trailing / Weeping Jade (Senecio jacobsenii)
9. Money Plant / Golden Pothos (Epipremnum aureum)
10. Peace Lily (Spathiphyllum)
11. Anthurium (Anthurium andraeanum)
"""

import urllib.request
import json
import ssl
import os
import time

ctx = ssl._create_unverified_context()

def get_commons_url(title):
    info_url = f'https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|size&format=json'
    req = urllib.request.Request(info_url, headers={'User-Agent': 'GlorovBotanicalCatalog/1.0 (contact@glorov.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            pages = json.loads(r.read())['query']['pages']
            for pid in pages:
                infos = pages[pid].get('imageinfo', [])
                if infos:
                    url = infos[0].get('url', '')
                    # clean query params if any
                    clean_url = url.split('?')[0]
                    return clean_url
    except Exception as e:
        return None
    return None

def search_plant_commons(query, limit=5):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'GlorovBotanicalCatalog/1.0 (contact@glorov.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            items = json.loads(r.read())['query']['search']
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []
        
    out = []
    for it in items:
        title = it['title']
        # filter out pdf, svg, tif
        tl = title.lower()
        if not (tl.endswith('.jpg') or tl.endswith('.jpeg') or tl.endswith('.png')):
            continue
        u = get_commons_url(title)
        if u:
            out.append(u)
            if len(out) >= limit:
                break
    return out

PLANT_QUERIES = {
    'the-china-doll-plant-xl': 'Radermachera sinica',
    'areca-palm-plant-xl': 'Dypsis lutescens',
    'zz-plant-xl': 'Zamioculcas zamiifolia',
    'bird-of-paradise-plant': 'Strelitzia reginae',
    'sansevieria-laurentii-plant-xl': 'Sansevieria trifasciata',
    'snake-plant-golden-hahnii': 'Sansevieria trifasciata Hahnii',
    'snake-plant-futura-superba': 'Sansevieria trifasciata',
    'sansevieria-zeylanica-xl': 'Sansevieria zeylanica',
    'aglaonema-pink-beauty-plant': 'Aglaonema',
    'aglaonema-red-plant': 'Aglaonema',
    'aglaonema-snow-white-plant': 'Aglaonema',
    'weeping-jade-with-hanging-pot': 'Senecio jacobsenii',
    'jade-plant-mini': 'Crassula ovata',
    'money-plant-golden': 'Epipremnum aureum',
    'peace-lily-plant': 'Spathiphyllum',
    'peace-lily-large-spathiphyllum-sensation': 'Spathiphyllum',
    'peace-lily-plant-set-of-2': 'Spathiphyllum',
    'anthurium-red-plant': 'Anthurium andraeanum',
}

def harvest_all_plants():
    print("Harvesting verified botanical plant images...")
    catalog = {}
    for slug, q in PLANT_QUERIES.items():
        print(f"\nSearching for {slug} ({q})...")
        urls = search_plant_commons(q, limit=4)
        print(f"  Found {len(urls)} images for {slug}")
        catalog[slug] = urls
        time.sleep(0.3)
        
    os.makedirs('artifacts', exist_ok=True)
    out_path = 'artifacts/verified-plant-images.json'
    with open(out_path, 'w') as f:
        json.dump(catalog, f, indent=2)
    print(f"\n🎉 Saved verified plant images to {out_path}")

if __name__ == '__main__':
    harvest_all_plants()
