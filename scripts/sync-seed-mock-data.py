#!/usr/bin/env python3
"""
Synchronize mock data and catalog JSON for all 18 seed products with Shopsy recency details.
"""

import json
import re

with open('artifacts/glorov-extracted-catalog.json') as f:
    catalog = json.load(f)

import sys
import os
sys.path.append(os.path.dirname(__file__))
import importlib.util

spec = importlib.util.spec_from_file_location("apply_mod", os.path.join(os.path.dirname(__file__), "apply-shopsy-recency-seeds.py"))
apply_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(apply_mod)
SEED_MAPPING = apply_mod.SEED_MAPPING

# 1. Update artifacts/glorov-extracted-catalog.json
for p in catalog:
    slug = p['slug']
    if slug in SEED_MAPPING:
        meta = SEED_MAPPING[slug]
        p['title'] = meta['title']
        p['botanicalName'] = meta['botanicalName']
        p['shortDescription'] = meta['shortDescription']
        p['description'] = meta['description']
        p['price'] = meta['price']
        p['discountPrice'] = meta['discountPrice']
        p['discountPercent'] = int(round((1 - meta['discountPrice'] / meta['price']) * 100))

with open('artifacts/glorov-extracted-catalog.json', 'w') as f:
    json.dump(catalog, f, indent=2)

print("✓ Updated artifacts/glorov-extracted-catalog.json")

# 2. Update flutter/lib/models/glorov/glorov_mock_data.dart
mock_path = 'flutter/lib/models/glorov/glorov_mock_data.dart'
with open(mock_path) as f:
    mock_content = f.read()

for slug, meta in SEED_MAPPING.items():
    # Find block for slug
    pattern = rf"(slug:\s*'{re.escape(slug)}',\s*\n\s*title:\s*)'[^']+'"
    replacement = rf"\1'{meta['title']}'"
    mock_content = re.sub(pattern, replacement, mock_content)
    
    # Botanical name
    pattern_bot = rf"(slug:\s*'{re.escape(slug)}',[\s\S]*?botanicalName:\s*)'[^']+'"
    replacement_bot = rf"\1'{meta['botanicalName']}'"
    mock_content = re.sub(pattern_bot, replacement_bot, mock_content)

with open(mock_path, 'w') as f:
    f.write(mock_content)

print("✓ Updated flutter/lib/models/glorov/glorov_mock_data.dart")
