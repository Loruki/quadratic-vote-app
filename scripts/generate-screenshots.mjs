// Captures clean shots of the LIVE site for the README case study.
// Uses real seeded data + the production domain, so the screenshots match
// what a visitor actually sees. Run: node scripts/generate-screenshots.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'docs', 'screenshots');
mkdirSync(outDir, { recursive: true });

const BASE = 'https://quadratic-voting.com';
// PM-skills public poll — 10 options, 38 voters of real seeded data.
const POLL = 'z4krfmo0ej2rkm0rlh1d9p85';

const browser = await chromium.launch();

async function shot(name, { path, width = 1280, height = 800, mobile = false, fullPage = false, prep } = {}) {
  const page = await browser.newPage({
    viewport: { width: mobile ? 390 : width, height: mobile ? 844 : height },
    deviceScaleFactor: 2,
  });
  // Pre-seed the voting-hint flag so the banner doesn't cover the mobile shot.
  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  if (prep) await prep(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, name), fullPage });
  await page.close();
  console.log('  ✓', name);
}

console.log('Capturing live screenshots…');
await shot('landing.png', { path: '/', height: 900 });
await shot('explore.png', { path: '/explore', height: 1000 });
await shot('vote-mobile.png', {
  path: `/poll/${POLL}`,
  mobile: true,
  prep: async (page) => {
    // Cast a few votes so the budget bar + costs are populated.
    const inc = page.getByRole('button', { name: /add a vote to/i });
    await inc.nth(0).click();
    await inc.nth(0).click();
    await inc.nth(0).click();
    await inc.nth(1).click();
    await inc.nth(1).click();
    await page.waitForTimeout(400);
  },
});
await shot('results.png', { path: `/poll/${POLL}/results`, height: 950 });
await shot('create.png', { path: '/create', height: 950 });

await browser.close();
console.log('Done →', outDir);
