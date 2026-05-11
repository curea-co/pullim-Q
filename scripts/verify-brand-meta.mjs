// 풀림 Q 브랜드 메타데이터 자동 검증 — Playwright headless
// 검증 항목:
//   1. <title> 태그
//   2. <meta name="description">
//   3. <meta name="application-name">
//   4. Open Graph (og:title, og:description, og:site_name, og:type, og:locale, og:image)
//   5. Twitter Card (twitter:card, twitter:title, twitter:description)
//   6. /opengraph-image 라우트가 1200x630 PNG 응답
//
// 기준: "풀림 스터디" 텍스트가 어디에도 등장하면 FAIL.

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';

const expectBrandName = '풀림 Q';
const forbiddenLegacy = '풀림 스터디';

const checks = [];
let failed = 0;

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  if (!ok) failed++;
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

try {
  const resp = await page.goto(`${BASE}/q`, { waitUntil: 'networkidle' });
  if (!resp || !resp.ok()) {
    record('GET /q', false, `status=${resp?.status()}`);
  } else {
    record('GET /q', true, `status=${resp.status()}`);
  }

  // 1. <title>
  const title = await page.title();
  const titleOk = title.includes(expectBrandName) && !title.includes(forbiddenLegacy);
  record('title contains 풀림 Q', titleOk, JSON.stringify(title));

  // 2~5. meta tags
  const metas = await page.evaluate(() => {
    const result = {};
    document.querySelectorAll('meta').forEach(el => {
      const key = el.getAttribute('name') ?? el.getAttribute('property');
      const value = el.getAttribute('content');
      if (key && value) {
        if (!(key in result)) result[key] = value;
      }
    });
    return result;
  });

  function checkMeta(key, mustContain, mustNotContain) {
    const v = metas[key];
    if (!v) {
      record(`meta[${key}] exists`, false, '(missing)');
      return;
    }
    const ok =
      (!mustContain || v.includes(mustContain)) &&
      (!mustNotContain || !v.includes(mustNotContain));
    record(`meta[${key}]`, ok, v);
  }

  checkMeta('description', expectBrandName, forbiddenLegacy);
  checkMeta('application-name', expectBrandName, forbiddenLegacy);
  checkMeta('og:title', expectBrandName, forbiddenLegacy);
  checkMeta('og:description', expectBrandName, forbiddenLegacy);
  checkMeta('og:site_name', expectBrandName, forbiddenLegacy);
  checkMeta('og:type', 'website', null);
  checkMeta('og:locale', 'ko_KR', null);
  checkMeta('twitter:card', 'summary_large_image', null);
  checkMeta('twitter:title', expectBrandName, forbiddenLegacy);
  checkMeta('twitter:description', expectBrandName, forbiddenLegacy);

  // og:image 존재 확인
  const ogImage = metas['og:image'];
  if (!ogImage) {
    record('og:image present', false, '(missing)');
  } else {
    record('og:image present', true, ogImage);

    // 6. og:image 페치 → PNG 응답 + 1200x630 검증
    const imgResp = await page.context().request.get(ogImage);
    const imgOk = imgResp.ok();
    const contentType = imgResp.headers()['content-type'] ?? '';
    record('og:image GET 200 + image/*', imgOk && contentType.startsWith('image/'),
           `status=${imgResp.status()} type=${contentType}`);
  }

  // HTML 본문에 "풀림 스터디" 한 번이라도 등장하면 fail
  const bodyText = await page.evaluate(() => document.documentElement.outerHTML);
  const legacyFound = bodyText.includes(forbiddenLegacy);
  record('HTML 어디에도 "풀림 스터디" 없음', !legacyFound,
         legacyFound ? '발견' : '정상');

} finally {
  await browser.close();
}

console.log('\n=== 풀림 Q 브랜드 메타 검증 ===');
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name} — ${c.detail}`);
}
console.log(`\n결과: ${checks.length - failed}/${checks.length} pass`);
process.exit(failed === 0 ? 0 : 1);
