import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sharp = require('../apps/storefront/node_modules/sharp')
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('artifacts/visual-diff', { recursive: true })

async function analyze() {
  console.log('Analyzing Ugaoo Ref vs GLOROV at 1920x1080...')

  // Let's create a side-by-side composite of top 1080px of both
  const ref = sharp('artifacts/ugaoo-reference/homepage/desktop-1920x1080.png')
  const glr = sharp('artifacts/redesigned-homepage/redesigned-home-desktop-1920x1080.png')

  // Resize both to 960x540 and join them side by side
  const refSmall = await ref.resize(960, 540).toBuffer()
  const glrSmall = await glr.resize(960, 540).toBuffer()

  const sideBySide = await sharp({
    create: {
      width: 1920,
      height: 540,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: refSmall, left: 0, top: 0 },
    { input: glrSmall, left: 960, top: 0 }
  ])
  .png()
  .toFile('artifacts/visual-diff/side-by-side-1920x1080.png')

  console.log('Saved side-by-side: artifacts/visual-diff/side-by-side-1920x1080.png')

  // Also do mobile 390x844
  const refMob = sharp('artifacts/ugaoo-reference/homepage/mobile-390x844.png')
  const glrMob = sharp('artifacts/redesigned-homepage/redesigned-home-mobile-390x844.png')

  const refMobBuf = await refMob.toBuffer()
  const glrMobBuf = await glrMob.toBuffer()

  await sharp({
    create: {
      width: 780,
      height: 844,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: refMobBuf, left: 0, top: 0 },
    { input: glrMobBuf, left: 390, top: 0 }
  ])
  .png()
  .toFile('artifacts/visual-diff/side-by-side-mobile-390x844.png')

  console.log('Saved mobile side-by-side: artifacts/visual-diff/side-by-side-mobile-390x844.png')
}

analyze().catch(console.error)
