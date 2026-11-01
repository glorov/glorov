import os, sys, json, ssl, urllib.request, subprocess
from PIL import Image

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
ASSETS_DIR = os.path.join(ROOT_DIR, 'flutter/assets/images/products')
MAP_PATH = os.path.join(ROOT_DIR, 'apps/backend/data/cloudinary-image-map.json')

# Standard verified seedling tray
STANDARD_SEEDLING_TRAY = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80'

# Clean seed macro on white
STANDARD_SEED_MACRO = 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=1200&q=80'

SPECIES = [
    {
        'handle': 'brinjal-banarshi-giant-seeds',
        'title': 'Brinjal Banarasi Giant Seeds',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Hero (Shopsy authentic listing)
            'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/e/r/7/12000-sedvgtbjlks-glorov-original-imahsmt2zyaqwbst.jpeg',
            # 2: Seeds on white
            'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=1200&q=80',
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing brinjal plant with eggplant in garden
            'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
            # 5: Bountiful eggplant harvest
            'https://images.unsplash.com/photo-1683543122945-513029986574?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-6.jpg',
        ]
    },
    {
        'handle': 'chinese-cabbage-seeds',
        'title': 'Chinese Cabbage Seeds',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Hero (Shopsy authentic listing)
            'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/s/0/z/13000-sedvgtcbxtf-glorov-original-imahsndtka8r5xqf.jpeg',
            # 2: Seeds on white
            'https://upload.wikimedia.org/wikipedia/commons/d/d4/Raapstelen_gekiemde_zaden_%28Brassica_campestris_germinating_seeds%29.jpg',
            # 3: Seedling tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing cabbage heads
            'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=1200&q=80',
            # 5: Harvested cabbages basket
            'https://images.unsplash.com/photo-1652860213441-6622f9fec77f?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/chinese-cabbage-seeds-6.jpg',
        ]
    },
    {
        'handle': 'green-onion-seeds-leek',
        'title': 'Green Onion Seeds (Leek)',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Hero (Shopsy authentic listing)
            'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/r/x/d/1000-sedvgtonnje-glorov-original-imahs4gcdpqkzhsv.jpeg',
            # 2: Black onion seeds on white
            'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-2.jpg',
            # 3: Seedling tray
            'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-3.jpg',
            # 4: Green onions growing in garden bed
            'https://images.unsplash.com/photo-1777499699424-e26d608008f4?w=1200&q=80',
            # 5: Fresh green spring onions bunch
            'https://images.unsplash.com/photo-1559836833-2a2c99b1f54f?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/green-onion-seeds-leek-6.jpg',
        ]
    },
    {
        'handle': 'drumstick-seeds-moringa',
        'title': 'Drumstick Seeds (Moringa)',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Moringa tree with pods
            'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg',
            # 2: Winged moringa seeds
            'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-2.jpg',
            # 3: Seedling tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing moringa tree
            'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg',
            # 5: Harvested moringa drumsticks
            'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/drumstick-seeds-moringa-6.jpg',
        ]
    },
    {
        'handle': 'watermelon-seeds',
        'title': 'Watermelon Seeds',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Watermelon sitting on plant in garden
            'https://images.unsplash.com/photo-1720239278431-bf2a0c838180?w=1200&q=80',
            # 2: Black watermelon seeds on white
            'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-2.jpg',
            # 3: Watermelon seedlings in tray
            'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-3.jpg',
            # 4: Spreading watermelon vine in garden
            'https://upload.wikimedia.org/wikipedia/commons/0/0c/Citrullus_lanatus_03.JPG',
            # 5: Sliced fresh juicy red watermelon
            'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/watermelon-seeds-6.jpg',
        ]
    },
    {
        'handle': 'white-cucumber-seeds-khira',
        'title': 'White Cucumber Seeds (Khira)',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Cucumber growing on vine in garden
            'https://images.unsplash.com/photo-1713869822431-c9b7429d0c6c?w=1200&q=80',
            # 2: Cucumber seeds on white grid
            'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-2.jpg',
            # 3: Cucumber seedlings
            'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-3.jpg',
            # 4: Growing cucumber plant
            'https://images.unsplash.com/photo-1518568403628-df55701ade9e?w=1200&q=80',
            # 5: Fresh harvested cucumbers
            'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-6.jpg',
        ]
    },
    {
        'handle': 'tomato-vegetable-seeds',
        'title': 'Heirloom Tomato Vegetable Seeds',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: User Image 2
            'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-1.png',
            # 2: User Image 3
            'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-2.png',
            # 3: User Image 4
            'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-3.jpg',
            # 4: Staked flowering tomato vine
            'https://res.cloudinary.com/naodmm8w/image/upload/v1793562968/glorov/products/vegetable-seeds/tomato-vegetable-seeds-4.jpg',
            # 5: Fresh harvested ripe red tomatoes
            'https://images.unsplash.com/photo-1724908097678-1cb50ee5e352?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/heirloom-tomato-vegetable-seeds-6.jpg',
        ]
    },
    {
        'handle': 'green-chilli-seeds',
        'title': 'Green Chilli Seeds',
        'category': 'vegetable-seeds',
        'slots': [
            # 1: Shopsy authentic listing
            'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/l/n/g/1000-sedvgtcpzw0-glorov-original-imahsng9w73dkwnh.jpeg',
            # 2: Chilli seeds on white
            STANDARD_SEED_MACRO,
            # 3: Chilli seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing chilli pepper plant
            'flutter/assets/images/products/vegetable-seeds/green-chilli-seeds-1.jpg',
            # 5: Fresh green chillies harvest
            'flutter/assets/images/products/vegetable-seeds/green-chilli-seeds-1.jpg',
            # 6: Care card
            'flutter/assets/images/products/vegetable-seeds/green-chilli-seeds-6.jpg',
        ]
    },
    {
        'handle': 'petunia-mix-seeds',
        'title': 'Petunia Mix Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Colorful petunias in hanging basket
            'https://images.unsplash.com/photo-1780019763727-0e64a3a07e06?w=1200&q=80',
            # 2: Tiny seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Colorful petunias in garden bed
            'https://images.unsplash.com/photo-1786550028419-2f6696405f60?w=1200&q=80',
            # 5: Pink petunia blooms
            'https://images.unsplash.com/photo-1655684843054-2bdbded9ff3c?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/petunia-mix-seeds-6.jpg',
        ]
    },
    {
        'handle': 'dahlia-seeds',
        'title': 'Dahlia Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Shopsy authentic listing
            'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/o/k/2/3-seddecrsw4id-glorov-original-imahrk8gkvhsfezr.jpeg',
            # 2: Seeds on white
            'flutter/assets/images/products/flower-seeds/dahlia-seeds-2.jpg',
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Flowering dahlia plant
            'flutter/assets/images/products/flower-seeds/dahlia-seeds-1.jpg',
            # 5: Vibrant dahlia bouquet
            'https://images.unsplash.com/photo-1617417715887-d51297ecdbca?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/dahlia-seeds-6.jpg',
        ]
    },
    {
        'handle': 'marigold-african-double-seeds',
        'title': 'Marigold African Double Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Shopsy authentic listing
            'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/t/m/q/100-sedflwmgpl9-glorov-original-imahrk8gruwhdbjw.jpeg',
            # 2: Needle marigold seeds
            'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-2.jpg',
            # 3: Seedlings in tray
            'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-3.jpg',
            # 4: Marigold garden bed
            'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/t/m/q/100-sedflwmgpl9-glorov-original-imahrk8gruwhdbjw.jpeg',
            # 5: Golden orange marigold flowers
            'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-5.jpg',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/marigold-african-double-seeds-6.jpg',
        ]
    },
    {
        'handle': 'cosmos-mix-seeds',
        'title': 'Cosmos Mix Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Shopsy authentic listing
            'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/z/o/c/40-sedvgtlfajm-glorov-original-imahrk8fqcbtxkdg.jpeg',
            # 2: Slender cosmos seeds
            'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-2.jpg',
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Cosmos plant in garden
            'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg',
            # 5: Pink and white cosmos meadow
            'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/cosmos-mix-seeds-6.jpg',
        ]
    },
    {
        'handle': 'chrysanthemum-mix-250-seeds',
        'title': 'Chrysanthemum Mix Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Vibrant chrysanthemum blooms
            'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=1200&q=80',
            # 2: Seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Yellow chrysanthemum garden bush
            'https://images.unsplash.com/photo-1580642178672-699fd3c0f399?w=1200&q=80',
            # 5: Multicolored chrysanthemum garden bed
            'https://images.unsplash.com/photo-1554727434-e842126abc82?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-6.jpg',
        ]
    },
    {
        'handle': 'portulaca-mix-seeds',
        'title': 'Portulaca Mix Seeds',
        'category': 'flower-seeds',
        'slots': [
            # 1: Pink Portulaca grandiflora (Moss Rose)
            'https://images.unsplash.com/photo-1613900526182-f03f7d91554c?w=1200&q=80',
            # 2: Seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing portulaca plant
            'https://images.unsplash.com/photo-1613900526182-f03f7d91554c?w=1200&q=80',
            # 5: Red and yellow portulaca flowers
            'https://images.unsplash.com/photo-1618248982980-65d91c2ab467?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/flower-seeds/portulaca-mix-seeds-6.jpg',
        ]
    },
    {
        'handle': 'italian-basil-1000-seeds',
        'title': 'Italian Basil Seeds',
        'category': 'herb-seeds',
        'slots': [
            # 1: Sweet Italian basil plant in brown clay pot
            'https://images.unsplash.com/photo-1630081015294-05e6a3044eeb?w=1200&q=80',
            # 2: Tiny black basil seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Potted basil plant on window sill
            'https://images.unsplash.com/photo-1646983205802-0adf649e4a5a?w=1200&q=80',
            # 5: Fresh fragrant basil leaves harvest
            'https://images.unsplash.com/photo-1776257217010-1c2e92207f2a?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/italian-basil-1000-seeds-6.jpg',
        ]
    },
    {
        'handle': 'arugula-seeds-rocket-leaves',
        'title': 'Arugula Seeds (Rocket Leaves)',
        'category': 'herb-seeds',
        'slots': [
            # 1: Fresh green arugula plant on black soil
            'https://images.unsplash.com/photo-1598998255418-566554056dbc?w=1200&q=80',
            # 2: Small golden seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing leafy arugula patch
            'https://images.unsplash.com/photo-1598998255418-566554056dbc?w=1200&q=80',
            # 5: Tender freshly picked arugula leaves
            'https://images.unsplash.com/photo-1598998255418-566554056dbc?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-6.jpg',
        ]
    },
    {
        'handle': 'tulsi-seeds-holy-basil',
        'title': 'Tulsi Seeds (Holy Basil)',
        'category': 'herb-seeds',
        'slots': [
            # 1: Authentic Holy Basil plant with flowers
            'https://upload.wikimedia.org/wikipedia/commons/8/8b/Holy_Basil_edit2.jpg',
            # 2: Dark holy basil seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Bushy tulsi plant
            'https://upload.wikimedia.org/wikipedia/commons/8/8b/Holy_Basil_edit2.jpg',
            # 5: Fresh holy basil leaves harvest
            'https://images.unsplash.com/photo-1664289283342-7dfd936b4b99?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/tulsi-seeds-holy-basil-6.jpg',
        ]
    },
    {
        'handle': 'parsley-1000-seeds',
        'title': 'Parsley Seeds',
        'category': 'herb-seeds',
        'slots': [
            # 1: Fresh green parsley plant
            'https://images.unsplash.com/photo-1633640737481-2e9aabd87033?w=1200&q=80',
            # 2: Parsley seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Potted parsley growing
            'https://images.unsplash.com/photo-1590759485418-90509afec818?w=1200&q=80',
            # 5: Fresh parsley bunch harvest
            'https://images.unsplash.com/photo-1721117090894-029c81cf0758?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/parsley-1000-seeds-6.jpg',
        ]
    },
    {
        'handle': 'oregano-1500-seeds',
        'title': 'Oregano Seeds',
        'category': 'herb-seeds',
        'slots': [
            # 1: Fresh green oregano herb plant
            'https://images.unsplash.com/photo-1606072104299-cdaab62c0a07?w=1200&q=80',
            # 2: Oregano seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Oregano plant growing in soil
            'https://images.unsplash.com/photo-1713260111133-30c5153e27cd?w=1200&q=80',
            # 5: Fresh fragrant oregano sprigs harvest
            'https://images.unsplash.com/photo-1690877468013-f5c174498a53?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/oregano-1500-seeds-6.jpg',
        ]
    },
    {
        'handle': 'thyme-750-seeds',
        'title': 'Thyme Seeds',
        'category': 'herb-seeds',
        'slots': [
            # 1: Bushy French thyme plant
            'https://images.unsplash.com/photo-1607721098274-e54cbfab475d?w=1200&q=80',
            # 2: Thyme seeds on white
            STANDARD_SEED_MACRO,
            # 3: Seedlings in tray
            STANDARD_SEEDLING_TRAY,
            # 4: Growing thyme herb plant
            'https://images.unsplash.com/photo-1689082697963-c7791a09088b?w=1200&q=80',
            # 5: Fresh cut thyme sprigs harvest
            'https://images.unsplash.com/photo-1679061584104-534b7ec4afe6?w=1200&q=80',
            # 6: Care card
            'flutter/assets/images/products/herb-seeds/thyme-750-seeds-6.jpg',
        ]
    },
]

