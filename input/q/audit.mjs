// Pullim Q audit script
import { chromium } from '/Users/curea/dev_git/pullim-Q/node_modules/playwright/index.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/pullim-audit/q';
const URL = 'https://pullim-q.vercel.app/q';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = {};

async function captureView(label, viewport) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    userAgent:
      viewport.width < 500
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

  console.log(`\n=== ${label} (${viewport.width}x${viewport.height}) ===`);
  const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
    console.log('goto error:', e.message);
    return null;
  });
  await page.waitForTimeout(1500);

  const status = resp?.status();
  console.log('status:', status, 'url:', page.url());

  // screenshot 1: above the fold
  await page.screenshot({ path: path.join(OUT, `${label}-01-fold.png`), fullPage: false });
  // screenshot 2: full page
  await page.screenshot({ path: path.join(OUT, `${label}-02-full.png`), fullPage: true });

  // extract design metrics
  const meta = await page.evaluate(() => {
    const out = {
      title: document.title,
      url: location.href,
      html: document.documentElement.outerHTML.length,
      lang: document.documentElement.lang,
      viewport: document.querySelector('meta[name=viewport]')?.content,
      themeColor: document.querySelector('meta[name=theme-color]')?.content,
      bodyClasses: document.body.className,
    };

    // collect computed styles of body + main containers
    const bs = getComputedStyle(document.body);
    out.bodyStyle = {
      backgroundColor: bs.backgroundColor,
      color: bs.color,
      fontFamily: bs.fontFamily,
      fontSize: bs.fontSize,
      lineHeight: bs.lineHeight,
    };

    // collect headings
    const headings = [];
    document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
      const cs = getComputedStyle(h);
      headings.push({
        tag: h.tagName,
        text: (h.textContent || '').trim().slice(0, 100),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        fontFamily: cs.fontFamily,
      });
    });
    out.headings = headings.slice(0, 30);

    // collect buttons & inputs
    const buttons = [];
    document.querySelectorAll('button, [role=button], a.btn, a[class*="button"], a[class*="Button"]').forEach((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      buttons.push({
        text: (b.textContent || '').trim().slice(0, 50),
        bg: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        border: cs.border,
        boxShadow: cs.boxShadow,
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    });
    out.buttons = buttons.slice(0, 25);

    const inputs = [];
    document.querySelectorAll('input, textarea, select').forEach((i) => {
      const cs = getComputedStyle(i);
      const r = i.getBoundingClientRect();
      inputs.push({
        type: i.tagName + (i.type ? `:${i.type}` : ''),
        placeholder: i.placeholder,
        bg: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
        border: cs.border,
        padding: cs.padding,
        fontSize: cs.fontSize,
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    });
    out.inputs = inputs.slice(0, 20);

    // color palette: walk and collect bg/text colors
    const colorBag = new Map();
    const bump = (k) => colorBag.set(k, (colorBag.get(k) || 0) + 1);
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bump('bg:' + cs.backgroundColor);
      if (cs.color) bump('color:' + cs.color);
      if (cs.borderColor && cs.borderTopWidth !== '0px') bump('border:' + cs.borderColor);
    });
    out.colorPalette = [...colorBag.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([k, v]) => ({ token: k, count: v }));

    // font sizes
    const sizeBag = new Map();
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const fs = cs.fontSize;
      sizeBag.set(fs, (sizeBag.get(fs) || 0) + 1);
    });
    out.fontSizes = [...sizeBag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

    // border radii
    const radBag = new Map();
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const r = cs.borderRadius;
      if (r && r !== '0px') radBag.set(r, (radBag.get(r) || 0) + 1);
    });
    out.borderRadii = [...radBag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    // shadows
    const shBag = new Map();
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const s = cs.boxShadow;
      if (s && s !== 'none') shBag.set(s, (shBag.get(s) || 0) + 1);
    });
    out.shadows = [...shBag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    // link text & nav
    out.links = [...document.querySelectorAll('a')]
      .slice(0, 40)
      .map((a) => ({ href: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 50) }))
      .filter((x) => x.text);

    // any visible text content (first 2000 chars)
    out.bodyText = (document.body.innerText || '').slice(0, 3000);

    // images count
    out.images = [...document.querySelectorAll('img')].map((i) => ({
      src: i.src.slice(0, 120),
      alt: i.alt,
      w: i.naturalWidth,
      h: i.naturalHeight,
    })).slice(0, 20);

    // focus styles check (sample first focusable)
    out.focusable = document.querySelectorAll('a,button,input,textarea,select,[tabindex]').length;

    return out;
  });

  results[label] = { status, viewport, consoleErrors, meta };

  // Try to find sub-pages by clicking nav items / links inside /q
  if (viewport.width >= 1000) {
    // capture a couple internal pages
    const internalLinks = meta.links
      .filter((l) => l.href && (l.href.startsWith('/q') || l.href.startsWith('/')))
      .filter((l) => !/^#/.test(l.href))
      .slice(0, 4);
    let i = 3;
    for (const link of internalLinks) {
      try {
        const url = new URL(link.href, page.url()).toString();
        if (!url.includes('pullim-q.vercel.app')) continue;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        const slug = (link.text || `page-${i}`).replace(/[^a-zA-Z0-9가-힣]/g, '_').slice(0, 30);
        await page.screenshot({ path: path.join(OUT, `${label}-0${i}-${slug}.png`), fullPage: false });
        console.log(`captured: ${url} -> ${slug}`);
        i++;
        if (i > 6) break;
      } catch (e) {
        console.log('sub-page fail:', e.message);
      }
    }
  }

  await ctx.close();
}

await captureView('desktop', { width: 1440, height: 900 });
await captureView('mobile', { width: 390, height: 844 });

await browser.close();

await writeFile(path.join(OUT, 'raw-metrics.json'), JSON.stringify(results, null, 2));
console.log('\n✅ Done. Output:', OUT);
