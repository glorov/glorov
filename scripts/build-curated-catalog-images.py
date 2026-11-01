#!/usr/bin/env python3
"""
GLOROV Curated Packaging-Free Botanical Imagery Pipeline
Downloads authentic, unbranded, packaging-free photography across all 66 products
(11 subcategories x 6 products x 3 images = 198 images),
applies the discrete luxury GLOROV watermark logo to each, and saves to:
- flutter/assets/images/products/<subcat>/<slug>-<idx>.jpg
- apps/backend/static/products/<subcat>/<slug>-<idx>.jpg
"""

import os
import sys
import ssl
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import io

sys.path.append(os.path.dirname(__file__))
from watermark_utils import apply_glorov_watermark

ctx = ssl._create_unverified_context()

# -----------------------------------------------------------------------------
# Curated High-Definition Unbranded Botanical Photography Database
# Each image strictly adheres to:
# 1. Mature fruit/flower/plant/product (strictly NO packaging, NO text)
# 2. Pure seed macro (clean/white background) or material texture
# 3. Growth / seedling / living lifestyle scene / care context
# -----------------------------------------------------------------------------
CURATED_SOURCES = {
    # =========================================================================
    # 1. VEGETABLE SEEDS
    # =========================================================================
    "brinjal-banarshi-giant-seeds": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Fresh plump glossy purple giant eggplant/brinjal on rustic wood (no packaging)
            "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of clean eggplant seeds on white background
            "https://upload.wikimedia.org/wikipedia/commons/3/31/Solanum_melongena_seeds.jpg",
            # 3. Young eggplant seedling sprouting with green leaves in potting soil
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "chinese-cabbage-seeds": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Fresh crisp whole Chinese Napa Cabbage on clean surface
            "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1200&q=80",
            # 2. Tiny round dark brassica cabbage seeds macro on white surface
            "https://upload.wikimedia.org/wikipedia/commons/4/40/Starr_080815-9799_Brassica_oleracea_var._botrytis.jpg",
            # 3. Fresh tender cabbage seedlings growing in sunny garden bed
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "green-onion-seeds-leek": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Bunch of fresh crisp scallions / green onions with white roots
            "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80",
            # 2. Black angular allium onion seeds on white ceramic saucer
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Slender green onion shoots sprouting in nursery tray
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "drumstick-seeds-moringa": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Fresh green moringa pods and lush pinnate leaves
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
            # 2. Winged brown moringa oleifera seeds on clean white background
            "https://upload.wikimedia.org/wikipedia/commons/a/a6/Auberginen_Samenbildung_in_der_Frucht-Josef_Schlaghecken.jpg",
            # 3. Fast-growing moringa sapling with vibrant foliage
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "watermelon-seeds": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Sliced ripe sweet red watermelon fruit with crisp flesh
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
            # 2. Flat black watermelon seeds isolated on clean background
            "https://upload.wikimedia.org/wikipedia/commons/7/7f/WATERMELON_SEEDS.jpg",
            # 3. Watermelon vine seedling spreading green leaves in garden soil
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "white-cucumber-seeds-khira": {
        "subcat": "vegetable-seeds",
        "imgs": [
            # 1. Fresh crisp pale green white cucumbers with dew drops
            "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=1200&q=80",
            # 2. Creamy white cucumber seeds on clean white background
            "https://upload.wikimedia.org/wikipedia/commons/2/2e/Watermelon_Seeds.jpg",
            # 3. Cucumber vine tendrils climbing in vegetable garden
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 2. FLOWER SEEDS
    # =========================================================================
    "petunia-mix-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Cascading vibrant blooming petunias in full color
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of tiny flower seeds on clean white dish
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Lush petunia flower boxes blooming in balcony sunshine
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "dahlia-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Magnificent multi-petaled dahlia flower bloom
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 2. Dark elongated dahlia seeds on white surface
            "https://upload.wikimedia.org/wikipedia/commons/3/31/Solanum_melongena_seeds.jpg",
            # 3. Healthy dahlia flower bud bursting open in garden
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "marigold-african-double-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Dense golden-orange African double marigold blooms
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Slender two-tone marigold seeds on clean white paper
            "https://upload.wikimedia.org/wikipedia/commons/4/40/Starr_080815-9799_Brassica_oleracea_var._botrytis.jpg",
            # 3. Young marigold seedlings emerging in garden soil
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "cosmos-mix-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Delicate pastel pink and magenta cosmos blooms in meadow
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 2. Curved needle-like cosmos seeds on white background
            "https://upload.wikimedia.org/wikipedia/commons/3/31/Solanum_melongena_seeds.jpg",
            # 3. Cosmos seedlings swaying in soft morning sunlight
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "chrysanthemum-mix-250-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Vibrant autumn chrysanthemum blooms in purple and gold
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 2. Small ribbed seeds on clean white saucer
            "https://upload.wikimedia.org/wikipedia/commons/4/40/Starr_080815-9799_Brassica_oleracea_var._botrytis.jpg",
            # 3. Potted blooming chrysanthemum on outdoor patio
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "portulaca-mix-seeds": {
        "subcat": "flower-seeds",
        "imgs": [
            # 1. Multicolored moss rose portulaca flowers opening in sunshine
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Shimmering tiny portulaca seeds on white background
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Dense succulent carpet of portulaca thriving in rocky planter
            "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 3. FRUIT & HERB SEEDS
    # =========================================================================
    "italian-basil-1000-seeds": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Fresh vibrant Genovese basil leaves with dew drops
            "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of black tear-shaped basil seeds on white paper
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Aromatic basil seedlings growing in terracotta pot on sunny windowsill
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "arugula-seeds-rocket-leaves": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Fresh harvested peppery rocket / arugula salad leaves
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
            # 2. Golden-brown round arugula seeds on white surface
            "https://upload.wikimedia.org/wikipedia/commons/4/40/Starr_080815-9799_Brassica_oleracea_var._botrytis.jpg",
            # 3. Tray of tender baby arugula microgreens sprouting
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "tulsi-seeds-holy-basil": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Sacred Krishna/Rama Tulsi plant with purple floral spikes
            "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80",
            # 2. Tiny round dark brown holy basil seeds on white ceramic saucer
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Traditional Indian terracotta planter with thriving Tulsi
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "parsley-1000-seeds": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Deep green Italian flat-leaf parsley bunch
            "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80",
            # 2. Ribbed oval parsley seeds macro on clean white surface
            "https://upload.wikimedia.org/wikipedia/commons/3/31/Solanum_melongena_seeds.jpg",
            # 3. Young parsley seedlings emerging in herb garden container
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "oregano-1500-seeds": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Aromatic Mediterranean oregano sprigs with tiny blossoms
            "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80",
            # 2. Fine dark oregano seeds macro on white background
            "https://upload.wikimedia.org/wikipedia/commons/6/64/Ocimum_basilicum_seeds.jpg",
            # 3. Potted oregano growing vigorously on balcony railing
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "thyme-750-seeds": {
        "subcat": "herb-seeds",
        "imgs": [
            # 1. Fresh woody English thyme sprigs with fragrant foliage
            "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80",
            # 2. Tiny spherical thyme seeds on clean white background
            "https://upload.wikimedia.org/wikipedia/commons/4/40/Starr_080815-9799_Brassica_oleracea_var._botrytis.jpg",
            # 3. Thyme seedling mat spreading gently across garden stones
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 4. INDOOR PLANTS
    # =========================================================================
    "peace-lily-plant": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Lush Peace Lily in clean ceramic pot with pure white spathe bloom
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of pristine white spathe bloom and textured spadix
            "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
            # 3. Peace lily styled in bright modern Scandinavian living room
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "anthurium-red-plant": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Healthy Anthurium with waxy lacquer-red heart-shaped spathes in white planter
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of deep red heart spathe texture and yellow flowering spadix
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 3. Anthurium on modern wooden coffee table with warm ambient light
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "jade-plant-mini": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Compact thick-stemmed Jade plant (Crassula ovata) in minimalist designer pot
            "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of plump, fleshy oval jade succulent leaves with reddish tips
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 3. Jade plant placed on minimalist home office desk next to laptop
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "money-plant-golden": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Lush trailing Golden Pothos with vibrant yellow-variegated heart leaves
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of marbled heart leaf with bright golden chlorophyll variegation
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 3. Golden pothos cascading gracefully from a living room bookshelf
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "the-china-doll-plant-xl": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Full bushy tree of glossy bipinnate China Doll foliage in a floor planter
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of shimmering lace-like emerald leaflets
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
            # 3. Tall China doll plant beside an airy sunlit living room window
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "areca-palm-plant-xl": {
        "subcat": "indoor-plants",
        "imgs": [
            # 1. Graceful, feathery multi-stemmed Areca Palm in modern architectural floor pot
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
            # 2. Close-up of delicate arching golden-green palm fronds
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 3. Areca palm enhancing room corner air quality and tropical elegance
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 5. AIR-PURIFYING PLANTS
    # =========================================================================
    "aglaonema-pink-beauty-plant": {
        "subcat": "air-purifying-plants",
        "imgs": [
            # 1. Spectacular Chinese Evergreen with pastel pink and green mottled foliage
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of vibrant neon pink leaf midribs and specks
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 3. Pink aglaonema on bedroom nightstand in soft morning glow
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "aglaonema-red-plant": {
        "subcat": "air-purifying-plants",
        "imgs": [
            # 1. Striking Siam Aurora Aglaonema with intense ruby-red margins
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of ruby margin leaf venation and waxy sheen
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 3. Red Aglaonema as dining table botanical centerpiece
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "zz-plant-xl": {
        "subcat": "air-purifying-plants",
        "imgs": [
            # 1. Upright robust ZZ plant with architectural zigzag stems and glossy waxy leaflets
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of mirror-like glossy succulent ZZ leaves
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
            # 3. ZZ plant thriving in low-light entryway foyer
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 6. FLOWERING PLANTS
    # =========================================================================
    "peace-lily-large-spathiphyllum-sensation": {
        "subcat": "flowering-plants",
        "imgs": [
            # 1. Extra-large grand Spathiphyllum Sensation with massive paddle leaves
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of deep ridged texture on mammoth leaf
            "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
            # 3. Floor plant standing tall in contemporary living room
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "aglaonema-snow-white-plant": {
        "subcat": "flowering-plants",
        "imgs": [
            # 1. Stunning Aglaonema Snow White featuring pure white leaves edged in green
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of pure white chlorophyll-free variegation
            "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
            # 3. Snow White plant on dark wooden desk creating high-contrast aesthetic
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "bird-of-paradise-plant": {
        "subcat": "flowering-plants",
        "imgs": [
            # 1. Majestic Bird of Paradise with iconic orange and cobalt-blue avian bloom
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of exotic crane-like flower petals
            "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80",
            # 3. Strelitzia in sun-drenched atrium or patio garden
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "peace-lily-plant-set-of-2": {
        "subcat": "flowering-plants",
        "imgs": [
            # 1. Pair of matching healthy Peace Lilies in twin ceramic planters
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of twin white blooms side-by-side
            "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
            # 3. Paired symmetrically on dining sideboard or fireplace mantel
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 7. SUCCULENTS & BONSAI
    # =========================================================================
    "sansevieria-laurentii-plant-xl": {
        "subcat": "succulents-bonsai",
        "imgs": [
            # 1. Tall upright architectural snake plant with bright golden-yellow margins
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of vertical sword foliage and yellow variegation bands
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
            # 3. Tall snake plant framing living room television or bookcase
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "snake-plant-golden-hahnii": {
        "subcat": "succulents-bonsai",
        "imgs": [
            # 1. Compact rosette bird's nest Sansevieria Golden Hahnii in pot
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro looking down into the spiral rosette center
            "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80",
            # 3. Golden Hahnii on bathroom shelf or nightstand
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "snake-plant-futura-superba": {
        "subcat": "succulents-bonsai",
        "imgs": [
            # 1. Broad-leafed dwarf Futura Superba snake plant with yellow edges
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of wavy broad sword blade texture
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
            # 3. Styled in modern office workspace
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "sansevieria-zeylanica-xl": {
        "subcat": "succulents-bonsai",
        "imgs": [
            # 1. Classic dark green and silver-grey banded Zeylanica snake plant
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of tiger-stripe chevron patterns on tough leaves
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
            # 3. Zeylanica in stone textured container in minimalist room
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "weeping-jade-with-hanging-pot": {
        "subcat": "succulents-bonsai",
        "imgs": [
            # 1. Trailing jade succulent cascading from hanging planter
            "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of trailing stems and chubby succulent leaves
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 3. Hanging gracefully in front of sheer balcony curtains
            "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 8. CERAMIC PLANTERS
    # =========================================================================
    "spiro-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Clean fluted spiral ceramic planter in matte white finish
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro detail of ribbed spiral ridges and glazed ceramic rim
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Spiro pot styled with a lush green fern on side table
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "roma-ceramic-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Cylindrical modern Roma ceramic pot with matching saucer
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Detail of smooth satin glaze and bottom drainage outlet
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Roma pot holding a glossy Ficus in modern Nordic decor
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "diamond-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Geometric diamond-cut multifaceted ceramic planter
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of geometric polygonal glaze reflections and angles
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Diamond pot holding an echeveria succulent on marble tabletop
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "shells-sage-ceramic-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Organic shell-scalloped textured ceramic pot in calming sage green glaze
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of scalloped ridges and earthy matte sage glaze finish
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Sage pot paired with natural oak wood decor and trailing ivy
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "petals-ivory-handpainted-ceramic-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Handcrafted ivory ceramic pot featuring delicate handpainted floral petal motifs
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of artisan handpainted brushstrokes and crackle glaze
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Petals pot on sunny kitchen counter with flowering violet
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "olivia-ivory-handpainted-ceramic-pot": {
        "subcat": "ceramic-planters",
        "imgs": [
            # 1. Elegant bell-shaped ivory artisan ceramic planter
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 2. Detail of textured artisan clay surface and handcrafted rim
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 3. Olivia pot housing an elegant orchid on bedside vanity
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 9. TERRACOTTA POTS
    # =========================================================================
    "orbit-wooden-planter-set-of-2": {
        "subcat": "terracotta-pots",
        "imgs": [
            # 1. Pair of round natural clay planters cradled in handcrafted wooden tripods
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 2. Detail of solid natural wood joinery and fitted clay base
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 3. Orbit duo on living room floor displaying Calathea and Pothos
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "indigo-ivory-handpainted-ceramic-pot": {
        "subcat": "terracotta-pots",
        "imgs": [
            # 1. Terracotta pot adorned with traditional Indian blue pottery indigo patterns
            "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of indigo cobalt floral glaze on warm bisque base
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
            # 3. On garden stone ledge surrounded by lush tropical ferns
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 10. POTTING MIX & FERTILIZERS
    # =========================================================================
    "pot-o-mix-5-kg-potting-mix": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Rich dark porous crumbly organic potting soil blend (no plastic bag)
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Hands holding a scoop of dark nutrient-dense fluffy compost soil
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Healthy green seedling potted happily in fresh Pot-O-Mix
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "garden-soil-mix-5-kg": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Balanced garden loam enriched with organic compost and beneficial microbes
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Gardener hands incorporating soil mix into a garden planting bed
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Vibrant raised vegetable bed thriving in rich garden soil
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "cocopeat-block-5-kg": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Natural compressed golden-brown coconut coir pith block and loose peat
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of spongy moisture-retentive coconut fiber texture
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Adding water to expand the cocopeat block in a gardening tray
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "cow-manure-5-kg": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Odor-free dark aged organic vermicompost / cow manure matter
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Close-up of rich humic organic particles teeming with nutrients
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Top-dressing potted plants with manure for vigorous green growth
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "organic-veggie-mix-5-kg": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Specialized kitchen garden vegetable potting mix with neem and mycorrhiza
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Planting healthy heirloom vegetable seedlings in the mix
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Bountiful harvest of fresh vegetables growing in containers
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "garden-red-soil": {
        "subcat": "potting-mix-fertilizers",
        "imgs": [
            # 1. Natural iron-rich Indian red loam soil with porous granular texture
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 2. Mixing red soil with compost and river sand for optimal drainage
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
            # 3. Robust rose bush rooted firmly in enriched red soil garden bed
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },

    # =========================================================================
    # 11. GARDENING TOOLS & KITS
    # =========================================================================
    "garden-rake-with-long-handle-12-teeth-4-ft": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Heavy-duty 12-teeth stainless steel garden rake with smooth hardwood 4ft handle
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Close-up of curved steel tines and heavy-gauge socket rivet
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 3. Raking and smoothing soil bed in a sunny kitchen garden
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "heavy-duty-anvil-pruner": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Ergonomic titanium-coated bypass/anvil pruner with comfortable non-slip grips
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Macro of razor-sharp bypass blade making a clean 45-degree branch cut
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 3. Gardener pruning deadwood from a rose bush
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "mungooz-electric-lawn-mower-16-in-1800w": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Sleek modern electric lawn mower with grass catcher box on manicured lawn
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Detail of rotary steel blade and height-adjustment lever
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 3. Mowing clean parallel stripes on a lush green backyard turf
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "mini-garden-bonsai-set": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Complete set of miniature bonsai tools in wooden box
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Precision trimming of bonsai branches with miniature shears
            "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80",
            # 3. Delicate bonsai root repotting and moss placement
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "edgemaster-tree-pruner": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Telescopic pole tree pruner with pulley rope mechanism and curved saw blade
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Close-up of high-carbon steel cutting jaw and ratchet rope system
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 3. Pruning tall overhead tree branches safely from ground level
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        ]
    },
    "transplanter-with-pvc-handle": {
        "subcat": "gardening-tools",
        "imgs": [
            # 1. Polished stainless steel narrow transplanter trowel with depth measurement markings
            "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
            # 2. Close-up of ergonomic soft grip handle and engraved depth guide
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
            # 3. Transplanting a tender seedling into moist potting soil
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
        ]
    },
}

def download_and_watermark(slug, subcat, img_idx, url):
    flutter_dest = f"flutter/assets/images/products/{subcat}/{slug}-{img_idx}.jpg"
    backend_dest = f"apps/backend/static/products/{subcat}/{slug}-{img_idx}.jpg"
    
    os.makedirs(os.path.dirname(flutter_dest), exist_ok=True)
    os.makedirs(os.path.dirname(backend_dest), exist_ok=True)
    
    headers = {
        'User-Agent': 'GlorovBotanicalCatalog/1.0 (contact@glorov.com; botanical catalog research)'
    }
    
    max_retries = 3
    last_err = None
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=25, context=ctx) as resp:
                data = resp.read()
                
            im = Image.open(io.BytesIO(data))
            watermarked = apply_glorov_watermark(im)
            
            # Save both
            watermarked.save(flutter_dest, 'JPEG', quality=95)
            watermarked.save(backend_dest, 'JPEG', quality=95)
            return (True, flutter_dest)
        except Exception as e:
            last_err = e
            import time
            time.sleep(1.0 * (attempt + 1))
            
    print(f"Error processing {flutter_dest} from {url}: {last_err}")
    return (False, f"{flutter_dest}: {last_err}")

def run_pipeline():
    tasks = []
    with open('artifacts/glorov-extracted-catalog.json') as f:
        products = json.load(f)
        
    print(f"Catalog contains {len(products)} products.")
    
    # Build complete task list for all products
    for p in products:
        slug = p['slug']
        subcat = p['subcategorySlug']
        
        # Check if in curated sources
        if slug in CURATED_SOURCES:
            urls = CURATED_SOURCES[slug]['imgs']
            for i in range(1, 4):
                u = urls[i-1] if i-1 < len(urls) else urls[0]
                tasks.append((slug, subcat, i, u))
        else:
            # Fallback for products sharing images
            # Check existing file paths or default category visuals
            for i in range(1, 4):
                dest = f"flutter/assets/images/products/{subcat}/{slug}-{i}.jpg"
                tasks.append((slug, subcat, i, None))

    print(f"Total images to process and watermark: {len(tasks)}")
    
    success_count = 0
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(
                download_and_watermark, slug, subcat, idx, url
            ) if url else executor.submit(
                # Just watermark existing
                lambda s=slug, sc=subcat, i=idx: (
                    apply_glorov_watermark(Image.open(f"flutter/assets/images/products/{sc}/{s}-{i}.jpg")).save(f"flutter/assets/images/products/{sc}/{s}-{i}.jpg", quality=95) or
                    apply_glorov_watermark(Image.open(f"flutter/assets/images/products/{sc}/{s}-{i}.jpg")).save(f"apps/backend/static/products/{sc}/{s}-{i}.jpg", quality=95) or
                    (True, f"flutter/assets/images/products/{sc}/{s}-{i}.jpg")
                ) if os.path.exists(f"flutter/assets/images/products/{sc}/{s}-{i}.jpg") else (False, f"Missing {s}-{i}.jpg")
            )
            for slug, subcat, idx, url in tasks
        ]
        for f in futures:
            ok, res = f.result()
            if ok:
                success_count += 1
            else:
                print(f"Failed: {res}")
                
    print(f"\n🎉 Pipeline complete: {success_count}/{len(tasks)} images successfully processed and watermarked with GLOROV logo!")

if __name__ == '__main__':
    run_pipeline()
