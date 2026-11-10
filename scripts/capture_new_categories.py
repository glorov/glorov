import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--hide-scrollbars")

ARTIFACT_DIR = "/Users/sourav/.gemini/antigravity/brain/afd73fb9-1344-4f73-898b-464892a5ba9d/category-verification"
LOCAL_DIR = "/Users/sourav/Developer/WEB/top-projects/glorov/screenshots/category-page-compare"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(LOCAL_DIR, exist_ok=True)

def save_both(driver, filename):
    time.sleep(2)
    p1 = os.path.join(ARTIFACT_DIR, filename)
    p2 = os.path.join(LOCAL_DIR, filename)
    driver.save_screenshot(p1)
    driver.save_screenshot(p2)
    print(f"Saved: {filename}")

def capture():
    driver = webdriver.Chrome(options=chrome_options)
    try:
        # 1. Desktop 1280x800 Standard Viewport
        driver.set_window_size(1280, 800)
        driver.get("http://127.0.0.1:3001/categories")
        save_both(driver, "desktop_1280x800_standard.png")

        # 2. Desktop 1280x1400 Complete Card Overview
        driver.set_window_size(1280, 1400)
        driver.get("http://127.0.0.1:3001/categories")
        save_both(driver, "desktop_1280x1400_cards.png")

        # 3. Desktop 1280x1400 Seeds Showcase View
        driver.get("http://127.0.0.1:3001/categories?handle=seeds")
        save_both(driver, "desktop_1280x1400_seeds_showcase.png")

        # 4. Tablet 768x1024
        driver.set_window_size(768, 1024)
        driver.get("http://127.0.0.1:3001/categories")
        save_both(driver, "tablet_768x1024.png")

        # 5. Mobile 350x750 Rail View
        driver.set_window_size(350, 750)
        driver.get("http://127.0.0.1:3001/categories")
        save_both(driver, "mobile_350x750_rail.png")

        # 6. Mobile 350x750 Feed View
        try:
            buttons = driver.find_elements(By.TAG_NAME, "button")
            feed_btn = None
            for b in buttons:
                if "Feed" in b.text:
                    feed_btn = b
                    break
            if feed_btn:
                feed_btn.click()
                time.sleep(1)
                save_both(driver, "mobile_350x750_feed.png")
        except Exception as e:
            print(f"Error feed button: {e}")

        # 7. Mobile 350x750 Seeds Selected
        driver.get("http://127.0.0.1:3001/categories?handle=seeds")
        save_both(driver, "mobile_350x750_seeds_rail.png")

    finally:
        driver.quit()

if __name__ == "__main__":
    capture()
