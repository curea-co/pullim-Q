// Pullim Q — deeper private capture (real explain IDs, real solve flow)
import { chromium } from '/Users/curea/dev_git/pullim-Q/node_modules/playwright/index.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/pullim-audit/q/private';
const BASE = 'https://pullim-q.vercel.app';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

async function newPage(viewport) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    userAgent:
      viewport.width < 500
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

const results = { discovered: {}, captures: [] };

// --- 1) Crawl home → discover explain/solve real URLs from links
{
  const { ctx, page } = await newPage(desktop);
  await page.goto(`${BASE}/q`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const links = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && (h.includes('/q/') || h.startsWith('/q/')));
  });
  results.discovered.fromHome = [...new Set(links)];
  console.log('home links sample:', results.discovered.fromHome.slice(0, 15));
  await ctx.close();
}

// --- 2) Crawl /q/review → likely contains real explain IDs (오답 카드 → 해설)
{
  const { ctx, page } = await newPage(desktop);
  await page.goto(`${BASE}/q/review`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const links = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.includes('/q/'));
  });
  results.discovered.fromReview = [...new Set(links)];
  console.log('review links sample:', results.discovered.fromReview.slice(0, 15));
  await ctx.close();
}

// --- 3) Crawl /q/infinity hub → discover infinity routes
{
  const { ctx, page } = await newPage(desktop);
  await page.goto(`${BASE}/q/infinity`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const links = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href], button')]
      .map((a) => a.getAttribute('href') || '')
      .filter((h) => h && h.includes('/q/'));
  });
  results.discovered.fromInfinity = [...new Set(links)];
  console.log('infinity links sample:', results.discovered.fromInfinity.slice(0, 15));
  await ctx.close();
}

// --- 4) Try clicking into "연습 모드" then start a session, capture solve in flow
{
  const { ctx, page } = await newPage(desktop);
  await page.goto(`${BASE}/q/infinity/solve`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // click first concrete section row (미적분 / 독해)
  const rows = page.locator('button, a').filter({ hasText: /미적분|독해|확률|수열|영어/ });
  const rowCount = await rows.count();
  console.log('candidate solve-rows:', rowCount);
  if (rowCount > 0) {
    await rows.first().click({ timeout: 4000 }).catch((e) => console.log('row click err', e.message));
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: path.join(OUT, 'desktop-solve-realflow-fold.png'), fullPage: false });
  await page.screenshot({ path: path.join(OUT, 'desktop-solve-realflow-full.png'), fullPage: true });
  results.captures.push({ label: 'solve-realflow', url: page.url() });

  // try clicking first answer choice
  const choices = page.locator('button').filter({ hasText: /^[①②③④⑤1-5]/ });
  if ((await choices.count()) > 0) {
    await choices.first().click().catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'desktop-solve-choice-selected.png'), fullPage: false });
  }
  await ctx.close();
}

// mobile variant
{
  const { ctx, page } = await newPage(mobile);
  await page.goto(`${BASE}/q/infinity/solve`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const rows = page.locator('button, a').filter({ hasText: /미적분|독해|확률|수열|영어/ });
  if ((await rows.count()) > 0) {
    await rows.first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: path.join(OUT, 'mobile-solve-realflow-fold.png'), fullPage: false });
  await page.screenshot({ path: path.join(OUT, 'mobile-solve-realflow-full.png'), fullPage: true });
  await ctx.close();
}

// --- 5) capture exam-result page deeply
// --- 6) capture infinity-hub and onboarding scroll
// --- 7) FAB open on /q
{
  const { ctx, page } = await newPage(desktop);
  await page.goto(`${BASE}/q`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const fab = page.locator('button').filter({ hasText: /AI에게/ });
  if ((await fab.count()) > 0) {
    await fab.first().click().catch(() => {});
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(OUT, 'desktop-home-fab-clicked-fold.png'), fullPage: false });
  await page.screenshot({ path: path.join(OUT, 'desktop-home-fab-clicked-full.png'), fullPage: true });
  results.captures.push({ label: 'home-fab-clicked', url: page.url() });
  await ctx.close();
}

// --- 8) Test real explain URLs from discovered set
const allLinks = [
  ...(results.discovered.fromHome || []),
  ...(results.discovered.fromReview || []),
  ...(results.discovered.fromInfinity || []),
];
const explainUrls = [...new Set(allLinks.filter((u) => u.includes('/explain/')))].slice(0, 3);
console.log('explain URLs found:', explainUrls);
for (const [i, url] of explainUrls.entries()) {
  const full = url.startsWith('http') ? url : `${BASE}${url}`;
  const { ctx, page } = await newPage(desktop);
  await page.goto(full, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, `desktop-explain-real-${i}-fold.png`), fullPage: false });
  await page.screenshot({ path: path.join(OUT, `desktop-explain-real-${i}-full.png`), fullPage: true });
  // mobile
  await ctx.close();
  const { ctx: c2, page: p2 } = await newPage(mobile);
  await p2.goto(full, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await p2.waitForTimeout(2000);
  await p2.screenshot({ path: path.join(OUT, `mobile-explain-real-${i}-fold.png`), fullPage: false });
  await p2.screenshot({ path: path.join(OUT, `mobile-explain-real-${i}-full.png`), fullPage: true });
  await c2.close();
  results.captures.push({ label: `explain-real-${i}`, url: full });
}

await writeFile(path.join(OUT, 'discovered.json'), JSON.stringify(results, null, 2));
await browser.close();
console.log('DONE.');
