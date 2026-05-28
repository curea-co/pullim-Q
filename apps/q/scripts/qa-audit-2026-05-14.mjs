// UX audit 2026-05-14 — 오늘 머지 10 PR 사후 면밀 검사용 캡처.
// desktop 1280×800 + mobile 360×740 × 13 라우트 = 26장.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3031';
const OUT_DIR = path.resolve('proc/research/2026-05-14_ux-audit/captures');
fs.mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: 'q-home',                 path: '/q' },
  { name: 'q-onboarding',           path: '/q/onboarding' },
  { name: 'infinity',               path: '/q/infinity' },
  { name: 'infinity-onboarding',    path: '/q/infinity/onboarding' },
  { name: 'infinity-solve-picker',  path: '/q/infinity/solve' },
  { name: 'infinity-solve-free',    path: '/q/infinity/solve?kind=free&subject=math' },
  { name: 'infinity-exam-result',   path: '/q/infinity/exam-result' },
  { name: 'analysis',               path: '/q/analysis' },
  { name: 'analysis-diagnose',      path: '/q/analysis/diagnose' },
  { name: 'analysis-onboarding',    path: '/q/analysis/onboarding' },
  { name: 'review',                 path: '/q/review' },
  { name: 'review-conquer',         path: '/q/review/conquer' },
  { name: 'review-memory',          path: '/q/review/memory/m2' },
  { name: 'talk',                   path: '/q/talk' },
  { name: 'talk-onboarding',        path: '/q/talk/onboarding' },
];

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile',  width: 360,  height: 740 },
];

const browser = await chromium.launch();
let ok = 0, fail = 0;

try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const t of targets) {
      const file = path.join(OUT_DIR, `${t.name}-${vp.name}.png`);
      try {
        const resp = await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) throw new Error(`HTTP ${status}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(400);
        await page.screenshot({ path: file, fullPage: true });
        ok++;
        console.log(`✓ ${t.name} (${vp.name})`);
      } catch (err) {
        fail++;
        console.log(`✗ ${t.name} (${vp.name}) — ${err.message}`);
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(`\n${ok}/${ok + fail} ok`);
process.exit(fail > 0 ? 1 : 0);
