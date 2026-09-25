/**
 * Codifica los cuadros en los formatos que usa el hero.
 *
 *   node encode.mjs                   → escritorio
 *   node encode.mjs --layout mobile   → vertical
 *
 * Los cuadros se renderizan al doble de tamaño y aquí se reducen con lanczos:
 * es el antialiasing del anillo y de los hilos finos.
 * aq-mode=3 reparte bits hacia las zonas oscuras, que es donde un degradado
 * morado casi negro se rompe en bandas.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv;
const LAYOUT = argv.includes('--layout') ? argv[argv.indexOf('--layout') + 1] : 'desk';
const FPS = 30;
const IN = path.join(ROOT, 'build', `frames-${LAYOUT}`, 'f%04d.jpg');
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const sizes = LAYOUT === 'mobile'
  ? [{ tag: 'mobile-1080', w: 1080, h: 1920 }, { tag: 'mobile-720', w: 720, h: 1280 }]
  : [{ tag: '1080', w: 1920, h: 1080 }, { tag: '720', w: 1280, h: 720 }];

const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

for (const { tag, w, h } of sizes) {
  // Los cuadros son JPEG (rango completo). El video web va en rango limitado BT.709: con rango
  // completo, decodificadores por hardware (p. ej. Chrome + AMD) fallan y el loop se congela.
  const vf = `scale=${w}:${h}:flags=lanczos:in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p`;
  const color = ['-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];

  run(['-framerate', String(FPS), '-i', IN, '-vf', vf,
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', tag.endsWith('720') ? '24' : '22',
    '-profile:v', 'high', '-tune', 'film', ...color,
    '-x264-params', `aq-mode=3:keyint=${FPS * 2}:scenecut=0`,
    '-an', '-movflags', '+faststart',
    path.join(OUT, `hero-${tag}.mp4`)]);

  run(['-framerate', String(FPS), '-i', IN, '-vf', vf,
    '-c:v', 'libvpx-vp9', ...color, '-b:v', '0', '-crf', tag.endsWith('720') ? '36' : '33',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-g', String(FPS * 2),
    '-an', path.join(OUT, `hero-${tag}.webm`)]);
}

// Póster: el primer cuadro, para mostrar mientras carga el video
const [first] = sizes;
run(['-i', IN.replace('%04d', '0000'), '-vf', `scale=${first.w}:${first.h}:flags=lanczos`,
  '-c:v', 'libwebp', '-quality', '82', path.join(OUT, `hero-${LAYOUT === 'mobile' ? 'mobile-' : ''}poster.webp`)]);

for (const f of fs.readdirSync(OUT).sort()) {
  console.log(`  ${f.padEnd(28)} ${(fs.statSync(path.join(OUT, f)).size / 1048576).toFixed(2)} MB`);
}
