// 풀림 Q 역분석 슬라이드용 캡처 — 2026-05-18.
// 15 학생 라우트 × desktop 1280×800 viewport (slide 비율 맞춤).

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3031';
const OUT_DIR = path.resolve('proc/research/2026-05-18_reverse-analysis/captures');
fs.mkdirSync(OUT_DIR, { recursive: true });

// 풀림 Q 5-18 flow audit 후 잔존 학생 라우트 (onboarding 5건 삭제 후 10 라우트).
const targets = [
  { name: 'q-home',                 path: '/q' },
  { name: 'infinity',               path: '/q/infinity' },
  { name: 'infinity-solve-picker',  path: '/q/infinity/solve' },
  { name: 'infinity-solve-free',    path: '/q/infinity/solve?kind=free&subject=math' },
  { name: 'infinity-exam-result',   path: '/q/infinity/exam-result' },
  { name: 'infinity-explain',       path: '/q/infinity/explain' },
  { name: 'analysis',               path: '/q/analysis' },
  { name: 'analysis-diagnose',      path: '/q/analysis/diagnose' },
  { name: 'analysis-ability',       path: '/q/analysis/ability' },
  { name: 'analysis-process',       path: '/q/analysis/process' },
  { name: 'review',                 path: '/q/review' },
  { name: 'review-conquer',         path: '/q/review/conquer' },
  { name: 'review-memory',          path: '/q/review/memory/m2' },
  { name: 'talk',                   path: '/q/talk' },
];

const VIEWPORT = { width: 1280, height: 800 };
const browser = await chromium.launch();
let ok = 0, fail = 0;

try {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  for (const t of targets) {
    const file = path.join(OUT_DIR, `${t.name}.png`);
    try {
      const resp = await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp?.status() ?? 0;
      if (status >= 400) throw new Error(`HTTP ${status}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      // viewport 캡처 (full page 가 아닌 1280×800 단일 화면)
      await page.screenshot({ path: file, fullPage: false });
      ok++;
      console.log(`✓ ${t.name}`);
    } catch (err) {
      fail++;
      console.log(`✗ ${t.name} — ${err.message}`);
    }
  }
  await ctx.close();
} finally {
  await browser.close();
}

console.log(`\n${ok}/${ok + fail} ok`);
process.exit(fail > 0 ? 1 : 0);
