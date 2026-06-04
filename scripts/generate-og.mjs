// Generates the static Open Graph card (1200×630) as public/og.png.
// We render the exact brand design in headless Chromium and screenshot it —
// reliable, pixel-perfect, and zero runtime dependency (unlike next/og on the
// Edge runtime, which times out fetching a default font).
//
// Run: node scripts/generate-og.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'og.png');

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  .card {
    width: 1200px; height: 630px; padding: 72px;
    display: flex; flex-direction: column;
    background: linear-gradient(135deg, #6d4ee0 0%, #d04ad6 50%, #ee7a4d 100%);
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .mark {
    width: 64px; height: 64px; border-radius: 16px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 30px; position: relative;
  }
  .mark sup { position: absolute; top: 12px; right: 14px; font-size: 18px; }
  .brand-name { font-size: 30px; font-weight: 600; letter-spacing: -0.5px; }
  .center { margin-top: auto; margin-bottom: auto; }
  .headline { font-size: 100px; font-weight: 700; line-height: 1; letter-spacing: -3px; max-width: 1000px; }
  .headline .dim { opacity: 0.85; }
  .sub { margin-top: 32px; font-size: 32px; opacity: 0.85; max-width: 900px; }
  .url { font-size: 24px; opacity: 0.9; }
</style></head>
<body>
  <div class="card">
    <div class="brand">
      <div class="mark">Q<sup>2</sup></div>
      <div class="brand-name">Quadratic Vote</div>
    </div>
    <div class="center">
      <div class="headline">Vote with <span class="dim">how much</span> you care.</div>
      <div class="sub">Quadratic voting for everyone. No signup. No wallet.</div>
    </div>
    <div class="url">quadratic-voting.com</div>
  </div>
</body></html>`;

// 1200×630 @1x is the OG standard — keeps the file small (~100-200KB) so
// WhatsApp / iMessage don't reject it for size and fall back to a generic
// icon. deviceScaleFactor:2 produced a 1.2MB file that WhatsApp dropped.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.locator('.card').screenshot({ path: out });
await browser.close();
console.log('Wrote', out);
