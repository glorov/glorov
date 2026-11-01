import sys
import os
import ssl
import urllib.request
from PIL import Image

ctx = ssl._create_unverified_context()

def download_and_crop(url_or_path, out_path, size=1000):
    try:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        temp_path = out_path + ".tmp"
        
        if url_or_path.startswith("http://") or url_or_path.startswith("https://"):
            req = urllib.request.Request(
                url_or_path, 
                headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            )
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp, open(temp_path, 'wb') as f:
                f.write(resp.read())
            img_path = temp_path
        else:
            img_path = url_or_path

        with Image.open(img_path) as img:
            img = img.convert('RGB')
            w, h = img.size
            min_dim = min(w, h)
            left = (w - min_dim) // 2
            top = (h - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            
            cropped = img.crop((left, top, right, bottom))
            resized = cropped.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(out_path, 'JPEG', quality=90, optimize=True)

        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        print(f"OK: {out_path}")
        return True
    except Exception as e:
        print(f"ERR: {out_path} -> {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: process_seed_images.py <src_url_or_path> <dest_path>")
        sys.exit(1)
    success = download_and_crop(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
