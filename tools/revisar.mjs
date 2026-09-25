// Capturas de página completa del portafolio para revisión visual.
import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'http://localhost:4180/';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--hide-scrollbars'] });
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, { waitUntil: 'networkidle2' }); await p.waitForSelector('#trabajo');
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 120)); }
  await p.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')); scrollTo(0, 0); });
  await new Promise((r) => setTimeout(r, 1500));
  await p.screenshot({ path: `tools/.raw/review-${name}.png`, fullPage: true });
  console.log(name, 'alto', h, errs.length ? 'ERRORES: ' + errs.join(' | ') : 'sin errores');
  await p.close();
}
await b.close();
