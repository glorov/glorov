import urllib.request, ssl, os
from PIL import Image

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'GlorovBotanicalBot/1.0 (https://glorov.in; admin@glorov.in)'}

def download_and_crop(url, dst_path):
    tmp = '/tmp/tmp_botanical.jpg'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx) as r, open(tmp, 'wb') as f:
        f.write(r.read())
    
    img = Image.open(tmp).convert('RGB')
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    cropped = img.crop((left, top, left + min_dim, top + min_dim))
    resized = cropped.resize((1000, 1000), Image.Resampling.LANCZOS)
    resized.save(dst_path, 'JPEG', quality=92)
    print(f"✅ Saved 1000x1000 -> {dst_path}")

# 1. Cosmos flowers
COSMOS_PINK = 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Cosmos_bipinnatus_pink%2C_Burdwan%2C_West_Bengal%2C_India_10_01_2013.jpg'
COSMOS_MEADOW = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cosmos_bipinnatus_%28flowers%29_03.jpg'
download_and_crop(COSMOS_PINK, 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg')
download_and_crop(COSMOS_MEADOW, 'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-4.jpg')

# 2. Basil & Tulsi seeds
BASIL_SEEDS = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Ocimum_basilicum_seeds_1.jpg'
download_and_crop(BASIL_SEEDS, 'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-2.jpg')
download_and_crop(BASIL_SEEDS, 'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-2.jpg')

# 3. Parsley & Chrysanthemum seeds
PARSLEY_SEEDS = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Petroselinum_crispum_seeds.jpg'
download_and_crop(PARSLEY_SEEDS, 'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-2.jpg')
download_and_crop(PARSLEY_SEEDS, 'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-2.jpg')

# 4. Thyme, Oregano, Petunia, Portulaca seeds
THYME_SEEDS = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Thymus_vulgaris_seed-timjami_siemen.jpg'
download_and_crop(THYME_SEEDS, 'flutter/assets/images/products/herb-seeds/thyme-750-seeds-2.jpg')
download_and_crop(THYME_SEEDS, 'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-2.jpg')
download_and_crop(THYME_SEEDS, 'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-2.jpg')
download_and_crop(THYME_SEEDS, 'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-2.jpg')

# 5. Arugula seeds
ARUGULA_SEEDS = 'https://upload.wikimedia.org/wikipedia/commons/5/59/Eruca_sativa_seeds.JPG'
download_and_crop(ARUGULA_SEEDS, 'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-2.jpg')

# 6. Chinese Cabbage seeds
CABBAGE_SEEDS = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Raapstelen_gekiemde_zaden_%28Brassica_campestris_germinating_seeds%29.jpg'
download_and_crop(CABBAGE_SEEDS, 'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-2.jpg')

print("All botanical assets successfully downloaded and saved!")
