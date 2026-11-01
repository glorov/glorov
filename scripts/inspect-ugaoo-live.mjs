import { spawn } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const port = 9933
const userDataDir = `/tmp/glr-inspect-ugaoo-${Date.now()}`

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1440,900',
  `--remote-debugging-port=${port}`,
  '--remote-allow-origins=*',
  'about:blank',
])

async function main() {
  let target = null
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 300))
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json/list`)
      const pages = await listRes.json()
      target = pages.find((p) => p.type === 'page') || pages[0]
      if (target?.webSocketDebuggerUrl) break
    } catch {}
  }

  if (!target) {
    console.error('Failed to connect to Chrome')
    chrome.kill('SIGKILL')
    return
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 1
  const pending = new Map()

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) reject(data.error)
      else resolve(data.result)
    }
  }

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  }

  await new Promise((res) => { ws.onopen = res })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  })

  console.log('Navigating to https://www.ugaoo.com/ ...')
  await send('Page.navigate', { url: 'https://www.ugaoo.com/' })
  await new Promise((r) => setTimeout(r, 6000))

  const inspectionRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const getStyles = (el, props) => {
        if (!el) return null
        const cs = window.getComputedStyle(el)
        const res = {}
        for (const p of props) res[p] = cs[p]
        return res
      }

      // 1. Announcement Bar
      const annBar = document.querySelector('.announcement-bar, [class*="announcement"]')
      const annBarStyles = getStyles(annBar, ['backgroundColor', 'color', 'height', 'fontSize', 'fontWeight', 'padding', 'fontFamily'])
      const annBarText = annBar ? annBar.innerText.trim() : null

      // 2. Header
      const header = document.querySelector('header, .header, [class*="header-wrapper"]')
      const headerStyles = getStyles(header, ['backgroundColor', 'height', 'position', 'borderBottom'])

      // Nav Links
      const navLinks = Array.from(document.querySelectorAll('header nav a, .header__inline-menu a, [class*="menu"] a'))
        .slice(0, 15)
        .map(a => ({
          text: a.innerText.trim(),
          href: a.getAttribute('href'),
          styles: getStyles(a, ['fontSize', 'fontWeight', 'color', 'fontFamily', 'letterSpacing', 'textTransform'])
        }))

      // 3. Category Stories / Circles
      const categoryStories = Array.from(document.querySelectorAll('[class*="category"], [class*="story"], [class*="circle"], [class*="collection-list"]'))
      const circleImg = document.querySelector('img[class*="circle"], [class*="category"] img, .story-item img')
      const circleImgStyles = getStyles(circleImg, ['width', 'height', 'borderRadius', 'border'])

      // 4. Product Cards
      const productCard = document.querySelector('.product-card, .card-wrapper, [class*="product-card"], .grid__item .card')
      const cardStyles = getStyles(productCard, ['backgroundColor', 'borderRadius', 'boxShadow', 'border', 'padding', 'overflow'])

      const cardImg = productCard ? productCard.querySelector('img') : null
      const cardImgStyles = getStyles(cardImg, ['aspectRatio', 'objectFit', 'borderRadius'])

      const cardTitle = productCard ? productCard.querySelector('h3, .card__heading, [class*="title"]') : null
      const cardTitleStyles = getStyles(cardTitle, ['fontSize', 'fontWeight', 'fontFamily', 'color', 'lineHeight'])

      const cardPrice = productCard ? productCard.querySelector('.price, [class*="price"]') : null
      const cardPriceStyles = getStyles(cardPrice, ['fontSize', 'fontWeight', 'fontFamily', 'color'])

      const cardBtn = productCard ? productCard.querySelector('button, [class*="button"], [class*="atc"], .quick-add') : null
      const cardBtnStyles = getStyles(cardBtn, ['backgroundColor', 'color', 'borderRadius', 'height', 'padding', 'fontSize', 'fontWeight'])

      // 5. Sections on Homepage
      const sections = Array.from(document.querySelectorAll('main > section, #MainContent > section, [id^="shopify-section-"]'))
        .map(s => ({
          id: s.id,
          className: s.className,
          firstHeading: s.querySelector('h2, h1, h3')?.innerText?.trim()?.slice(0, 60)
        }))

      // 6. Footer
      const footer = document.querySelector('footer, .footer')
      const footerStyles = getStyles(footer, ['backgroundColor', 'color', 'padding'])

      return {
        title: document.title,
        annBar: { text: annBarText, styles: annBarStyles, html: annBar?.outerHTML?.slice(0, 500) },
        header: { styles: headerStyles, navLinks },
        categoryCircles: { imgStyles: circleImgStyles },
        productCard: { cardStyles, cardImgStyles, cardTitleStyles, cardPriceStyles, cardBtnStyles },
        sections,
        footer: { styles: footerStyles }
      }
    })()`,
    returnByValue: true,
  })

  console.log('Inspection Result:\n', JSON.stringify(inspectionRes.result?.value, null, 2))
  writeFileSync('artifacts/ugaoo-reference/ugaoo-live-inspection.json', JSON.stringify(inspectionRes.result?.value, null, 2))

  ws.close()
  chrome.kill('SIGKILL')
  rmSync(userDataDir, { recursive: true, force: true })
}

main().catch(console.error)
