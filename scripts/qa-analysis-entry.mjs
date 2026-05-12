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

  // 첫 카드 href는 /q/analysis/[sku] 경로
  const firstHref = await page
    .locator('section#recent-mistakes li > a')
    .first()
    .getAttribute('href');
  record(
    '첫 카드 href = /q/analysis/[sku]',
    /^\/q\/analysis\/Q-/.test(firstHref ?? ''),
    firstHref ?? '없음',
  );

  // ─── SPA 클릭 → 미시 학습 허브 도달 ──────────────────────────
  const firstCardLink = page.locator('section#recent-mistakes li > a').first();
  const targetHref = await firstCardLink.getAttribute('href');
  await Promise.all([
    page.waitForURL(url => /^\/q\/analysis\/Q-/.test(url.pathname), { timeout: 8000 }),
    firstCardLink.click(),
  ]);
  const reachedUrl = page.url();
  record(
    '카드 클릭 시 미시 학습 허브 도달',
    /\/q\/analysis\/Q-/.test(reachedUrl),
    `target=${targetHref} reached=${reachedUrl}`,
  );
  await page.waitForLoadState('domcontentloaded');

  // 허브 페이지 핵심 요소 — WrongReasonHero + 12-섹션 anchor
  const heroSection = await page.locator('section[aria-label="오답 원인 진단"]').count();
  record('미시 허브 — WrongReasonHero 노출', heroSection === 1, `${heroSection}개`);

  const heroReasonChips = await page
    .locator('section[aria-label="오답 원인 진단"] ul > li')
    .count();
  record('hero reason chip ≥ 1', heroReasonChips >= 1, `${heroReasonChips}개`);

  const sectionTitles = await page.locator('section[id^="s"] h3').count();
  record('미시 허브 — 12-섹션 본문 노출', sectionTitles === 12, `${sectionTitles}개`);

  // "코치에게 더 묻기" 진입 링크
  const coachLink = await page.locator('a[href^="/q/talk?context="]').count();
  record('"코치에게 더 묻기" 링크 존재', coachLink >= 1, `${coachLink}개`);

  await page.screenshot({ path: `${SHOTS}/02-question-hub.png`, fullPage: true });

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

  // ─── 구 explain SKU 직링 → 308 redirect ──────────────────
  await page.setViewportSize({ width: 1280, height: 800 });
  const oldSku = 'Q-MATH-CALC-0042';
  await page.goto(`${BASE}/q/infinity/explain/${oldSku}`, { waitUntil: 'networkidle' });
  const redirectedUrl = page.url();
  record(
    '구 explain 직링 → /q/analysis 흡수',
    new URL(redirectedUrl).pathname === `/q/analysis/${oldSku}`,
    redirectedUrl,
  );
  const fromParam = new URL(redirectedUrl).searchParams.get('from');
  record('redirect 후 from=library 보존', fromParam === 'library', `from=${fromParam}`);
  await page.screenshot({ path: `${SHOTS}/05-redirect-from-explain.png`, fullPage: true });
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
