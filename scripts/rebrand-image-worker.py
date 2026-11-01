#!/usr/bin/env python3
"""
GLOROV Image Inspection, Inpainting & Re-Branding Worker
Detects any "Ugaoo" branding / watermarks in botanical product images using Tesseract OCR,
inpaints the detected region with OpenCV Telea algorithm, and renders the official "Glorov"
branding using the Grandis Extended font.
"""

import sys
import os
import json
import re
import subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BRAND_PATTERNS = [
    re.compile(r'uga[o0cqs:]{1,4}', re.IGNORECASE),
    re.compile(r'\buga', re.IGNORECASE),
]

DEFAULT_FONT = os.path.abspath('flutter/assets/fonts/grandis_extended/GrandisExtended-Bold.ttf')

def detect_and_rebrand(input_path, output_path, font_path=DEFAULT_FONT):
    if not os.path.isfile(input_path):
        return {"error": f"Input file not found: {input_path}"}

    # 1. Run Tesseract OCR with TSV output
    try:
        proc = subprocess.run(
            ['tesseract', os.path.abspath(input_path), 'stdout', '--psm', '11', 'tsv'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False
        )
        tsv_output = proc.stdout.decode('utf-8', errors='ignore')
    except Exception as e:
        tsv_output = ""

    # Parse TSV lines for branding matches
    boxes = []
    for line in tsv_output.splitlines():
        parts = line.split('\t')
        if len(parts) >= 12:
            word = parts[11].strip()
            if any(p.search(word) for p in BRAND_PATTERNS):
                try:
                    conf = float(parts[10])
                    x, y, w, h = int(parts[6]), int(parts[7]), int(parts[8]), int(parts[9])
                    boxes.append({'x': x, 'y': y, 'w': w, 'h': h, 'word': word, 'conf': conf})
                except ValueError:
                    pass

    # Read image
    img_bgr = cv2.imread(os.path.abspath(input_path))
    if img_bgr is None:
        return {"error": f"Failed to load image with OpenCV: {input_path}"}

    h_img, w_img = img_bgr.shape[:2]
    rebranded = False

    if boxes:
        rebranded = True
        # Inpaint each detected box
        mask = np.zeros((h_img, w_img), dtype=np.uint8)
        for b in boxes:
            pad_x = max(10, int(b['w'] * 0.15))
            pad_y = max(8, int(b['h'] * 0.20))
            x1 = max(0, b['x'] - pad_x)
            y1 = max(0, b['y'] - pad_y)
            x2 = min(w_img, b['x'] + b['w'] + pad_x)
            y2 = min(h_img, b['y'] + b['h'] + pad_y)
            mask[y1:y2, x1:x2] = 255

        # Telea Inpainting
        inpainted_bgr = cv2.inpaint(img_bgr, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

        # Convert to PIL for anti-aliased font rendering
        img_pil = Image.fromarray(cv2.cvtColor(inpainted_bgr, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)

        for b in boxes:
            x, y, w, h = b['x'], b['y'], b['w'], b['h']
            # Determine font size that fits both height and width
            target_font_size = max(12, int(h * 0.85))
            font = None
            for size in range(target_font_size, 10, -2):
                try:
                    f_cand = ImageFont.truetype(font_path, size=size)
                    bbox = draw.textbbox((0, 0), "Glorov", font=f_cand)
                    tw = bbox[2] - bbox[0]
                    if tw <= max(w * 1.25, 40):
                        font = f_cand
                        break
                except Exception:
                    break
            if font is None:
                try:
                    font = ImageFont.truetype(font_path, size=12)
                except Exception:
                    font = ImageFont.load_default()

            # Sample surrounding background color
            sample_y = max(0, y - 10)
            sample_x = max(0, x - 10)
            bg_sample = img_bgr[sample_y, sample_x] # BGR
            luminance = 0.299 * bg_sample[2] + 0.587 * bg_sample[1] + 0.114 * bg_sample[0]

            # Choose high-contrast botanical text color
            if luminance > 128:
                # Light background -> Dark botanical green
                text_color = (44, 76, 56) # #2C4C38
            else:
                # Dark background -> Clean crisp cream/white
                text_color = (250, 249, 246) # #FAF9F6

            # Render "Glorov"
            draw.text((x, y), "Glorov", fill=text_color, font=font)

        # Ensure output directory exists
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        img_pil.save(os.path.abspath(output_path), quality=95)
    else:
        # No branding found, write high-res copy directly
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(os.path.abspath(output_path), img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

    return {
        "success": True,
        "branding_found": rebranded,
        "boxes_detected": len(boxes),
        "output_path": output_path
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 rebrand-image-worker.py <input_img> <output_img> [font_path]")
        sys.exit(1)
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    f_path = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_FONT
    res = detect_and_rebrand(in_file, out_file, f_path)
    print(json.dumps(res))
