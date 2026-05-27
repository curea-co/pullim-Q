// CoachFab 모바일 점유 정량화 — 2026-05-18 daily-rollup §1.
// 6 라우트 × mobile 360 × 3 변형 (FAB 그대로 / 제거 / 44×44 축소) = 18장 + 측정값.
// 출처: proc/plan/2026-05-15_q-coach-fab-mobile-occlusion.md §3.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3031';
const OUT_DIR = path.resolve('proc/research/2026-05-18_coach-fab-occlusion/captures');
const MEASUREMENTS = path.resolve('proc/research/2026-05-18_coach-fab-occlusion/measurements.md');
fs.mkdirSync(OUT_DIR, { recursive: true });

const FAB_SELECTOR = 'a[aria-label="풀림 AI에게 질문하기"]';

const targets = [
  { name: 'q-home',             path: '/q' },
  { name: 'q-infinity',         path: '/q/infinity' },
  { name: 'q-analysis',         path: '/q/analysis' },
  { name: 'q-review',           path: '/q/review' },
  { name: 'q-analysis-diagnose',path: '/q/analysis/diagnose' },
  { name: 'q-onboarding',       path: '/q/onboarding' },
];

// 변형: FAB DOM 조작으로 3종 시뮬레이션 (코드 수정 없이 캡처)
const variants = [
  { name: 'fab-present', mutate: () => {} },
  { name: 'fab-absent',  mutate: (el) => el?.remove() },
  {
    name: 'fab-44',
    mutate: (el) => {
      if (!el) return;
      el.style.height = '44px';
      el.style.width = '44px';
      el.style.padding = '0';
      el.style.justifyContent = 'center';
      // 라벨 텍스트 숨김 (icon-only 시뮬레이션)
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
      }
      const span = el.querySelector('span, p');
      if (span) span.style.display = 'none';
    },
  },
];

const VIEWPORT = { width: 360, height: 740 };
const browser = await chromium.launch();
const measurements = [];
let ok = 0;
let fail = 0;

try {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  for (const t of targets) {
    for (const v of variants) {
      const file = path.join(OUT_DIR, `${t.name}-${v.name}.png`);
      try {
        const resp = await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) throw new Error(`HTTP ${status}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(400);

        // FAB 측정 (그대로 상태에서만) + 변형 mutate 적용
        const fabBox = await page.evaluate(
          ({ selector, variantName }) => {
            const el = document.querySelector(selector);
            const baseRect = el ? el.getBoundingClientRect() : null;
            // 변형 적용
            if (variantName === 'fab-absent') {
              el?.remove();
            } else if (variantName === 'fab-44' && el) {
              el.style.height = '44px';
              el.style.width = '44px';
              el.style.padding = '0';
              el.style.justifyContent = 'center';
              const span = el.querySelector('span, p');
              if (span) span.style.display = 'none';
              for (const node of Array.from(el.childNodes)) {
                if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
              }
            }
            const afterEl = document.querySelector(selector);
            const afterRect = afterEl ? afterEl.getBoundingClientRect() : null;
            return { base: baseRect ? { x: baseRect.x, y: baseRect.y, w: baseRect.width, h: baseRect.height } : null,
                     after: afterRect ? { x: afterRect.x, y: afterRect.y, w: afterRect.width, h: afterRect.height } : null };
          },
          { selector: FAB_SELECTOR, variantName: v.name },
        );

        await page.waitForTimeout(150);
        await page.screenshot({ path: file, fullPage: false });

        // 가린 픽셀 = FAB 영역 (viewport 360×740 기준)
        let occluded = 0;
        if (v.name === 'fab-present' && fabBox.base) {
          occluded = Math.round(fabBox.base.w * fabBox.base.h);
        } else if (v.name === 'fab-44' && fabBox.after) {
          occluded = Math.round(fabBox.after.w * fabBox.after.h);
        }
        measurements.push({ route: t.name, variant: v.name, occluded_px: occluded });

        ok++;
        console.log(`✓ ${t.name} / ${v.name} — occluded ${occluded}px²`);
      } catch (err) {
        fail++;
        console.log(`✗ ${t.name} / ${v.name} — ${err.message}`);
        measurements.push({ route: t.name, variant: v.name, occluded_px: null, error: err.message });
      }
    }
  }
  await ctx.close();
} finally {
  await browser.close();
}

// measurements.md 산출
const lines = [];
lines.push('# CoachFab 모바일 점유 측정 — 2026-05-18');
lines.push('');
lines.push('> mobile 360×740 viewport · 6 라우트 × 3 변형 (FAB 그대로 / 제거 / 44×44 축소)');
lines.push('> 캡처: `captures/{route}-{variant}.png` (18장)');
lines.push('');
lines.push('## 변형별 가린 픽셀 (viewport 점유 = w × h)');
lines.push('');
lines.push('| 라우트 | FAB 그대로 (px²) | FAB 제거 (px²) | FAB 44×44 (px²) |');
lines.push('|---|---:|---:|---:|');
const byRoute = new Map();
for (const m of measurements) {
  if (!byRoute.has(m.route)) byRoute.set(m.route, {});
  byRoute.get(m.route)[m.variant] = m.occluded_px;
}
for (const [route, vs] of byRoute) {
  lines.push(`| ${route} | ${vs['fab-present'] ?? '-'} | ${vs['fab-absent'] ?? 0} | ${vs['fab-44'] ?? '-'} |`);
}
lines.push('');
lines.push('## 정리');
lines.push('');
lines.push('- viewport 총 점유: 360 × 740 = 266,400 px²');
const presentVals = [...byRoute.values()].map((v) => v['fab-present']).filter((x) => typeof x === 'number');
const fab44Vals = [...byRoute.values()].map((v) => v['fab-44']).filter((x) => typeof x === 'number');
if (presentVals.length) {
  const avg = Math.round(presentVals.reduce((a, b) => a + b, 0) / presentVals.length);
  lines.push(`- FAB 그대로 평균 가린 면적: **${avg} px²** (viewport 의 ${(avg / 266400 * 100).toFixed(2)}%)`);
}
if (fab44Vals.length) {
  const avg = Math.round(fab44Vals.reduce((a, b) => a + b, 0) / fab44Vals.length);
  lines.push(`- FAB 44×44 평균 가린 면적: **${avg} px²** (viewport 의 ${(avg / 266400 * 100).toFixed(2)}%)`);
}
lines.push('- FAB 제거: 0 px² (안1 BottomNav 통합 시 모바일 점유 0)');
lines.push('');
lines.push('## G4 의사결정 보조');
lines.push('');
lines.push('- **안1 (BottomNav 5번째 슬롯 통합 + FAB md: 데스크탑 전용)** → 가린 픽셀 0');
lines.push('- **안2 (모바일 44×44 icon-only 축소)** → 가린 픽셀 약 50% 감소(텍스트 라벨 손실)');
lines.push('- 캡처를 비교해 마지막 카드 CTA 가시성 영향을 함께 검토');

fs.writeFileSync(MEASUREMENTS, lines.join('\n'));
console.log(`\n${ok}/${ok + fail} ok — measurements: ${MEASUREMENTS}`);
process.exit(fail > 0 ? 1 : 0);
