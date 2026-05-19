import { test, expect } from '@playwright/test';

// solve-session-store persist 가 이전 run 의 mode 를 복원하지 않도록 초기화.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { window.localStorage.removeItem('pullim-q.solve-session.v1'); } catch {}
  });
});

// C2 — 시험 모드 진입/표시/잠금 분기 (mode=exam) 회귀 가드.
// 작성: 2026-05-19 (G3 단답 5일차 대기 — 시나리오 분기 규모 확정 후 머지)
test('Q infinity solve: 시험 모드 토글 → confirm dialog → 시험 UI + 잠금 표시', async ({ page }) => {
  await page.goto('/q/infinity/solve');
  await page.waitForLoadState('networkidle');

  // 모드 토글에 "시험" 버튼 노출 — solveModeMeta.exam.label = "시험 모드"
  const examToggle = page.getByRole('button', { name: /시험\s*모드/ });
  await expect(examToggle).toBeVisible();

  // 클릭 → ExamConfirmDialog 오픈
  await examToggle.click();
  const dialogHeading = page.getByText('시험 모드를 시작할까요?');
  await expect(dialogHeading).toBeVisible();

  // 시험 세트 1건 자동 선택 또는 카드 클릭 — 첫 카드 선택
  // (currentSubject 미지정 시 전체 세트 노출, 첫 카드만 클릭)
  const firstExamCard = page.locator('[data-exam-card], button:has-text("분")').first();
  if (await firstExamCard.count()) {
    await firstExamCard.click().catch(() => {});
  }

  // "시험 시작 (N분)" 버튼 클릭
  const startBtn = page.getByRole('button', { name: /시험 시작/ });
  await expect(startBtn).toBeEnabled();
  await startBtn.click();

  // dialog 닫힘 + 시험 모드 진입 toast — "시험 모드 시작"
  await expect(dialogHeading).not.toBeVisible({ timeout: 3000 });

  // 시험 UI 표시 — ExamStatusBar(타이머)
  const examWarning = page.getByText('시험 진행 중 — 제출 전까지 모드 변경 불가');
  await expect(examWarning).toBeVisible({ timeout: 3000 });

  // 연습 모드 토글 disabled 확인 — examInProgress=true 시 잠금
  const practiceToggle = page.getByRole('button', { name: /연습\s*모드/ });
  await expect(practiceToggle).toBeDisabled();
});
