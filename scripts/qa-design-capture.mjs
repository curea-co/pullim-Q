// 풀림 Q — 디자인 audit 캡처 하네스 (Playwright)
//
// 6 페이지 × 2 viewport(desktop 1280 / mobile 390) = 12 캡처.
// 저장 경로: proc/research/2026-05-12_design-audit/captures/{page}-{viewport}.png
//
// plan: proc/plan/2026-05-12_q-design-followup.md §2.1
// 사용: bun dev 띄운 상태(port 3031)에서 `node scripts/qa-design-capture.mjs`

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const OUT_DIR = path.resolve(
  process.env.SHOTS_DIR ?? 'proc/research/2026-05-12_design-audit/captures',
);
fs.mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: 'home',    path: '/q' },
  { name: 'solve',   path: '/q/infinity/solve' },
  { name: 'analysis', path: '/q/analysis' },
  { name: 'review',  path: '/q/review' },
  { name: 'conquer', path: '/q/review/conquer' },
  { name: 'memory',  path: '/q/review/memory/m2' },
];

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile',  width: 390,  height: 844 },
];

const results = [];
let failed = 0;

const browser = await chromium.launch();

try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const t of targets) {
      const file = path.join(OUT_DIR, `${t.name}-${vp.name}.png`);
      const url = `${BASE}${t.path}`;
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) throw new Error(`HTTP ${status}`);
        // 본문이 paint될 시간 확보 — 카드/이미지 등 lazy 요소까지
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);
        await page.screenshot({ path: file, fullPage: true });
        results.push({ name: `${t.name}/${vp.name}`, ok: true, file });
        console.log(`✓ ${t.name} (${vp.name}) — ${file}`);
      } catch (err) {
        results.push({ name: `${t.name}/${vp.name}`, ok: false, error: err.message });
        failed++;
        console.log(`✗ ${t.name} (${vp.name}) — ${err.message}`);
        await page.screenshot({ path: file, fullPage: true }).catch(() => {});
      }
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(
  `\n=== 풀림 Q 디자인 audit 캡처 — ${results.length - failed}/${results.length} ok ===`,
);
console.log(`출력: ${OUT_DIR}`);
process.exit(failed === 0 ? 0 : 1);
