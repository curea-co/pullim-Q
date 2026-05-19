// Sub-page screenshots + proper full-page
import { chromium } from '/Users/curea/dev_git/pullim-Q/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/pullim-audit/q';
await mkdir(OUT, { recursive: true });

const BASE = 'https://pullim-q.vercel.app';
const PAGES = [
  ['home', '/q'],
  ['infinity', '/q/infinity'],
  ['talk', '/q/talk'],
  ['analysis', '/q/analysis'],
  ['review', '/q/review'],
  ['onboarding', '/q/onboarding'],
  ['solve', '/q/infinity/solve?kind=free&subject=math'],
  ['exam-result', '/q/infinity/exam-result'],
  ['explain', '/q/infinity/explain/Q-MATH-CALC-0042'],
];

const browser = await chromium.launch({ headless: true });

async function shoot(viewport, deviceLabel) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    userAgent:
      viewport.width < 500
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  });
  const page = await ctx.newPage();
  for (const [name, p] of PAGES) {
    try {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // wait for any of the main content selectors
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1200);
      // scroll to bottom slowly to trigger lazy mount
      await page.evaluate(async () => {
        await new Promise((res) => {
          let y = 0;
          const i = setInterval(() => {
            window.scrollBy(0, 400);
            y += 400;
            if (y >= document.documentElement.scrollHeight) {
              clearInterval(i);
              res();
            }
          }, 80);
        });
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(OUT, `${deviceLabel}-page-${name}.png`),
        fullPage: true,
      });
      console.log(deviceLabel, name, 'OK');
    } catch (e) {
      console.log(deviceLabel, name, 'FAIL', e.message);
    }
  }
  await ctx.close();
}

await shoot({ width: 1440, height: 900 }, 'desktop');
await shoot({ width: 390, height: 844 }, 'mobile');

await browser.close();
console.log('done');
