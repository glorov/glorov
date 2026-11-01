import { readFileSync } from 'node:fs'

const html = readFileSync('artifacts/wayback-ugaoo-20260731.html', 'utf8')

console.log('=== ANNOUNCEMENT SLIDES ===')
const slides = [...html.matchAll(/class="announcement-slider__slide"[^>]*>([\s\S]*?)<\/div>/gi)]
for (const s of slides) {
  const text = s[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  console.log('-', text)
}

console.log('\n=== OUR CATEGORIES CIRCLES ===')
const catItems = [...html.matchAll(/<a[^>]+class="category-item"[^>]*>([\s\S]*?)<\/a>/gi)]
for (const c of catItems) {
  const labelMatch = c[1].match(/class="category-item__label">([^<]+)<\/span>/i)
  const imgMatch = c[1].match(/src="([^"]+)"/i)
  console.log('-', labelMatch ? labelMatch[1].trim() : 'Unknown', '->', imgMatch ? imgMatch[1] : 'No img')
}

console.log('\n=== UGAOO VS THE REST / COMPARISON ===')
const compSection = html.match(/Ugaoo vs the Rest[\s\S]*?<\/section>/i)
if (compSection) {
  const text = compSection[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  console.log(text.substring(0, 500))
} else {
  console.log('No direct section tag, searching for comparison items:')
  const vsMatches = [...html.matchAll(/vs[ -]the[ -]rest|comparison|why-choose/gi)]
  console.log('Matches:', vsMatches.length)
}

console.log('\n=== HERO / BANNER SECTION ===')
const heroMatch = html.match(/class="[^"]*slideshow[^"]*"[\s\S]*?<\/slideshow-component>/i) || html.match(/id="[^"]*slideshow[^"]*"[\s\S]*?<\/div>/i)
if (heroMatch) {
  console.log(heroMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 400))
} else {
  const mainBanners = [...html.matchAll(/class="[^"]*(?:banner|hero)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
  console.log('Main banners found:', mainBanners.length)
  mainBanners.slice(0, 3).forEach((b) => console.log(b[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()))
}
