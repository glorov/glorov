import os, urllib.request, ssl
from PIL import Image

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

def crop_and_save(src_path, dst_path):
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    cropped = img.crop((left, top, left + min_dim, top + min_dim))
    resized = cropped.resize((1000, 1000), Image.Resampling.LANCZOS)
    resized.save(dst_path, 'JPEG', quality=92)
    print(f"Updated -> {dst_path}")

def download_and_crop(url, dst_path):
    tmp = '/tmp/tmp_slot.jpg'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx) as r, open(tmp, 'wb') as f:
        f.write(r.read())
    crop_and_save(tmp, dst_path)

PEPPER_SEEDS_URL = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=80'
TINY_HERB_SEEDS_URL = 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=1200&q=80'
DISH_SEEDS_URL = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=1200&q=80'
COSMOS_BLOOM_URL = 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&q=80'
COSMOS_MEADOW_URL = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80'
SEEDLING_TRAY_URL = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80'

# 1. Fix Cosmos 1 and 4
download_and_crop(COSMOS_BLOOM_URL, 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg')
download_and_crop(COSMOS_MEADOW_URL, 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-4.jpg')

# 2. Fix Green Onion 3
download_and_crop(SEEDLING_TRAY_URL, 'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-3.jpg')

# 3. Fix Green Chilli 2
download_and_crop(PEPPER_SEEDS_URL, 'flutter/assets/images/products/vegetable-seeds/green-chilli-seeds-2.jpg')

# 4. Fix Herb & Flower Seeds (Slot 2)
tiny_herb_targets = [
    'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-2.jpg',
    'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-2.jpg',
    'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-2.jpg',
    'flutter/assets/images/products/herb-seeds/thyme-750-seeds-2.jpg',
    'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-2.jpg',
    'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-2.jpg',
]
for t in tiny_herb_targets:
    download_and_crop(TINY_HERB_SEEDS_URL, t)

dish_targets = [
    'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-2.jpg',
    'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-2.jpg',
    'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-2.jpg',
    'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-2.jpg',
]
for t in dish_targets:
    download_and_crop(DISH_SEEDS_URL, t)

print("Slot refinements complete!")
