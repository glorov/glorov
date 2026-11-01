import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sharp = require('../apps/storefront/node_modules/sharp')

async function inspect() {
  const ref = sharp('artifacts/ugaoo-reference/homepage/desktop-1920x1080.png')
  const glr = sharp('artifacts/redesigned-homepage/redesigned-home-desktop-1920x1080.png')

  // Top 150px: Announcement Bar + Header
  await sharp('artifacts/ugaoo-reference/homepage/desktop-1920x1080.png').extract({ left: 0, top: 0, width: 1920, height: 160 }).png().toFile('artifacts/visual-diff/ref-header.png')
  await sharp('artifacts/redesigned-homepage/redesigned-home-desktop-1920x1080.png').extract({ left: 0, top: 0, width: 1920, height: 160 }).png().toFile('artifacts/visual-diff/glr-header.png')

  // Top 160 to 760: Hero section
  await sharp('artifacts/ugaoo-reference/homepage/desktop-1920x1080.png').extract({ left: 0, top: 160, width: 1920, height: 600 }).png().toFile('artifacts/visual-diff/ref-hero.png')
  await sharp('artifacts/redesigned-homepage/redesigned-home-desktop-1920x1080.png').extract({ left: 0, top: 160, width: 1920, height: 600 }).png().toFile('artifacts/visual-diff/glr-hero.png')

  // 760 to 1080: Next section (Categories or Badges)
  await sharp('artifacts/ugaoo-reference/homepage/desktop-1920x1080.png').extract({ left: 0, top: 760, width: 1920, height: 320 }).png().toFile('artifacts/visual-diff/ref-below.png')
  await sharp('artifacts/redesigned-homepage/redesigned-home-desktop-1920x1080.png').extract({ left: 0, top: 760, width: 1920, height: 320 }).png().toFile('artifacts/visual-diff/glr-below.png')

  console.log('Saved crops for header, hero, and below!')
}

inspect().catch(console.error)
