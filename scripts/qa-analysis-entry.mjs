// 풀림 Q — /q/analysis 진입점 QA (Playwright)
//
// Phase 0 검증 — 오답 원인 Top 3 미니카드 + "다시 봐야 할 문제" 카드.
// advice §5-1 의 신규 두 블록 동작 확인.

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const SHOTS = '/tmp/qa-analysis-entry-shots';
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
  // ─── 진입 ───────────────────────────────────────────────
  await page.goto(`${BASE}/q/analysis`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 5000 });

  const heading = await page.locator('h1').first().textContent();
  record('분석 페이지 헤더 노출', /두 각도로 보기/.test(heading ?? ''), heading ?? '없음');

  // ─── 오답 원인 Top 3 ────────────────────────────────────
  const top3Heading = await page.locator('h2', { hasText: '최근 오답 원인 Top 3' }).count();
  record('Top 3 섹션 헤딩 존재', top3Heading === 1, `${top3Heading}개`);

  const top3Cards = await page.locator('section[aria-label="최근 오답 원인"] a').count();
  record('Top 3 카드 3개 노출', top3Cards === 3, `${top3Cards}개`);

  const firstRank = await page
    .locator('section[aria-label="최근 오답 원인"] a')
    .first()
    .locator('span.font-mono')
    .first()
    .textContent();
  record('Top 3 1위 카드 rank=1', firstRank?.trim() === '1', firstRank ?? '없음');

  // 1위 카드의 예시 문장이 보여야 함
  const firstExample = await page
    .locator('section[aria-label="최근 오답 원인"] a')
    .first()
    .locator('p')
    .first()
    .textContent();
  record('Top 3 1위 카드 예시 문장 존재', /예:/.test(firstExample ?? ''), firstExample?.slice(0, 30));

  await page.screenshot({ path: `${SHOTS}/01-analysis-page.png`, fullPage: true });

  // ─── 다시 봐야 할 문제 ──────────────────────────────────
  const recentSection = await page.locator('section#recent-mistakes').count();
  record('"다시 봐야 할 문제" 섹션 존재', recentSection === 1, `${recentSection}개`);

  const mistakeCards = await page.locator('section#recent-mistakes li > a').count();
  record('다시 봐야 할 문제 카드 ≥ 3장', mistakeCards >= 3, `${mistakeCards}장`);

  // 첫 카드에 reason chip이 ≥ 1개 보여야
  const firstCardChips = await page
    .locator('section#recent-mistakes li > a')
    .first()
    .locator('ul li')
    .count();
  record('첫 카드 reason chip ≥ 1개', firstCardChips >= 1, `${firstCardChips}개`);

  // 첫 카드의 CTA 카피
  const firstCardCta = await page
    .locator('section#recent-mistakes li > a')
    .first()
    .textContent();
  record(
    '첫 카드 CTA "이 문제 풀이 다시 보기"',
    /이 문제 풀이 다시 보기/.test(firstCardCta ?? ''),
    '',
  );

  // 첫 카드 href는 SKU 경로
  const firstHref = await page
    .locator('section#recent-mistakes li > a')
    .first()
    .getAttribute('href');
  record(
    '첫 카드 href = explain SKU 경로',
    /^\/q\/infinity\/explain\/Q-/.test(firstHref ?? ''),
    firstHref ?? '없음',
  );

  // ─── SPA 클릭 → 미시 허브 도달 ──────────────────────────
  const firstCardLink = page.locator('section#recent-mistakes li > a').first();
  const targetHref = await firstCardLink.getAttribute('href');
  await Promise.all([
    page.waitForURL(url => url.pathname.startsWith('/q/infinity/explain/'), { timeout: 8000 }),
    firstCardLink.click(),
  ]);
  const reachedUrl = page.url();
  record(
    '카드 클릭 시 explain 라우트 도달',
    /\/q\/infinity\/explain\/Q-/.test(reachedUrl),
    `target=${targetHref} reached=${reachedUrl}`,
  );
  await page.waitForLoadState('domcontentloaded');
  await page.screenshot({ path: `${SHOTS}/02-explain-after-click.png`, fullPage: true });

  // 뒤로가기로 분석 페이지 복귀 시 두 섹션이 여전히 보이는지
  await Promise.all([
    page.waitForURL(url => url.pathname === '/q/analysis', { timeout: 8000 }),
    page.goBack(),
  ]);
  await page.waitForSelector('h2:has-text("최근 오답 원인 Top 3")', { timeout: 5000 });
  const top3Again = await page.locator('h2', { hasText: '최근 오답 원인 Top 3' }).count();
  record('뒤로가기 후 Top 3 섹션 유지', top3Again === 1, `${top3Again}개`);
  const recentAgain = await page.locator('section#recent-mistakes').count();
  record('뒤로가기 후 다시 봐야 할 문제 섹션 유지', recentAgain === 1, `${recentAgain}개`);
  await page.screenshot({ path: `${SHOTS}/03-analysis-after-back.png`, fullPage: true });

  // ─── 모바일 viewport 점검 ───────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/q/analysis`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h2:has-text("최근 오답 원인 Top 3")');
  const mobileCards = await page.locator('section[aria-label="최근 오답 원인"] a').count();
  record('모바일 Top 3 카드 3개 유지', mobileCards === 3, `${mobileCards}개`);
  await page.screenshot({ path: `${SHOTS}/04-analysis-mobile.png`, fullPage: true });
} catch (err) {
  record('예외 발생', false, err.message);
  await page.screenshot({ path: `${SHOTS}/99-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(
  `\n=== 풀림 Q 분석 진입점 QA — ${checks.length - failed}/${checks.length} pass ===`,
);
console.log(`스크린샷: ${SHOTS}/`);
process.exit(failed === 0 ? 0 : 1);