print("Processing all 20 species...")
for item in SPECIES:
    print(f"\nProcessing {item['title']} ({item['handle']})...")
    for slot_idx, src in enumerate(item['slots'], 1):
        ext = 'png' if 'tomato' in item['handle'] and slot_idx <= 2 else 'jpg'
        prefix = 'heirloom-' if 'tomato' in item['handle'] else ''
        dst_name = f"{prefix}{item['handle']}-{slot_idx}.{ext}"
        dst_path = os.path.join(ASSETS_DIR, item['category'], dst_name)
        tmp_path = f"/tmp/dl_{item['handle']}_{slot_idx}.{ext}"
        
        # Download or copy
        if src.startswith('http'):
            try:
                req = urllib.request.Request(src, headers=headers)
                with urllib.request.urlopen(req, context=ctx, timeout=15) as r, open(tmp_path, 'wb') as f:
                    f.write(r.read())
            except Exception as e:
                print(f"  ❌ Download failed for slot {slot_idx} ({src}): {e}")
                if os.path.exists(dst_path):
                    print(f"    (Keeping existing {dst_path})")
                    continue
        else:
            full_local = os.path.join(ROOT_DIR, src)
            if os.path.exists(full_local) and full_local != dst_path:
                with open(full_local, 'rb') as f_in, open(tmp_path, 'wb') as f_out:
                    f_out.write(f_in.read())
            elif os.path.exists(dst_path):
                tmp_path = dst_path

        # Crop to square 1000x1000
        if os.path.exists(tmp_path):
            try:
                img = Image.open(tmp_path).convert('RGB')
                w, h = img.size
                min_dim = min(w, h)
                left = (w - min_dim) // 2
                top = (h - min_dim) // 2
                cropped = img.crop((left, top, left + min_dim, top + min_dim))
                resized = cropped.resize((1000, 1000), Image.Resampling.LANCZOS)
                fmt = 'PNG' if ext == 'png' else 'JPEG'
                resized.save(dst_path, fmt, quality=92)
                print(f"  ✅ Slot {slot_idx} saved -> {dst_path}")
            except Exception as e:
                print(f"  ❌ Process error slot {slot_idx}: {e}")

print("\nAll images processed locally!")
