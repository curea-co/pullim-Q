import { test, expect, type Page } from '@playwright/test';

const PAGES = [
  { name: 'infinity', path: '/q/infinity' },
  { name: 'talk',     path: '/q/talk' },
  { name: 'analysis', path: '/q/analysis' },
  { name: 'review',   path: '/q/review' },
] as const;

const EXPECTED_GAP_PX = 24;
const TOLERANCE_PX = 1;

async function measureFirstSectionGap(page: Page): Promise<number> {
  const wrapper = page.locator('div.space-y-section').first();
  await expect(wrapper).toBeVisible();
  const children = wrapper.locator('> *:not([hidden])');
  await expect(children.nth(1)).toBeVisible();
  return await wrapper.evaluate((el) => {
    const kids = Array.from(el.children).filter(
      (c) => !c.hasAttribute('hidden') && (c as HTMLElement).offsetParent !== null,
    ) as HTMLElement[];
    if (kids.length < 2) throw new Error(`섹션 자식 부족: ${kids.length}`);
    const a = kids[0].getBoundingClientRect();
    const b = kids[1].getBoundingClientRect();
    return b.top - a.bottom;
  });
}

for (const { name, path } of PAGES) {
  test(`Q ${name}: 섹션 간격이 ${EXPECTED_GAP_PX}px (${TOLERANCE_PX}px 허용)`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const gap = await measureFirstSectionGap(page);
    expect(gap).toBeGreaterThanOrEqual(EXPECTED_GAP_PX - TOLERANCE_PX);
    expect(gap).toBeLessThanOrEqual(EXPECTED_GAP_PX + TOLERANCE_PX);
    await expect(page).toHaveScreenshot(`q-${name}.png`, { fullPage: true });
  });
}
