import os, sys, time, json, ssl, urllib.request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from PIL import Image

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

options = Options()
options.add_argument('--headless')
options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')

driver = webdriver.Chrome(options=options)

def get_unsplash(query, count=2):
    url = f'https://unsplash.com/s/photos/{query.replace(" ", "-")}'
    driver.get(url)
    time.sleep(2.5)
    imgs = driver.find_elements(By.TAG_NAME, 'img')
    found = []
    for img in imgs:
        src = img.get_attribute('src') or ''
        alt = (img.get_attribute('alt') or '').lower()
        if 'images.unsplash.com/photo-' in src and len(alt) > 5 and not alt.startswith('go to'):
            clean_url = src.split('?')[0] + '?w=1200&q=80'
            if clean_url not in [f[1] for f in found]:
                found.append((alt, clean_url))
                if len(found) >= count:
                    break
    return found

print("Testing search queries...")
queries = {
    'petunia_basket': 'petunia-hanging-basket',
    'petunia_meadow': 'petunia-garden',
    'chrysanthemum_bed': 'chrysanthemum-garden',
    'dahlia_bouquet': 'dahlia-bouquet',
    'cosmos_meadow': 'cosmos-flowers-field',
    'portulaca_blooms': 'portulaca-flowers',
    'tulsi_leaves': 'holy-basil-plant',
    'tomato_harvest_crate': 'harvested-tomatoes-wooden-crate',
    'brinjal_harvest': 'fresh-eggplant-harvest',
    'cabbage_harvest': 'fresh-cabbages-harvest',
    'onion_field': 'scallions-garden-bed',
    'onion_harvest': 'fresh-green-onions-harvest',
}

results = {}
for k, q in queries.items():
    photos = get_unsplash(q, 2)
    results[k] = photos
    print(f"[{k}] -> {len(photos)} found:")
    for alt, u in photos:
        print(f"   {alt[:40]} -> {u}")

driver.quit()

with open('/tmp/unsplash_curated.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Saved /tmp/unsplash_curated.json")
