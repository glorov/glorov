#!/usr/bin/env python3
"""
GLOROV Official Botanical Image Watermark Utility
Applies an elegant, discreet, high-contrast 'GLOROV' luxury watermark pill
to botanical imagery without obscuring botanical details.
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

DEFAULT_FONT = os.path.abspath('flutter/assets/fonts/grandis_extended/GrandisExtended-Bold.ttf')

def apply_glorov_watermark(im, font_path=DEFAULT_FONT, position='bottom-right'):
    """
    Applies a clean, discrete GLOROV pill watermark in the specified corner.
    Adapts pill background and typography contrast based on local background luminance.
    """
    if im.mode != 'RGB':
        im = im.convert('RGB')
    w, h = im.size
    
    # Scale typography relative to resolution: ~2.8% to 3.2% of min dimension
    font_size = max(16, int(min(w, h) * 0.028))
    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception:
        font = ImageFont.load_default()
        
    text = "GLOROV"
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    pad_h = int(font_size * 0.4)
    pad_w = int(font_size * 0.65)
    
    pill_w = tw + pad_w * 2
    pill_h = th + pad_h * 2
    
    margin_x = int(w * 0.03)
    margin_y = int(h * 0.03)
    
    if position == 'bottom-left':
        x1 = margin_x
        y1 = h - margin_y - pill_h
        x2 = x1 + pill_w
        y2 = y1 + pill_h
    elif position == 'top-right':
        x2 = w - margin_x
        y1 = margin_y
        x1 = x2 - pill_w
        y2 = y1 + pill_h
    else:  # default 'bottom-right'
        x2 = w - margin_x
        y2 = h - margin_y
        x1 = x2 - pill_w
        y1 = y2 - pill_h
        
    # Analyze background corner luminance
    crop = im.crop((max(0, x1), max(0, y1), min(w, x2), min(h, y2))).convert('L')
    lum = float(np.mean(crop))
    
    if lum > 140:
        # Light background -> frosted glass white pill with deep forest text
        pill_bg = (255, 255, 255, 195)
        text_color = (20, 50, 35, 230)
        border_color = (20, 50, 35, 80)
    else:
        # Dark background -> deep pine pill with crisp cream text
        pill_bg = (15, 35, 25, 195)
        text_color = (250, 249, 246, 240)
        border_color = (250, 249, 246, 80)
        
    radius = int(pill_h * 0.35)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=pill_bg, outline=border_color, width=1)
    
    # Center text inside pill
    text_x = x1 + (pill_w - tw) // 2
    text_y = y1 + (pill_h - th) // 2 - int(font_size * 0.1)
    draw.text((text_x, text_y), text, fill=text_color, font=font)
    
    combined = Image.alpha_composite(im.convert('RGBA'), overlay).convert('RGB')
    return combined

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print("Usage: python3 watermark_utils.py <input> <output>")
        sys.exit(1)
    in_p = sys.argv[1]
    out_p = sys.argv[2]
    img = Image.open(in_p)
    out_img = apply_glorov_watermark(img)
    out_img.save(out_p, quality=95)
    print(f"Saved {out_p}")
