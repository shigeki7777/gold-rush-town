// Headless verify for the Parts Catalog (generic — scales to the whole kit).
// Usage: node catalog-verify.mjs <baseUrl>
import { chromium } from 'playwright';

const base = (process.argv[2] || 'http://127.0.0.1:8099/').replace(/\/?$/, '/');
const url = base + 'catalog.html';
const out = new URL('./visual-qa/', import.meta.url).pathname;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.GRTCAT && (window.GRTCAT.ready || window.GRTCAT.error), { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(1200);

const report = await page.evaluate(() => window.GRTCAT.report());
const manifestCount = await page.evaluate(() => fetch('manifest.json', { cache: 'no-store' }).then(r => r.json()).then(m => m.parts.length));
const chips = await page.$$eval('.fchip', els => els.map(e => e.textContent));
const allCount = await page.$$eval('.partBtn', els => els.length);
await page.screenshot({ path: out + 'catalog-all.png' });

// render-sanity: click first / middle / last part, each must render without error
async function clickIdx(i) {
  const btns = await page.$$('.partBtn');
  if (!btns[i]) return null;
  await btns[i].click();
  await page.waitForTimeout(700);
  return page.evaluate(() => ({ id: window.GRTCAT.partId, ready: window.GRTCAT.ready, error: window.GRTCAT.error }));
}
const mid = Math.floor(allCount / 2);
const r0 = await clickIdx(0); const rMid = await clickIdx(mid);
await page.screenshot({ path: out + 'catalog-mid.png' });
const rLast = await clickIdx(allCount - 1);
await page.screenshot({ path: out + 'catalog-last.png' });
const rendersOk = [r0, rMid, rLast].every(r => r && r.ready && !r.error);

// category filter: clicking each chip yields a non-empty, smaller-or-equal list; sum of category lists == all
let filterOk = true, catSum = 0;
const cats = chips.filter(c => c.toLowerCase() !== 'all');
for (const c of cats) {
  for (const el of await page.$$('.fchip')) { if ((await el.textContent()) === c) { await el.click(); break; } }
  await page.waitForTimeout(150);
  const n = await page.$$eval('.partBtn', els => els.length);
  catSum += n;
  if (!(n > 0 && n <= allCount)) filterOk = false;
}
const sumOk = catSum === allCount;
// screenshot one category (buildings) for the eye
for (const el of await page.$$('.fchip')) { if ((await el.textContent()) === 'building') { await el.click(); break; } }
await page.waitForTimeout(300);
await page.screenshot({ path: out + 'catalog-buildings.png' });

// ── mobile pass (phone viewport): bottom-sheet drawers must be usable ──
const m = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const merrs = [];
m.on('console', e => { if (e.type() === 'error') merrs.push(e.text()); });
m.on('pageerror', e => merrs.push(String(e)));
await m.goto(url, { waitUntil: 'networkidle' });
await m.waitForFunction(() => window.GRTCAT && window.GRTCAT.ready, { timeout: 15000 }).catch(() => {});
await m.waitForTimeout(900);
const toolbarVisible = await m.$eval('#mtools', el => getComputedStyle(el).display !== 'none').catch(() => false);
const menuHiddenInit = await m.$eval('#menu', el => el.getBoundingClientRect().top >= window.innerHeight - 4).catch(() => false);
await m.screenshot({ path: out + 'mobile-home.png' });
await m.click('#btnParts');
const menuOpen = await m.evaluate(() => document.body.classList.contains('sheet-parts'));
// wait for the slide-up transition to actually settle (not a fixed sleep)
const menuOnscreen = await m.waitForFunction(() => {
  const el = document.getElementById('menu');
  return !!el && el.getBoundingClientRect().top < window.innerHeight - 60;
}, { timeout: 2500 }).then(() => true).catch(() => false);
await m.waitForTimeout(200);
await m.screenshot({ path: out + 'mobile-parts.png' });
const mb = await m.$$('.partBtn'); if (mb[6]) await mb[6].click(); await m.waitForTimeout(700);
const closedAfterPick = await m.evaluate(() => !document.body.classList.contains('sheet-parts'));
await m.screenshot({ path: out + 'mobile-model.png' });
await m.click('#btnInfo'); await m.waitForTimeout(500);
const infoOpen = await m.evaluate(() => document.body.classList.contains('sheet-info'));
await m.screenshot({ path: out + 'mobile-info.png' });
const mobileOk = toolbarVisible && menuHiddenInit && menuOpen && menuOnscreen && closedAfterPick && infoOpen && merrs.length === 0;

await browser.close();
const countOk = allCount === manifestCount && allCount >= 300;
const ok = report.ready && !report.error && errors.length === 0 && rendersOk && filterOk && sumOk && countOk && mobileOk;
console.log('[catalog-verify]', JSON.stringify(report));
console.log('  parts(list)=' + allCount, 'parts(manifest)=' + manifestCount, 'chips=' + JSON.stringify(chips));
console.log('  renders(first/mid/last)=' + rendersOk, 'filterOk=' + filterOk, 'catSum=' + catSum + (sumOk ? ' (==all)' : ' (MISMATCH)'), 'jsErrors=' + errors.length);
console.log('  mobile: toolbar=' + toolbarVisible, 'sheetHiddenInit=' + menuHiddenInit, 'open=' + menuOpen, 'onscreen=' + menuOnscreen, 'closeOnPick=' + closedAfterPick, 'infoSheet=' + infoOpen, 'jsErrors=' + merrs.length);
if (errors.length) console.log('  desktop errors:', errors.slice(0, 5).join(' | '));
if (merrs.length) console.log('  mobile errors:', merrs.slice(0, 5).join(' | '));
console.log(ok ? `PASS — ${allCount} parts, desktop + mobile usable, zero JS errors.` : 'FAIL');
console.log('screenshots ->', out);
process.exit(ok ? 0 : 1);
