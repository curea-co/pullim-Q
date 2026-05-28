// Pullim Q — private (Q-specific) deep capture
import { chromium } from '/Users/curea/dev_git/pullim-Q/node_modules/playwright/index.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/pullim-audit/q/private';
const BASE = 'https://pullim-q.vercel.app';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

const collected = { desktop: {}, mobile: {} };

async function captureRoute(label, url, viewport, opts = {}) {
  const tag = viewport.width < 500 ? 'mobile' : 'desktop';
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    userAgent:
      tag === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

  console.log(`\n=== ${label} ${tag} ${url} ===`);
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => console.log('goto err', e.message));
  await page.waitForTimeout(1200);

  if (opts.action) {
    try { await opts.action(page); await page.waitForTimeout(800); }
    catch (e) { console.log('action err', e.message); }
  }

  await page.screenshot({ path: path.join(OUT, `${tag}-${label}-fold.png`), fullPage: false });
  await page.screenshot({ path: path.join(OUT, `${tag}-${label}-full.png`), fullPage: true });

  // collect Q-specific metrics
  const metrics = await page.evaluate(() => {
    function bb(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        x: Math.round(r.x), y: Math.round(r.y),
        bg: cs.backgroundColor, color: cs.color,
        fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight,
        radius: cs.borderRadius, border: cs.border,
        padding: cs.padding, gap: cs.gap, ff: cs.fontFamily.slice(0, 60),
        shadow: cs.boxShadow.slice(0, 80),
      };
    }
    const out = {
      url: location.href,
      title: document.title,
      // catch all buttons that look like answer choices
      choices: [...document.querySelectorAll('button, [role=button], li')]
        .filter((el) => /^[①②③④⑤]|^[1-5][.)]\s|^[A-Ea-e][.)]\s/.test(el.textContent?.trim() || ''))
        .slice(0, 8)
        .map((el) => ({ text: (el.textContent || '').trim().slice(0, 80), ...bb(el) })),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .slice(0, 30)
        .map((h) => ({ tag: h.tagName, text: (h.textContent || '').trim().slice(0, 100), ...bb(h) })),
      cards: [...document.querySelectorAll('section, article, [class*=card], [class*=Card]')]
        .slice(0, 20)
        .map((c) => ({ cls: c.className?.toString().slice(0, 60), tag: c.tagName, ...bb(c) })),
      fabs: [...document.querySelectorAll('button')]
        .filter((b) => {
          const r = b.getBoundingClientRect();
          const cs = getComputedStyle(b);
          return cs.position === 'fixed' && r.width < 200;
        })
        .map((b) => ({ text: (b.textContent || '').trim().slice(0, 30), ...bb(b) })),
      // detect math/code monospace usage
      monoElements: [...document.querySelectorAll('*')].filter((el) => /mono/i.test(getComputedStyle(el).fontFamily)).length,
      // overall H1/H2 distribution
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      h3Count: document.querySelectorAll('h3').length,
      hasMath: document.body.innerText.includes('∫') || document.body.innerText.includes('∑') || /[ⓐ-ⓩ①-⑩]/.test(document.body.innerText),
      timerText: [...document.querySelectorAll('*')]
        .map((el) => el.textContent?.trim())
        .filter((t) => t && /\d{1,2}:\d{2}/.test(t) && t.length < 20)
        .slice(0, 6),
      progressText: [...document.querySelectorAll('*')]
        .map((el) => el.textContent?.trim())
        .filter((t) => t && /^\d+\s*\/\s*\d+$/.test(t))
        .slice(0, 6),
      streakText: [...document.querySelectorAll('*')]
        .map((el) => el.textContent?.trim())
        .filter((t) => t && /\d+일\s*연속/.test(t))
        .slice(0, 4),
    };
    return out;
  });
  metrics.consoleErrors = consoleErrors;

  collected[tag][label] = metrics;
  await ctx.close();
}

// 1. solve — initial
await captureRoute('solve-initial', '/q/infinity/solve', desktop);
await captureRoute('solve-initial', '/q/infinity/solve', mobile);

// 2. solve — click first answer choice (try to reveal selected state)
await captureRoute('solve-selected', '/q/infinity/solve', desktop, {
  action: async (page) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const t = (await buttons.nth(i).innerText().catch(() => '')) || '';
      if (/^[①1A]/.test(t.trim()) || /^[1-5]\s/.test(t.trim())) {
        await buttons.nth(i).click().catch(() => {});
        break;
      }
    }
  },
});

// 3. explain — 12 sections full page (it's likely a long scroll)
await captureRoute('explain', '/q/infinity/explain/sample-1', desktop);
await captureRoute('explain', '/q/infinity/explain/sample-1', mobile);

// 4. exam-result
await captureRoute('exam-result', '/q/infinity/exam-result', desktop);
await captureRoute('exam-result', '/q/infinity/exam-result', mobile);

// 5. infinity hub
await captureRoute('infinity-hub', '/q/infinity', desktop);
await captureRoute('infinity-hub', '/q/infinity', mobile);

// 6. talk (AI 코치)
await captureRoute('talk', '/q/talk', desktop);
await captureRoute('talk', '/q/talk', mobile);

// 7. analysis
await captureRoute('analysis', '/q/analysis', desktop);
await captureRoute('analysis', '/q/analysis', mobile);

// 8. review
await captureRoute('review', '/q/review', desktop);
await captureRoute('review', '/q/review', mobile);

// 9. onboarding
await captureRoute('onboarding', '/q/onboarding', desktop);
await captureRoute('onboarding', '/q/onboarding', mobile);

// 10. home with FAB open
await captureRoute('home-fab-open', '/q', desktop, {
  action: async (page) => {
    const fab = page.locator('button').filter({ hasText: /AI에게/ }).first();
    await fab.click({ timeout: 3000 }).catch(() => {});
  },
});
await captureRoute('home-fab-open', '/q', mobile, {
  action: async (page) => {
    const fab = page.locator('button').filter({ hasText: /AI에게/ }).first();
    await fab.click({ timeout: 3000 }).catch(() => {});
  },
});

await writeFile(path.join(OUT, 'private-metrics.json'), JSON.stringify(collected, null, 2));
await browser.close();
console.log('\nDONE. Out:', OUT);
