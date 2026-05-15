import { test, expect } from '@playwright/test';

test('Q infinity solve: 브라우저 back 으로 풀이 이탈 가능 (LeaveGuard popstate 사이클 회귀)', async ({ page }) => {
  // free 모드 진입 — isResumableSession=true → setInProgress(true)
  await page.goto('/q/infinity');
  await page.waitForLoadState('networkidle');

  await page.goto('/q/infinity/solve?kind=free&subject=math');
  await page.waitForLoadState('networkidle');

  // 풀이 화면 진입 확인
  await expect(page).toHaveURL(/\/q\/infinity\/solve/);

  // 브라우저 뒤로가기 → LeaveGuard dialog 표시
  await page.goBack();
  const dialog = page.getByText('풀이 중이에요');
  await expect(dialog).toBeVisible();

  // "나가기" 클릭 → 실제로 솔브 페이지에서 이탈해야 한다
  await page.getByRole('button', { name: '나가기' }).click();

  // popstate 사이클 버그가 살아 있으면 URL 이 /q/infinity/solve 에 머무름 (가둠 버그)
  await expect(page).not.toHaveURL(/\/q\/infinity\/solve/, { timeout: 2000 });
});
