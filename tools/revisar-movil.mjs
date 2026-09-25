// Captura de página completa en celular (390×844) para revisión visual. Liviana: una sola página.
import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'http://localhost:4180/';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, { waitUntil: 'networkidle2' }); await p.waitForSelector('#trabajo');
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 80)); }
await p.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')); scrollTo(0, 0); });
await new Promise((r) => setTimeout(r, 1200));
const overflow = await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map((e) => e.className || e.tagName));
await p.screenshot({ path: 'tools/.raw/movil-full.png', fullPage: true });
console.log('alto', h, 'desbordan:', JSON.stringify(overflow), errs.length ? 'ERRORES ' + errs : '');
await b.close();
