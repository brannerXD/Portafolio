/**
 * Captura cuadro a cuadro del shader de render.html.
 *
 *   node capture.mjs                  → todos los cuadros de escritorio
 *   node capture.mjs --layout mobile  → versión vertical
 *   node capture.mjs --preview        → 4 cuadros de muestra + prueba de costura
 *
 * Llama a window.__renderFrame(n) y lee el canvas: el resultado no depende del
 * compositor y es idéntico en cada ejecución. Los cuadros que ya existen se
 * saltan, así que un render interrumpido continúa donde quedó.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv;
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);

const LAYOUT = arg('--layout', 'desk');
const PREVIEW = argv.includes('--preview');
const FRAMES = Number(arg('--frames', 360));
const [W, H] = LAYOUT === 'mobile' ? [1080, 1920] : [1920, 1080];
const SS = Number(arg('--ss', 2));
const OUT = path.join(ROOT, 'build', PREVIEW ? `preview-${LAYOUT}` : `frames-${LAYOUT}`);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

fs.mkdirSync(OUT, { recursive: true });
const url = pathToFileURL(path.join(ROOT, 'render.html')).href +
  `?capture=1&w=${W}&h=${H}&ss=${SS}&layout=${LAYOUT}&frames=${FRAMES}`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 450 });
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exit(1); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 60000 });

const gpu = await page.evaluate(() => {
  const gl = document.getElementById('c').getContext('webgl2');
  const x = gl.getExtension('WEBGL_debug_renderer_info');
  return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'desconocido';
});
console.log(`GPU: ${gpu}`);

const grab = async (n, file, type = 'image/jpeg') => {
  const data = await page.evaluate((f, t) => {
    window.__renderFrame(f);
    return document.getElementById('c').toDataURL(t, 0.95);
  }, n, type);
  fs.writeFileSync(file, Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
};

if (PREVIEW) {
  for (const n of [0, 90, 180, 270]) await grab(n, path.join(OUT, `p${n}.jpg`));
  // Prueba de costura: el cuadro FRAMES debe ser idéntico al 0
  const seam = await page.evaluate((N) => {
    const c = document.getElementById('c'); const gl = c.getContext('webgl2');
    const read = (f) => { window.__renderFrame(f); const a = new Uint8Array(c.width * c.height * 4); gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, a); return a; };
    const a = read(0), b = read(N - 1), z = read(N);
    let diffEnd = 0, diffStep = 0;
    const c0 = read(1);
    for (let i = 0; i < a.length; i += 4) { diffEnd += Math.abs(a[i] - z[i]); diffStep += Math.abs(b[i] - a[i]); }
    let diff01 = 0; for (let i = 0; i < a.length; i += 4) diff01 += Math.abs(a[i] - c0[i]);
    return { frameN_vs_0: diffEnd, lastToFirstStep: diffStep, typicalStep_0to1: diff01 };
  }, FRAMES);
  console.log('costura:', seam);
} else {
  const name = (n) => path.join(OUT, `f${String(n).padStart(4, '0')}.jpg`);
  const t0 = Date.now();
  for (let n = 0; n < FRAMES; n++) {
    if (fs.existsSync(name(n))) continue;
    await grab(n, name(n));
    if (n % 60 === 0) console.log(`  ${n}/${FRAMES}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  console.log(`✓ ${FRAMES} cuadros en ${((Date.now() - t0) / 1000).toFixed(0)}s → ${OUT}`);
}
await browser.close();
