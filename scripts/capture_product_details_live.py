import os, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

ARTIFACT_DIR = '/Users/sourav/.gemini/antigravity/brain/b708c725-e31a-4d7f-8781-ee99c33a8589'

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1440,1200')
options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

driver = webdriver.Chrome(options=options)

try:
    print('Logging in...')
    driver.get('https://glorova.web.app/login')
    time.sleep(3)
    inputs = driver.find_elements(By.TAG_NAME, 'input')
    if len(inputs) >= 2:
        inputs[0].send_keys('admin@glorov.in')
        inputs[1].send_keys('SuperSecretPassword123!')
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for b in buttons:
            if any(t in b.text.lower() for t in ['continue', 'sign in', 'log in']):
                b.click()
                break
        time.sleep(5)

    # 1. Watermelon Details
    print('Watermelon...')
    driver.get('https://glorova.web.app/products/prod_01M6ASZ0FHBB622EDZWZSZP74S')
    time.sleep(6)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'admin_watermelon_details_live.png'))

    # 2. Cucumber Details
    print('Cucumber...')
    driver.get('https://glorova.web.app/products/prod_01M6ASZBYX2H6XYKQ61MD097P5')
    time.sleep(6)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'admin_cucumber_details_live.png'))

    # 3. Brinjal Details
    print('Brinjal...')
    driver.get('https://glorova.web.app/products/prod_01M6ASXHBRP7W0YY3XEW0YRNKT')
    time.sleep(6)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'admin_brinjal_details_live.png'))

    # 4. Basil Details
    print('Basil...')
    driver.get('https://glorova.web.app/products/prod_01M6AT20RAVNZ4VGH04R9Y8P4D')
    time.sleep(6)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'admin_basil_details_live.png'))

    print('Done!')
finally:
    driver.quit()
