// 풀림 Q audit PR C QA — 모바일 폴리시 (F-2 + F-6)
//
// F-2: top-bar 검색/알림/프로필 + 햄버거 + 주요 CTA 모두 모바일 44px 이상
// F-6: /q "연속 N일" chip은 모바일에서 full-width로 늘어나지 않음

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const SHOTS = '/tmp/qa-audit-c-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const checks = [];
let failed = 0;
function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();

try {
  await page.goto(`${BASE}/q`, { waitUntil: 'networkidle' });
  await page.waitForSelector('header');

  // F-2: header 인터랙티브 요소 44px+
  const headerSizes = await page.evaluate(() => {
    return [...document.querySelectorAll('header button')]
      .map(b => ({
        aria: b.getAttribute('aria-label') ?? '',
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
      }));
  });
  const headerOk = headerSizes.every(b => b.w >= 44 && b.h >= 44);
  record('F-2 header 모든 버튼 44px+', headerOk, JSON.stringify(headerSizes));

  // F-2: 주요 CTA "오답 정복하기" 44px+
  const ctaH = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find(e => /오답 정복하기/.test(e.textContent));
    return a ? Math.round(a.getBoundingClientRect().height) : null;
  });
  record('F-2 "오답 정복하기" CTA 44px+ (mobile)', ctaH !== null && ctaH >= 44, `${ctaH}px`);

  // F-2: 외부 진입 CTA "스토어 가보기" / "스튜디오 가보기" 44px+
  const externalCtaHeights = await page.evaluate(() => {
    return [...document.querySelectorAll('a')]
      .filter(e => /스토어 가보기|스튜디오 가보기/.test(e.textContent))
      .map(e => ({ text: e.textContent.trim().slice(0, 20), h: Math.round(e.getBoundingClientRect().height) }));
  });
  const externalOk = externalCtaHeights.every(c => c.h >= 44);
  record('F-2 외부 진입 CTA 44px+ (mobile)', externalOk, JSON.stringify(externalCtaHeights));

  // F-6: "연속 N일" chip이 full-width로 늘어나지 않음
  // chip의 width < container width (375 - padding) 이면 OK
  const chipInfo = await page.evaluate(() => {
    const all = [...document.querySelectorAll('div')];
    const chip = all.find(e => /연속 \d+일/.test(e.textContent.trim()) && e.textContent.trim().length < 20);
    if (!chip) return null;
    return {
      w: Math.round(chip.getBoundingClientRect().width),
      vw: window.innerWidth,
    };
  });
  // chip이 viewport 절반 미만이면 inline (정상), 절반 이상이면 stretched
  const chipOk = chipInfo && chipInfo.w < chipInfo.vw / 2;
  record('F-6 "연속 N일" chip이 모바일에서 inline (full-width X)',
    chipOk, chipInfo ? `chip ${chipInfo.w}px / vw ${chipInfo.vw}px` : '(none)');

  await page.screenshot({ path: `${SHOTS}/01-q-mobile-after.png`, fullPage: true });

  // 데스크탑 회귀 — 변경 외 영역이 깨지지 않았는지
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOTS}/02-q-desktop-after.png`, fullPage: true });

  const desktopHeaderSizes = await page.evaluate(() => {
    return [...document.querySelectorAll('header button')]
      .map(b => ({
        aria: b.getAttribute('aria-label') ?? '',
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
      }));
  });
  // 데스크탑은 sm:h-9 sm:w-9 = 36px 유지가 정상
  const desktopOk = desktopHeaderSizes.every(b => b.w <= 44 && b.h <= 44);
  record('데스크탑 header 버튼 36-44px (변경 외 영역 회귀 X)', desktopOk, JSON.stringify(desktopHeaderSizes));

} catch (err) {
  record('예외 발생', false, err.message);
  await page.screenshot({ path: `${SHOTS}/99-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n=== 풀림 Q audit PR C QA — ${checks.length - failed}/${checks.length} pass ===`);
console.log(`스크린샷: ${SHOTS}/`);
process.exit(failed === 0 ? 0 : 1);
