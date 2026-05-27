// 풀림 Q — F-2 모바일 카드 밀도 캡처 (Playwright)
//
// 모바일 360×740 emulation × 3 라우트 = 3 캡처.
// 저장 경로: proc/research/2026-05-14_f2-mobile-density/captures-before/{name}.png
//
// plan: proc/plan/2026-05-14_q-f2-mobile-card-density.md §3
// 사용: bun dev 띄운 상태(port 3031)에서 `node scripts/qa-f2-mobile-density.mjs`

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const OUT_DIR = path.resolve(
  process.env.SHOTS_DIR ?? 'proc/research/2026-05-14_f2-mobile-density/captures-before',
);
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 360, height: 740 };

const targets = [
  { name: 'infinity-solve', path: '/q/infinity/solve' },
  { name: 'review',         path: '/q/review' },
  { name: 'review-conquer', path: '/q/review/conquer' },
];

const results = [];
let failed = 0;

const browser = await chromium.launch();

try {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  for (const t of targets) {
    const file = path.join(OUT_DIR, `${t.name}-360.png`);
    const url = `${BASE}${t.path}`;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp?.status() ?? 0;
      if (status >= 400) throw new Error(`HTTP ${status}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      await page.screenshot({ path: file, fullPage: true });
      results.push({ name: t.name, ok: true, file });
      console.log(`✓ ${t.name} — ${file}`);
    } catch (err) {
      results.push({ name: t.name, ok: false, error: err.message });
      failed++;
      console.log(`✗ ${t.name} — ${err.message}`);
      await page.screenshot({ path: file, fullPage: true }).catch(() => {});
    }
  }

  await ctx.close();
} finally {
  await browser.close();
}

console.log(`\n${results.length - failed}/${results.length} ok`);
process.exit(failed > 0 ? 1 : 0);
