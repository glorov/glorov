import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "docs/elsesourav-publish"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Fonts
FRAUNCES_BOLD = "apps/storefront/public/fonts/Fraunces-Bold.ttf"
FRAUNCES_REGULAR = "apps/storefront/public/fonts/Fraunces-Regular.ttf"
JAKARTA_BOLD = "apps/storefront/public/fonts/PlusJakartaDisplay-Bold.otf"
JAKARTA_MEDIUM = "apps/storefront/public/fonts/PlusJakartaDisplay-Medium.otf"
JAKARTA_REG = "apps/storefront/public/fonts/PlusJakartaDisplay-Regular.otf"

def draw_gradient(draw, width, height, start_color, end_color):
    """Draw a smooth vertical linear gradient."""
    for y in range(height):
        t = y / max(1, height - 1)
        r = int(start_color[0] + (end_color[0] - start_color[0]) * t)
        g = int(start_color[1] + (end_color[1] - start_color[1]) * t)
        b = int(start_color[2] + (end_color[2] - start_color[2]) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def draw_pill(draw, xy, text, font, bg_color, text_color, border_color=None, padding=(16, 8)):
    x, y = xy
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pw, ph = padding
    rect = [x, y, x + tw + pw * 2, y + th + ph * 2]
    radius = (th + ph * 2) // 2
    draw.rounded_rectangle(rect, radius=radius, fill=bg_color, outline=border_color, width=1)
    draw.text((x + pw, y + ph - bbox[1] // 4), text, font=font, fill=text_color)
    return rect[2]  # return right x

# ==============================================================================
# 1. APPLICATION ICON (512x512, 1:1)
# ==============================================================================
print("Creating Application Icon (512x512)...")
icon_img = Image.open("apps/storefront/public/icons/Icon-512.png").convert("RGBA")
# High quality resize and ensure clean background
icon_canvas = Image.new("RGBA", (512, 512), (18, 38, 30, 255))
# Overlay with subtle inner border glow
draw_icon = ImageDraw.Draw(icon_canvas)
draw_icon.rounded_rectangle([0, 0, 511, 511], radius=112, fill=(18, 45, 34, 255), outline=(52, 211, 153, 120), width=3)
# Paste brand logo centered
icon_resized = icon_img.resize((420, 420), Image.Resampling.LANCZOS)
icon_canvas.paste(icon_resized, (46, 46), icon_resized)
icon_canvas.save(os.path.join(OUTPUT_DIR, "glorov-app-icon.png"), "PNG")
print("  ✓ glorov-app-icon.png created")

# ==============================================================================
# 2. DESKTOP FEATURED BANNER (2520x1080, 21:9)
# ==============================================================================
print("Creating Desktop Featured Banner (2520x1080, 21:9)...")
W, H = 2520, 1080
desk_img = Image.new("RGBA", (W, H), (10, 19, 15, 255))
desk_draw = ImageDraw.Draw(desk_img)

# Deep green gradient background
for y in range(H):
    t = y / (H - 1)
    # radial effect simulation
    r = int(10 + (22 - 10) * t)
    g = int(22 + (45 - 22) * t)
    b = int(18 + (34 - 18) * t)
    desk_draw.line([(0, y), (W, y)], fill=(r, g, b))

# Ambient green decorative orbs
orb = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
orb_draw = ImageDraw.Draw(orb)
orb_draw.ellipse([100, 100, 1100, 1100], fill=(46, 125, 74, 55))
orb = orb.filter(ImageFilter.GaussianBlur(140))
desk_img.paste(orb, (-200, -200), orb)
desk_img.paste(orb, (1600, 100), orb)

# Text Content (Left side, x: 120 to 1100)
f_brand = ImageFont.truetype(FRAUNCES_BOLD, 72)
f_subbrand = ImageFont.truetype(JAKARTA_BOLD, 22)
f_title = ImageFont.truetype(FRAUNCES_BOLD, 64)
f_desc = ImageFont.truetype(JAKARTA_REG, 26)
f_pill = ImageFont.truetype(JAKARTA_BOLD, 20)

desk_draw.text((120, 140), "GLOROV", font=f_brand, fill=(247, 250, 248))
desk_draw.text((450, 178), "BOTANICAL COMMERCE MONOREPO", font=f_subbrand, fill=(52, 211, 153))

desk_draw.text((120, 280), "Enterprise-Grade\nIndian Seeds & Live Plants\nE-Commerce Platform", font=f_title, fill=(255, 255, 255), spacing=18)

desc_text = (
    "Production-audited monorepo built with Next.js 15, Medusa v2 headless engine,\n"
    "Redis sliding-window rate limiting, and turnkey Indian payments & courier logistics.\n"
    "Architected with zero runtime compromises and 624 verified automated tests."
)
desk_draw.text((120, 540), desc_text, font=f_desc, fill=(180, 205, 190), spacing=12)

# Technology Badges
curr_x = 120
y_pills = 740
badges_row1 = [
    ("⚡ Next.js 15 App Router", (26, 54, 42), (230, 255, 240), (52, 211, 153)),
    ("🌿 Medusa v2 Headless", (26, 54, 42), (230, 255, 240), (52, 211, 153)),
    ("💳 Razorpay UPI & Cards", (26, 54, 42), (230, 255, 240), (52, 211, 153)),
    ("📦 Shiprocket Live Tracking", (26, 54, 42), (230, 255, 240), (52, 211, 153)),
]
for text, bg, fg, border in badges_row1:
    curr_x = draw_pill(desk_draw, (curr_x, y_pills), text, f_pill, bg, fg, border, padding=(20, 10)) + 18

curr_x = 120
y_pills_2 = 820
badges_row2 = [
    ("🛡️ Zero-Defect Production Audit", (20, 42, 32), (180, 220, 195), (46, 125, 74)),
    ("🚀 624 Unit Tests Passed", (20, 42, 32), (180, 220, 195), (46, 125, 74)),
    ("🌐 Multi-Domain: glorov.com & admin.glorov.com", (20, 42, 32), (180, 220, 195), (46, 125, 74)),
]
for text, bg, fg, border in badges_row2:
    curr_x = draw_pill(desk_draw, (curr_x, y_pills_2), text, f_pill, bg, fg, border, padding=(20, 10)) + 18

# Live Desktop Mockup (Right side, framed window)
if os.path.exists("screenshots/live_desktop_home.png"):
    live_home = Image.open("screenshots/live_desktop_home.png").convert("RGBA")
    # Target frame size in banner: width 1180, height 780
    mw, mh = 1180, 780
    header_h = 44
    content_h = mh - header_h
    
    # Scale crop live screenshot to content_h
    scale_w = mw
    scale_h = int(live_home.height * (scale_w / live_home.width))
    live_resized = live_home.resize((scale_w, scale_h), Image.Resampling.LANCZOS)
    live_cropped = live_resized.crop((0, 0, mw, content_h))
    
    # Create window frame
    window = Image.new("RGBA", (mw, mh), (24, 38, 30, 255))
    w_draw = ImageDraw.Draw(window)
    w_draw.rounded_rectangle([0, 0, mw - 1, mh - 1], radius=18, fill=(18, 30, 24, 255), outline=(52, 211, 153, 90), width=2)
    # Header bar
    w_draw.rounded_rectangle([0, 0, mw - 1, header_h + 10], radius=18, fill=(28, 46, 36, 255))
    w_draw.rectangle([0, header_h, mw - 1, header_h + 10], fill=(28, 46, 36, 255))
    # Traffic light dots
    w_draw.ellipse([20, 14, 34, 28], fill=(255, 95, 86))
    w_draw.ellipse([42, 14, 56, 28], fill=(255, 189, 46))
    w_draw.ellipse([64, 14, 78, 28], fill=(39, 201, 63))
    # URL bar
    w_draw.rounded_rectangle([110, 8, mw - 110, 36], radius=8, fill=(15, 26, 20, 255))
    f_url = ImageFont.truetype(JAKARTA_MEDIUM, 14)
    w_draw.text((mw // 2 - 90, 13), "🔒 https://www.glorov.com", font=f_url, fill=(160, 190, 175))
    
    # Paste content inside window
    window.paste(live_cropped, (0, header_h))
    
    # Window drop shadow
    shadow = Image.new("RGBA", (mw + 80, mh + 80), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([40, 40, mw + 40, mh + 40], radius=24, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    
    desk_img.paste(shadow, (1220 - 40, 150 - 40), shadow)
    desk_img.paste(window, (1220, 150), window)

desk_img.save(os.path.join(OUTPUT_DIR, "glorov-desktop-banner-21x9.png"), "PNG")
print("  ✓ glorov-desktop-banner-21x9.png created")

# ==============================================================================
# 3. MOBILE FEATURED BANNER (1080x1440, 3:4)
# ==============================================================================
print("Creating Mobile Featured Banner (1080x1440, 3:4)...")
MW, MH = 1080, 1440
mob_img = Image.new("RGBA", (MW, MH), (12, 24, 18, 255))
mob_draw = ImageDraw.Draw(mob_img)

# Vertical lush green gradient
for y in range(MH):
    t = y / (MH - 1)
    r = int(12 + (20 - 12) * t)
    g = int(24 + (48 - 24) * t)
    b = int(18 + (32 - 18) * t)
    mob_draw.line([(0, y), (MW, y)], fill=(r, g, b))

# Header branding
f_mob_title = ImageFont.truetype(FRAUNCES_BOLD, 52)
f_mob_sub = ImageFont.truetype(JAKARTA_BOLD, 18)
f_mob_desc = ImageFont.truetype(JAKARTA_REG, 22)

mob_draw.text((80, 80), "GLOROV", font=f_mob_title, fill=(255, 255, 255))
mob_draw.text((80, 148), "PREMIUM BOTANICAL COMMERCE", font=f_mob_sub, fill=(52, 211, 153))

mob_desc_text = "Native Indian Seeds & Live Plants • 1-Click UPI & COD • Direct Nursery Delivery"
mob_draw.text((80, 195), mob_desc_text, font=f_mob_desc, fill=(185, 215, 195))

# Tags row
curr_x = 80
draw_pill(mob_draw, (curr_x, 250), "🌱 Certified Heirloom Seeds", f_pill, (24, 52, 38), (230, 255, 240), (52, 211, 153), padding=(16, 8))
draw_pill(mob_draw, (curr_x + 340, 250), "🪴 Pune Central Nursery Hub", f_pill, (24, 52, 38), (230, 255, 240), (52, 211, 153), padding=(16, 8))

# Smartphone device mockup in center/bottom
if os.path.exists("screenshots/live_mobile_home.png"):
    live_mob = Image.open("screenshots/live_mobile_home.png").convert("RGBA")
    # Frame width 520, height 1040
    pw, ph = 520, 1040
    bezel = 16
    notch_h = 32
    
    sw = pw - bezel * 2
    sh = ph - bezel * 2
    
    # Scale mobile screen
    scale_factor = sw / live_mob.width
    sh_scaled = int(live_mob.height * scale_factor)
    mob_resized = live_mob.resize((sw, sh_scaled), Image.Resampling.LANCZOS)
    mob_cropped = mob_resized.crop((0, 0, sw, sh))
    
    # Phone body
    phone = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(phone)
    p_draw.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=48, fill=(14, 22, 18, 255), outline=(60, 95, 75, 255), width=4)
    # Screen background
    p_draw.rounded_rectangle([bezel, bezel, pw - bezel, ph - bezel], radius=36, fill=(255, 255, 255, 255))
    
    # Dynamic Island / Notch
    p_draw.rounded_rectangle([pw // 2 - 60, bezel + 8, pw // 2 + 60, bezel + 32], radius=12, fill=(10, 16, 12, 255))
    
    # Paste live mobile feed
    phone.paste(mob_cropped, (bezel, bezel))
    # Re-draw Dynamic Island on top of content
    p_draw.rounded_rectangle([pw // 2 - 50, bezel + 8, pw // 2 + 50, bezel + 30], radius=11, fill=(10, 16, 12, 255))
    p_draw.ellipse([pw // 2 + 25, bezel + 14, pw // 2 + 37, bezel + 26], fill=(25, 45, 35, 255)) # camera lens
    
    # Phone drop shadow
    p_shadow = Image.new("RGBA", (pw + 80, ph + 80), (0, 0, 0, 0))
    ps_draw = ImageDraw.Draw(p_shadow)
    ps_draw.rounded_rectangle([40, 40, pw + 40, ph + 40], radius=56, fill=(0, 0, 0, 180))
    p_shadow = p_shadow.filter(ImageFilter.GaussianBlur(32))
    
    pos_x = (MW - pw) // 2
    pos_y = 330
    mob_img.paste(p_shadow, (pos_x - 40, pos_y - 40), p_shadow)
    mob_img.paste(phone, (pos_x, pos_y), phone)

mob_img.save(os.path.join(OUTPUT_DIR, "glorov-mobile-banner-3x4.png"), "PNG")
print("  ✓ glorov-mobile-banner-3x4.png created")

# ==============================================================================
# 4. UPDATE / CHANGELOG COVER BANNER (1920x1080, 16:9)
# ==============================================================================
print("Creating Update / Changelog Cover Banner (1920x1080, 16:9)...")
UW, UH = 1920, 1080
up_img = Image.new("RGBA", (UW, UH), (10, 18, 14, 255))
up_draw = ImageDraw.Draw(up_img)

# Linear gradient
for y in range(UH):
    t = y / (UH - 1)
    r = int(10 + (24 - 10) * t)
    g = int(18 + (46 - 18) * t)
    b = int(14 + (30 - 14) * t)
    up_draw.line([(0, y), (UW, y)], fill=(r, g, b))

# Ambient lighting
up_img.paste(orb, (700, -200), orb)

# Release pill
f_up_pill = ImageFont.truetype(JAKARTA_BOLD, 18)
draw_pill(up_draw, (120, 120), "🚀 OFFICIAL RELEASE ANNOUNCEMENT • v1.0.0", f_up_pill, (24, 60, 42), (52, 211, 153), (52, 211, 153), padding=(22, 10))

# Title
f_up_title = ImageFont.truetype(FRAUNCES_BOLD, 68)
up_draw.text((120, 200), "GLOROV: Enterprise-Grade\nIndian Botanical Commerce\nMonorepo Goes Live", font=f_up_title, fill=(255, 255, 255), spacing=20)

# Subtitle
f_up_sub = ImageFont.truetype(JAKARTA_REG, 28)
up_sub_text = (
    "A full-stack case study in building modern e-commerce with Next.js 15, Medusa v2,\n"
    "Redis sliding-window rate limiting, Razorpay webhook signing, and Shiprocket."
)
up_draw.text((120, 470), up_sub_text, font=f_up_sub, fill=(185, 215, 195), spacing=14)

# Key metric boxes across the bottom
metrics = [
    ("624 / 624", "Automated Tests Passed", "100% Pass Rate Across Monorepo"),
    ("< 100 ms", "API Gateway Latency", "Redis Sliding-Window Rate Limited"),
    ("103 kB", "Storefront First Load JS", "Optimized Next.js 15 App Router"),
    ("Zero-Downtime", "PM2 Release Engine", "PostgreSQL Session Pool on Azure"),
]

m_start_x = 120
m_y = 680
m_w = 390
m_h = 240
f_m_val = ImageFont.truetype(FRAUNCES_BOLD, 46)
f_m_lbl = ImageFont.truetype(JAKARTA_BOLD, 20)
f_m_sub = ImageFont.truetype(JAKARTA_REG, 16)

for i, (val, lbl, sub) in enumerate(metrics):
    mx = m_start_x + i * (m_w + 35)
    up_draw.rounded_rectangle([mx, m_y, mx + m_w, m_y + m_h], radius=20, fill=(16, 32, 24, 220), outline=(52, 211, 153, 90), width=2)
    up_draw.text((mx + 30, m_y + 35), val, font=f_m_val, fill=(52, 211, 153))
    up_draw.text((mx + 30, m_y + 115), lbl, font=f_m_lbl, fill=(245, 250, 246))
    up_draw.text((mx + 30, m_y + 160), sub, font=f_m_sub, fill=(160, 190, 175))

up_img.save(os.path.join(OUTPUT_DIR, "glorov-update-cover-16x9.png"), "PNG")
print("  ✓ glorov-update-cover-16x9.png created")

print("All ElseSourav showcase media assets generated successfully in docs/elsesourav-publish/!")
