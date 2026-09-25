/**
 * Arranca cada proyecto, toma sus capturas y graba un recorrido corto.
 *
 *   node tools/capturar-sitios.mjs            → todos
 *   node tools/capturar-sitios.mjs dallas emou → solo esos
 *
 * Por cada sitio deja en tools/.raw/<id>/:
 *   desk.png    escritorio 1440×900, arriba del todo
 *   mobile.png  celular 390×844 (@2x)
 *   tour.webm   recorrido de ~9 s bajando por la página
 *
 * Los servidores se levantan uno a la vez y se cierran al terminar, para no
 * tener siete Next.js compitiendo por memoria.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'tools', '.raw');
const DEV = 'C:/Dev';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// Locales: `dir` + `cmd` + `port`. Publicados: `url`.
// `wait`: ms tras cargar, para que terminen las animaciones de entrada.
// `deck: true` recorre con la flecha derecha en vez de bajar con la rueda.
export const SITES = [
  { id: 'emou', dir: 'Emou_Beatz', cmd: 'npx next start -p 4322', port: 4322, wait: 6500 },
  { id: 'hexor', dir: 'Hexor Labs', cmd: 'npx next start -p 4323', port: 4323, wait: 7000 },
  { id: 'umbra', url: 'https://umbra-agents.vercel.app/', wait: 14000 },
  { id: 'nythera', url: 'https://nythera-ten.vercel.app/', wait: 6000 },
  // Relevo abre en la bienvenida: se salta y se carga el ejemplo para mostrar el plan
  { id: 'relevo', url: 'https://relevo-rho.vercel.app/', wait: 4000, clicks: ['Saltar', 'Ver un ejemplo'] },
  // App móvil exportada con `npx expo export --platform web`: solo capturas de celular
  { id: 'easy-parking', dir: 'Portafolio/tools/.raw/easy-parking-web', cmd: 'npx --yes http-server . -p 4328 -c-1 --silent', port: 4328, wait: 6000, movil: true },
];

// Pulsa, en orden, el primer botón o enlace visible cuyo texto contenga cada rótulo
async function clickTexts(page, labels = []) {
  for (const label of labels) {
    await page.evaluate((t) => {
      const el = [...document.querySelectorAll('button, a, [role=button]')]
        .find((e) => e.offsetParent && e.textContent.toLowerCase().includes(t.toLowerCase()));
      el?.click();
    }, label);
    await sleep(2500);
  }
}

const HIDE_DEV_UI = `
  nextjs-portal, [data-nextjs-toast], [data-next-badge-root], #__next-build-watcher { display: none !important; }
  ::-webkit-scrollbar { display: none; }
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForPort(port, ms = 180000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const r = await fetch(`http://localhost:${port}/`); if (r.status < 500) return; } catch {}
    await sleep(1000);
  }
  throw new Error(`el puerto ${port} no respondió`);
}

function startServer(site) {
  const child = spawn(site.cmd, { cwd: path.join(DEV, site.dir), shell: true, stdio: 'ignore', windowsHide: true });
  return () => new Promise((res) => {
    // En Windows hay que matar el árbol completo (npx → node → next)
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).on('exit', res);
  });
}

async function prepare(page, url, wait) {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  await page.addStyleTag({ content: HIDE_DEV_UI });
  await sleep(wait);
}

async function capture(browser, site) {
  const out = path.join(RAW, site.id);
  fs.mkdirSync(out, { recursive: true });
  const url = site.url || `http://localhost:${site.port}/`;

  // Primera visita: calienta la compilación en modo dev y las imágenes
  const warm = await browser.newPage();
  await warm.setViewport({ width: 1440, height: 900 });
  await warm.goto(url, { waitUntil: 'load', timeout: 180000 }).catch(() => {});
  await sleep(3000);
  await warm.close();

  if (site.movil) return captureApp(browser, site, url, out);

  const desk = await browser.newPage();
  await desk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await prepare(desk, url, site.wait);
  await clickTexts(desk, site.clicks);
  await desk.screenshot({ path: path.join(out, 'desk.png') });

  // Recorrido: 1,5 s quieto arriba y luego bajar con la rueda (funciona también con Lenis)
  await desk.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  const rec = await desk.screencast({ path: path.join(out, 'tour.webm') });
  await sleep(1500);
  await desk.mouse.move(720, 450);
  if (site.deck) {
    for (let i = 0; i < 7; i++) { await desk.keyboard.press('ArrowRight'); await sleep(1300); }
  } else {
    for (let i = 0; i < 90; i++) { await desk.mouse.wheel({ deltaY: 38 }); await sleep(75); }
  }
  await sleep(700);
  await rec.stop();
  await desk.close();

  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await prepare(mob, url, site.wait);
  await clickTexts(mob, site.clicks);
  await mob.screenshot({ path: path.join(out, 'mobile.png') });
  await mob.close();
}

// App de celular: pantalla inicial, recorrido en formato vertical y una segunda pantalla
async function captureApp(browser, site, url, out) {
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await prepare(mob, url, site.wait);
  await clickTexts(mob, site.clicks);
  await mob.screenshot({ path: path.join(out, 'mobile.png') });
  const rec = await mob.screencast({ path: path.join(out, 'tour.webm') });
  await sleep(1200);
  for (let i = 0; i < 60; i++) { await mob.mouse.wheel({ deltaY: 30 }); await sleep(90); }
  await sleep(800);
  await rec.stop();
  await mob.screenshot({ path: path.join(out, 'mobile-2.png') });
  await mob.close();
}

const only = process.argv.slice(2);
const list = only.length ? SITES.filter((s) => only.includes(s.id)) : SITES;
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

for (const site of list) {
  const t0 = Date.now();
  process.stdout.write(`${site.id.padEnd(8)} arrancando… `);
  const stop = site.url ? async () => {} : startServer(site);
  try {
    if (!site.url) await waitForPort(site.port);
    await capture(browser, site);
    console.log(`✓ ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  } catch (e) {
    console.log(`✗ ${e.message}`);
  } finally {
    await stop();
  }
}
await browser.close();
