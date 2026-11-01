import { writeFileSync } from 'node:fs'

async function inspectWayback() {
  const url = 'https://web.archive.org/web/20260731125422/https://www.ugaoo.com/'
  console.log('Fetching', url)
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  const html = await res.text()
  console.log('HTML fetched. Length:', html.length)

  // Save html for fast offline inspection
  writeFileSync('artifacts/wayback-ugaoo-20260731.html', html)
  console.log('Saved artifacts/wayback-ugaoo-20260731.html')

  // Search for announcement bar
  const annMatch = html.match(/class="[^"]*announcement[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)
  console.log('\n--- ANNOUNCEMENT BARS ---')
  if (annMatch) {
    annMatch.slice(0, 5).forEach((m) => console.log(m.replace(/\s+/g, ' ').substring(0, 200)))
  }

  // Look for section titles / headings
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim()
  )
  console.log('\n--- H2 HEADINGS ---')
  console.log(h2s.filter(Boolean))

  // Look for category story / circles
  const storyMatches = [...html.matchAll(/class="[^"]*(?:story|category|collection)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|a|li)>/gi)]
  console.log('\n--- STORY / CATEGORY SAMPLES ---')
  storyMatches.slice(0, 5).forEach((m) => console.log(m[0].replace(/\s+/g, ' ').substring(0, 200)))

  // Look for banner images and links
  const bannerImages = [...html.matchAll(/<img[^>]+(?:banner|hero|desktop|slide)[^>]+>/gi)].map((m) =>
    m[0].replace(/\s+/g, ' ').substring(0, 250)
  )
  console.log('\n--- BANNER IMAGES ---')
  bannerImages.slice(0, 5).forEach((b) => console.log(b))
}

inspectWayback().catch(console.error)
