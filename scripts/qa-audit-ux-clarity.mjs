// 풀림 Q audit PR B QA — UX 명확화 3건 검증
//
// F-4: /q/review KPI 모바일 그리드 — grid-cols-1 → grid-cols-2 (2x2)
// F-5: /q/infinity/solve?kind=retry 진행 바 — 답하기 전 0%, 답 후 100%
// F-10: /q/review KPI 4번째 ("30일 남은 기억") — lemon accent

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const SHOTS = '/tmp/qa-audit-b-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const checks = [];
let failed = 0;
function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

try {
  // ─── F-5: retry 세션 진행 바 ─────────────────────────────────────────
  await page.goto(`${BASE}/q/infinity/solve?kind=retry&sku=Q-MATH-CALC-0042`, { waitUntil: 'networkidle' });
  await page.waitForSelector('ol > li > button');

  // 답하기 전 — pct 0%
  const beforePct = await page.locator('text=/\\d+% 완료/').first().textContent();
  record('F-5 답하기 전 진행 0%', beforePct === '0% 완료', beforePct ?? '(none)');

  const beforeWidth = await page.evaluate(() => {
    const bar = document.querySelector('.bg-pullim-blue-500.h-full');
    return bar ? bar.style.width : null;
  });
  record('F-5 답하기 전 진행 바 width 0%', beforeWidth === '0%', beforeWidth ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/01-retry-before-answer.png`, fullPage: true });

  // 답 후 (choice 0 = answerIndex=0, 정답)
  await page.locator('ol > li > button').nth(0).click();
  await page.waitForSelector('section.rounded-xl.border-2');

  const afterPct = await page.locator('text=/\\d+% 완료/').first().textContent();
  record('F-5 답 후 진행 100%', afterPct === '100% 완료', afterPct ?? '(none)');

  const afterWidth = await page.evaluate(() => {
    const bar = document.querySelector('.bg-pullim-blue-500.h-full');
    return bar ? bar.style.width : null;
  });
  record('F-5 답 후 진행 바 width 100%', afterWidth === '100%', afterWidth ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/02-retry-after-answer.png`, fullPage: true });

  // ─── F-4: /q/review 모바일 KPI 2x2 grid ───────────────────────────────
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/q/review`, { waitUntil: 'networkidle' });
  await page.waitForSelector('section.rounded-2xl ul');

  const gridCols = await page.evaluate(() => {
    const ul = document.querySelector('section.rounded-2xl ul');
    if (!ul) return null;
    return getComputedStyle(ul).gridTemplateColumns;
  });
  // grid-cols-2 → 2개 컬럼 (375/2 - gap)
  const cols = gridCols ? gridCols.split(' ').length : 0;
  record('F-4 모바일 KPI 2-col grid', cols === 2, `${cols} cols (${gridCols})`);
  await page.screenshot({ path: `${SHOTS}/03-review-mobile.png`, fullPage: true });

  // ─── F-10: KPI 4번째 (30일 남은 기억) lemon accent ──────────────────
  // desktop으로 돌아가서 4번째 KPI value의 color 확인
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${BASE}/q/review`, { waitUntil: 'networkidle' });

  const fourthKpiColor = await page.evaluate(() => {
    const lis = document.querySelectorAll('section.rounded-2xl ul > li');
    const fourth = lis[3];
    if (!fourth) return null;
    const valueSpan = fourth.querySelector('.font-mono.text-lg');
    if (!valueSpan) return null;
    return {
      color: getComputedStyle(valueSpan).color,
      iconBg: getComputedStyle(fourth.querySelector('span.flex.h-9') ?? fourth).backgroundColor,
    };
  });
  // pullim-lemon-ink는 보통 어두운 yellow-olive (rgb(92, 107, 10) 같은 값) 또는 lemon-ink
  // 정확한 값은 token에 따라 다르므로 "기본 navy"(rgb(18,22,39))가 아닌 것을 확인
  const isLemonAccent = fourthKpiColor &&
    fourthKpiColor.color !== 'rgb(18, 22, 39)' &&
    fourthKpiColor.color !== 'rgb(15, 23, 42)';
  record('F-10 4번째 KPI value color != 기본 slate', isLemonAccent,
    fourthKpiColor ? `value=${fourthKpiColor.color}, iconBg=${fourthKpiColor.iconBg}` : '(none)');
  await page.screenshot({ path: `${SHOTS}/04-review-desktop-kpi.png`, fullPage: true });

} catch (err) {
  record('예외 발생', false, err.message);
  await page.screenshot({ path: `${SHOTS}/99-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n=== 풀림 Q audit PR B QA — ${checks.length - failed}/${checks.length} pass ===`);
console.log(`스크린샷: ${SHOTS}/`);
process.exit(failed === 0 ? 0 : 1);
