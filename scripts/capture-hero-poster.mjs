/**
 * Capture the hero poster frames from the live Three.js scene so the poster → canvas crossfade is seamless.
 *
 * Usage (with the dev server on :3000 and Chrome installed):
 *   npm i --no-save puppeteer-core
 *   CHROME=/usr/bin/google-chrome node scripts/capture-hero-poster.mjs http://localhost:3000/
 */
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const base = process.argv[2] || 'http://localhost:3000/'
const chrome = process.env.CHROME || '/usr/bin/google-chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const targets = [
  { file: 'poster.webp', width: 1920, height: 1080, scale: 1, mobile: false },
  { file: 'poster-mobile.webp', width: 390, height: 844, scale: 2, mobile: true },
]

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
try {
  for (const t of targets) {
    const page = await browser.newPage()
    await page.setViewport({ width: t.width, height: t.height, deviceScaleFactor: t.scale, isMobile: t.mobile, hasTouch: t.mobile })
    await page.goto(base, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForFunction(() => document.querySelector('canvas[data-draw-calls]'), { timeout: 120000 })
    await page.evaluate(() => {
      document.querySelectorAll('.cinematic-sticky > :not(canvas), header').forEach((el) => (el.style.visibility = 'hidden'))
    })
    await sleep(3000)
    const out = path.join(process.env.OUT_DIR || path.join(root, 'public', 'hero'), t.file)
    await page.screenshot({ path: out, type: 'webp', quality: 78 })
    console.log('wrote', out)
    await page.close()
  }
} finally {
  await browser.close()
}
