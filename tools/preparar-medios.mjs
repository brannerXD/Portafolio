/**
 * Convierte el material crudo en los archivos livianos que usa el sitio.
 *
 *   node tools/preparar-medios.mjs          → sitios + videos
 *   node tools/preparar-medios.mjs sitios   → solo capturas y recorridos
 *   node tools/preparar-medios.mjs videos   → solo la sección de video
 *
 * Todo sale en public/media/. Los videos largos nunca se precargan en el sitio
 * (preload="none"): lo que pesa de verdad en la primera carga son los pósters.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'tools', '.raw');
const OUT = path.join(ROOT, 'public', 'media');
const DEV = 'C:/Dev';
fs.mkdirSync(OUT, { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const o = (f) => path.join(OUT, f);

/* ---------- Sitios: capturas + recorrido ---------- */
function sitios() {
  for (const id of fs.readdirSync(RAW)) {
    const dir = path.join(RAW, id);
    if (fs.existsSync(path.join(dir, 'desk.png'))) {
      ff(['-i', path.join(dir, 'desk.png'), '-c:v', 'libwebp', '-quality', '80', o(`${id}-desk.webp`)]);
      ff(['-i', path.join(dir, 'desk.png'), '-vf', 'scale=720:-1:flags=lanczos', '-c:v', 'libwebp', '-quality', '78', o(`${id}-desk-720.webp`)]);
    }
    if (fs.existsSync(path.join(dir, 'mobile.png'))) {
      ff(['-i', path.join(dir, 'mobile.png'), '-vf', 'scale=390:-1:flags=lanczos', '-c:v', 'libwebp', '-quality', '80', o(`${id}-mobile.webp`)]);
    }
    if (fs.existsSync(path.join(dir, 'mobile-2.png'))) {
      ff(['-i', path.join(dir, 'mobile-2.png'), '-vf', 'scale=390:-1:flags=lanczos', '-c:v', 'libwebp', '-quality', '80', o(`${id}-mobile-2.webp`)]);
    }
    const tour = path.join(dir, 'tour.webm');
    if (fs.existsSync(tour)) {
      // El screencast sale con fps variable: se fija a 30. Web: 960×600. App (sin desk.png): vertical 390×844.
      const app = !fs.existsSync(path.join(dir, 'desk.png'));
      const [w, h] = app ? [390, 844] : [960, 600];
      const vf = `fps=30,scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h},format=yuv420p`;
      ff(['-i', tour, '-vf', vf, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', o(`${id}-tour.mp4`)]);
      ff(['-i', tour, '-vf', vf, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', o(`${id}-tour.webm`)]);
    }
    console.log(`  sitio ${id} ✓`);
  }
}

/* ---------- Sección de video ---------- */
// audio: false cuando la música no tiene licencia para publicarse
const VIDEOS = [
  { id: 'zeno', src: `${DEV}/VideoF1/out/zeno_divergent_60s.mp4`, poster: 14, audio: false },
  { id: 'hexor-video', src: `${DEV}/Hexor Labs/hexor-labs-recorrido.mp4`, poster: 2, audio: false },
];

function videos() {
  for (const v of VIDEOS) {
    const vf = 'fps=30,scale=1280:-2:flags=lanczos,format=yuv420p';
    const audio = v.audio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an'];
    ff(['-i', v.src, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'high', ...audio, '-movflags', '+faststart', o(`${v.id}.mp4`)]);
    ff(['-ss', String(v.poster), '-i', v.src, '-frames:v', '1', '-vf', 'scale=1280:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '80', o(`${v.id}-poster.webp`)]);
    console.log(`  video ${v.id} ✓`);
  }
}

const what = process.argv[2];
if (!what || what === 'sitios') sitios();
if (!what || what === 'videos') videos();

let total = 0;
for (const f of fs.readdirSync(OUT).sort()) {
  const s = fs.statSync(o(f)).size; total += s;
  console.log(`  ${f.padEnd(26)} ${(s / 1048576).toFixed(2)} MB`);
}
console.log(`  total ${(total / 1048576).toFixed(1)} MB`);
