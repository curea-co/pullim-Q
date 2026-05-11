// 풀림 Q — Leitner mock 가변화 + retry 즉시 피드백 QA (Playwright)
//
// 시나리오:
//   A. 정답 → BOX N+1 이동 — Q-MATH-CALC-0042 (lc2, box 1, answerIndex=0)
//   B. 오답 → BOX 1 복귀     — Q-ENG-RDG-1208 (lc3, box 2, answerIndex=1; choice 0 클릭)
//   C. BOX 카운트 즉시 갱신   — /q/review 복귀 시 BOX 1/2 counts 변동 검증
//
// 검증 항목 (시나리오별):
//   1. AnswerFeedback "정답!" 또는 "아쉬워요" 배지 노출
//   2. box-move inline copy ("BOX N → BOX M ..." 또는 "BOX N → BOX 1 복귀")
//   3. sonner toast 노출 (텍스트 일치)
//   4. /q/review 복귀 시 LeitnerSummary BOX 카운트 변경

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3031';
const SHOTS = '/tmp/qa-leitner-shots';
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

async function boxCounts() {
  return await page.evaluate(() => {
    // LeitnerSummary li:
    //   - box label div: .font-mono.text-sm.font-bold (BOX 5는 Trophy icon)
    //   - count div:     .font-mono.text-base.font-bold (text-base로 구분)
    const lis = document.querySelectorAll('article ol.grid.grid-cols-5 > li');
    const counts = {};
    lis.forEach((li, i) => {
      const numEl = li.querySelector('.font-mono.text-base.font-bold');
      counts[i + 1] = numEl ? parseInt(numEl.textContent.trim(), 10) : null;
    });
    return counts;
  });
}

async function runRetry(sku, choiceIdx) {
  // /q/review에서 해당 sku 다시 풀기 링크 클릭 (SPA navigation)
  const linkSel = `a[href*="kind=retry&sku=${sku}"]`;
  await page.waitForSelector(linkSel);
  await page.click(linkSel);
  await page.waitForURL(/kind=retry/);
  await page.waitForSelector('ol > li > button');
  await page.locator('ol > li > button').nth(choiceIdx).click();
  await page.waitForSelector('section.rounded-xl.border-2');
}

try {
  // ─── 초기 상태 캡처 ─────────────────────────────────────────────────
  // /q/review에 들어가서 store가 한 번 hydrate되면, 이후 SPA navigation으로
  // 이동/복귀해도 store state 유지. page.goto는 hard load라 store 리셋되므로
  // 한 번만 사용하고 이후엔 client-side로 이동.
  await page.goto(`${BASE}/q/review`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article ol.grid.grid-cols-5');
  const initial = await boxCounts();
  record('초기 /q/review 로드 + BOX 카운트 읽기',
    Object.values(initial).every(v => typeof v === 'number'),
    JSON.stringify(initial));
  await page.screenshot({ path: `${SHOTS}/01-review-initial.png`, fullPage: true });

  // ─── 시나리오 A: 정답 (Q-MATH-CALC-0042, box 1 → 2) ──────────────────
  await runRetry('Q-MATH-CALC-0042', 0); // answerIndex=0 → 정답
  const fbA = await page.locator('section.rounded-xl.border-2').first().textContent();
  record('A. AnswerFeedback "정답!" 노출', /정답!/.test(fbA), fbA?.slice(0, 80));
  record('A. box-move copy "BOX 1 → BOX 2 이동"', /BOX 1.*BOX 2.*이동/.test(fbA), fbA?.match(/BOX[^,]*이동|BOX[^,]*복귀|마스터[^,]*5/)?.[0] ?? 'no-match');
  const toastA = await page.locator('[data-sonner-toast]').first().textContent({ timeout: 3000 }).catch(() => null);
  record('A. toast 노출 + BOX 이동 카피', toastA && /BOX 1.*BOX 2.*이동/.test(toastA), toastA?.slice(0, 80) ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/02-retry-correct.png`, fullPage: true });

  // SPA 뒤로가기 → /q/review (store 보존)
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForSelector('article ol.grid.grid-cols-5');
  const afterA = await boxCounts();
  record('A. /q/review BOX 1 카운트 감소', afterA[1] === initial[1] - 1, `${initial[1]} → ${afterA[1]}`);
  record('A. /q/review BOX 2 카운트 증가', afterA[2] === initial[2] + 1, `${initial[2]} → ${afterA[2]}`);
  await page.screenshot({ path: `${SHOTS}/03-review-after-A.png`, fullPage: true });

  // ─── 시나리오 B: 오답 (Q-ENG-RDG-1208, box 2 → 1) ────────────────────
  await runRetry('Q-ENG-RDG-1208', 0); // answerIndex=1, choice 0 → 오답
  const fbB = await page.locator('section.rounded-xl.border-2').first().textContent();
  record('B. AnswerFeedback "아쉬워요" 노출', /아쉬워요/.test(fbB), fbB?.slice(0, 80));
  record('B. box-move copy "BOX 2 → BOX 1 복귀"', /BOX 2.*BOX 1.*복귀/.test(fbB), fbB?.match(/BOX[^,]*복귀|BOX[^,]*이동/)?.[0] ?? 'no-match');
  const toastB = await page.locator('[data-sonner-toast]').first().textContent({ timeout: 3000 }).catch(() => null);
  record('B. toast 노출 + BOX 1 복귀 카피', toastB && /BOX 2.*BOX 1.*복귀/.test(toastB), toastB?.slice(0, 80) ?? '(none)');
  await page.screenshot({ path: `${SHOTS}/04-retry-wrong.png`, fullPage: true });

  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForSelector('article ol.grid.grid-cols-5');
  const afterB = await boxCounts();
  record('B. /q/review BOX 2 카운트 감소', afterB[2] === afterA[2] - 1, `${afterA[2]} → ${afterB[2]}`);
  record('B. /q/review BOX 1 카운트 증가', afterB[1] === afterA[1] + 1, `${afterA[1]} → ${afterB[1]}`);
  await page.screenshot({ path: `${SHOTS}/05-review-after-B.png`, fullPage: true });

} catch (err) {
  record('예외 발생', false, err.message);
  await page.screenshot({ path: `${SHOTS}/99-error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n=== 풀림 Q Leitner retry QA — ${checks.length - failed}/${checks.length} pass ===`);
console.log(`스크린샷: ${SHOTS}/`);
process.exit(failed === 0 ? 0 : 1);
