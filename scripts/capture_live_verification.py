import os, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/b708c725-e31a-4d7f-8781-ee99c33a8589'

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1440,1050')
options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

driver = webdriver.Chrome(options=options)

try:
    print('1. Logging in to Medusa Admin at https://glorova.web.app/login ...')
    driver.get('https://glorova.web.app/login')
    time.sleep(3)
    inputs = driver.find_elements(By.TAG_NAME, 'input')
    if len(inputs) >= 2:
        inputs[0].clear()
        inputs[0].send_keys('admin@glorov.in')
        inputs[1].clear()
        inputs[1].send_keys('SuperSecretPassword123!')
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for b in buttons:
            if any(t in b.text.lower() for t in ['continue', 'sign in', 'log in']):
                b.click()
                break
        time.sleep(5)
    print('Logged in! URL:', driver.current_url)

    # 1. Admin Products List Screenshot
    print('2. Navigating to https://glorova.web.app/products ...')
    driver.get('https://glorova.web.app/products')
    time.sleep(5)
    admin_products_path = os.path.join(ARTIFACT_DIR, 'admin_products_verified.png')
    driver.save_screenshot(admin_products_path)
    print(f'✅ Saved {admin_products_path}')

    # 2. Watermelon Details
    print('3. Navigating to Watermelon details...')
    # Check if we can find the link or navigate by URL
    driver.get('https://glorova.web.app/products/prod_01M6A7MFHEBW0EVBRQ2QA3EWKT')
    time.sleep(5)
    wm_path = os.path.join(ARTIFACT_DIR, 'admin_watermelon_verified.png')
    driver.save_screenshot(wm_path)
    print(f'✅ Saved {wm_path}')

    # 3. Brinjal Details
    print('4. Navigating to Brinjal details...')
    driver.get('https://glorova.web.app/products/prod_01M6A7MF2CXVZZPAMFXM4K4QD1')
    time.sleep(5)
    brinjal_path = os.path.join(ARTIFACT_DIR, 'admin_brinjal_verified.png')
    driver.save_screenshot(brinjal_path)
    print(f'✅ Saved {brinjal_path}')

    # 4. Tomato Details
    print('5. Navigating to Tomato details...')
    driver.get('https://glorova.web.app/products/prod_glr_tomato_vegetable_seeds')
    time.sleep(5)
    tomato_path = os.path.join(ARTIFACT_DIR, 'admin_tomato_verified.png')
    driver.save_screenshot(tomato_path)
    print(f'✅ Saved {tomato_path}')

    # 5. Storefront Seeds Page
    print('6. Navigating to Storefront at https://glorovs.web.app/categories/seeds ...')
    driver.get('https://glorovs.web.app/categories/seeds')
    time.sleep(6)
    storefront_path = os.path.join(ARTIFACT_DIR, 'storefront_seeds_verified.png')
    driver.save_screenshot(storefront_path)
    print(f'✅ Saved {storefront_path}')

finally:
    driver.quit()

print('🎉 All verification screenshots captured successfully!')
