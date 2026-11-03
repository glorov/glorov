import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--hide-scrollbars")

ARTIFACT_DIR = "/Users/sourav/.gemini/antigravity/brain/4e703b51-68d4-4333-9153-00c5b17f2998"

def capture():
    driver = webdriver.Chrome(options=chrome_options)
    try:
        # 1. Desktop Offers Page
        driver.set_window_size(1280, 950)
        driver.get("http://localhost:3000/offers")
        time.sleep(2)
        driver.save_screenshot(f"{ARTIFACT_DIR}/offers-roadmap-desktop.png")
        print("Captured offers-roadmap-desktop.png")

        # 2. Mobile Offers Page
        driver.set_window_size(390, 844)
        driver.get("http://localhost:3000/offers")
        time.sleep(2)
        driver.save_screenshot(f"{ARTIFACT_DIR}/offers-roadmap-mobile.png")
        print("Captured offers-roadmap-mobile.png")

        # 3. Desktop Cart Page (with simulated items)
        driver.set_window_size(1280, 950)
        driver.get("http://localhost:3000/cart")
        time.sleep(2)
        driver.save_screenshot(f"{ARTIFACT_DIR}/cart-roadmap-desktop.png")
        print("Captured cart-roadmap-desktop.png")

        # 4. Mobile Cart Page
        driver.set_window_size(390, 844)
        driver.get("http://localhost:3000/cart")
        time.sleep(2)
        driver.save_screenshot(f"{ARTIFACT_DIR}/cart-roadmap-mobile.png")
        print("Captured cart-roadmap-mobile.png")

    finally:
        driver.quit()

if __name__ == "__main__":
    capture()
