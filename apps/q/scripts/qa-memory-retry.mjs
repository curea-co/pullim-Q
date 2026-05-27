// 풀림 Q — 기억장치 단일 학습 라우트 QA (Playwright)
//
// 시나리오:
//   A. /q/review에서 m2 (관계대명사 that vs which, retention 0.71) 클릭 → 앞면 → 답 보기 → 뒷면 → "기억나요" → 결과
//      기대: 0.71 → 0.86 (mastered, +15p), 다음 복습 longer interval, toast "마스터 도달"
//   B. /q/review에서 m4 (빈칸 추론 접속사, retention 0.43) 클릭 → "안 나요"
//      기대: 0.43 → 0.18 (-25p), 다음 복습 1시간, toast "기억 약화"
//   C. 결과 후 "복습 큐로 돌아가기" → /q/review 복귀 시 retention % 갱신 확인

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const SHOTS = '/tmp/qa-memory-shots';
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

async function retentionOf(memId) {
  // 우선 큐의 memory 행에서 retention % 추출
  return await page.evaluate((id) => {
    const link = document.querySelector(`a[href*="review/memory/${id}"]`);
    if (!link) return null;
    const m = link.textContent.match(/남은 기억\s*(\d+)%/);
    return m ? parseInt(m[1], 10) : null;
  }, memId);
}

async function clickButtonByText(text) {
  await page.locator('button').filter({ hasText: text }).first().click();
}

try {
  // ─── 초기 상태 ─────────────────────────────────────────────────────────
  await page.goto(`${BASE}/q/review`, { waitUntil: 'networkidle' });
  await page.waitForSelector('a[href*="review/memory/"]');
  const initialM2 = await retentionOf('m2');
  const initialM4 = await retentionOf('m4');
  record('초기 m2 retention 71%', initialM2 === 71, `${initialM2}`);
  record('초기 m4 retention 43%', initialM4 === 43, `${initialM4}`);
  await page.screenshot({ path: `${SHOTS}/01-review-initial.png`, fullPage: true });

  // ─── 시나리오 A: m2 (관계대명사) → 기억나요 → 마스터 ───────────────────
  await page.click('a[href*="review/memory/m2"]');
  await page.waitForURL(/review\/memory\/m2/);
  await page.waitForSelector('section.rounded-2xl');
  const frontA = await page.locator('section.rounded-2xl').first().textContent();
  record('A. 앞면 prompt 노출', /관계대명사|계속적 용법|콤마/.test(frontA), frontA?.slice(0, 60));
  await page.screenshot({ path: `${SHOTS}/02a-front.png`, fullPage: true });

  await clickButtonByText('답 보기');
  await page.waitForSelector('section:has-text("정답")');
  const backA = await page.locator('section.rounded-2xl').first().textContent();
  record('A. 뒷면 answer 노출', /that\./.test(backA) && /정답/.test(backA), backA?.slice(0, 80));
  await page.screenshot({ path: `${SHOTS}/02b-back.png`, fullPage: true });

  await clickButtonByText('기억나요');
  await page.waitForSelector('section.border-2');
  const resultA = await page.locator('section.border-2').first().textContent();
  record('A. 결과 "마스터 도달!" 노출', /마스터 도달/.test(resultA), resultA?.match(/마스터 도달|강화 완료|한 번 더/)?.[0] ?? 'no-match');
  record('A. 결과 retention 71% → 86%', /71%.*86%/.test(resultA), resultA?.match(/\d+%.*\d+%/)?.[0] ?? 'no-match');

  const toastA = await page.locator('[data-sonner-toast]').first().textContent({ timeout: 3000 }).catch(() => null);
  record('A. toast "마스터 도달" 노출', toastA && /마스터 도달/.test(toastA), toastA?.slice(0, 80) ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/02c-result-mastered.png`, fullPage: true });

  // 복귀
  await page.click('a[href="/q/review"]');
  await page.waitForURL(/q\/review$/);
  await page.waitForSelector('a[href*="review/memory/"]');
  // m2는 mastered (retention 86%, next=48h)이라 24h 큐에서 빠짐 — 정상 동작
  const afterM2 = await retentionOf('m2');
  record(
    'A. /q/review 복귀 m2 큐 이탈 (next 48h)',
    afterM2 === null,
    afterM2 === null ? '큐에서 빠짐 (정상)' : `여전히 노출 ${afterM2}%`,
  );
  await page.screenshot({ path: `${SHOTS}/03-review-after-A.png`, fullPage: true });

  // ─── 시나리오 B: m4 (빈칸 추론) → 안 나요 → 약화 ──────────────────────
  await page.click('a[href*="review/memory/m4"]');
  await page.waitForURL(/review\/memory\/m4/);
  await page.waitForSelector('section.rounded-2xl');
  await clickButtonByText('답 보기');
  await page.waitForSelector('section:has-text("정답")');
  await clickButtonByText('안 나요');
  await page.waitForSelector('section.border-2');

  const resultB = await page.locator('section.border-2').first().textContent();
  record('B. 결과 "한 번 더 만나요" 노출', /한 번 더/.test(resultB), resultB?.match(/마스터 도달|강화 완료|한 번 더/)?.[0] ?? 'no-match');
  record('B. 결과 retention 43% → 18%', /43%.*18%/.test(resultB), resultB?.match(/\d+%.*\d+%/)?.[0] ?? 'no-match');

  const toastB = await page.locator('[data-sonner-toast]').first().textContent({ timeout: 3000 }).catch(() => null);
  record('B. toast "기억 약화" 노출', toastB && /기억 약화/.test(toastB), toastB?.slice(0, 80) ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/04-result-forgot.png`, fullPage: true });

  await page.click('a[href="/q/review"]');
  await page.waitForURL(/q\/review$/);
  await page.waitForSelector('a[href*="review/memory/"]');
  // m4는 retention 18% + next=1h → 여전히 큐 상위에 보임
  const afterM4 = await retentionOf('m4');
  record('B. /q/review 복귀 m4 retention 18%', afterM4 === 18, `${initialM4} → ${afterM4}`);
  await page.screenshot({ path: `${SHOTS}/05-review-after-B.png`, fullPage: true });

  // ─── 시나리오 C: 잘못된 id로 진입 → not-found 카드 ───────────────────
  await page.goto(`${BASE}/q/review/memory/nonexistent-id`, { waitUntil: 'networkidle' });
  const notFound = await page.locator('h1').first().textContent();
  record('C. 잘못된 id → 안내 카드 노출', /찾을 수 없는/.test(notFound ?? ''), notFound ?? 'no-h1');
  await page.screenshot({ path: `${SHOTS}/06-not-found.png`, fullPage: true });

} catch (err) {
  record('예외 발생', false, err.message);
  await page.screenshot({ path: `${SHOTS}/99-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n=== 풀림 Q 기억장치 단일 학습 QA — ${checks.length - failed}/${checks.length} pass ===`);
console.log(`스크린샷: ${SHOTS}/`);
process.exit(failed === 0 ? 0 : 1);
