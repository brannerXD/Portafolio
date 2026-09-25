/**
 * Servidor del panel de videos (Node.js, solo en `npm run dev`).
 *
 * Vite lo monta como middleware en /__panel/api. No existe en el sitio
 * publicado: `apply: 'serve'` lo deja fuera de `vite build`, y el servidor de
 * desarrollo solo escucha en localhost.
 *
 * Los videos viven en src/videos.json; los archivos, en public/media/.
 * Los originales subidos se guardan en tools/.raw/uploads/ por si hay que
 * volver a codificarlos. El mismo validador de la página (src/videos-schema.ts)
 * revisa el JSON antes de escribirlo.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { Video } from '../src/types';
import { parseVideos, VideosInvalidos } from '../src/videos-schema';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src', 'videos.json');
const MEDIA = path.join(ROOT, 'public', 'media');
const UPLOADS = path.join(ROOT, 'tools', '.raw', 'uploads');
const API = '/__panel/api';

const readVideos = (): Video[] => parseVideos(JSON.parse(fs.readFileSync(DATA, 'utf8')));
const writeVideos = (list: Video[]) => {
  parseVideos(list); // nunca se escribe un JSON que la página no pueda leer
  fs.writeFileSync(DATA, JSON.stringify(list, null, 2) + '\n');
};

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'video';

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0 ? resolve(out) : reject(new Error(err.split('\n').slice(-4).join(' ') || `${cmd} salió con ${code}`)));
  });
}

interface Info { duracion: number; ancho: number; alto: number; audio: boolean }

async function probe(file: string): Promise<Info> {
  const out = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', file]);
  const j = JSON.parse(out) as { format: { duration: string }; streams: { codec_type: string; width?: number; height?: number }[] };
  const v = j.streams.find((s) => s.codec_type === 'video');
  return { duracion: Number(j.format.duration), ancho: v?.width ?? 0, alto: v?.height ?? 0, audio: j.streams.some((s) => s.codec_type === 'audio') };
}

async function poster(src: string, id: string, t: number, info: Info) {
  const at = Math.max(0, Math.min(t, info.duracion - 0.1));
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(at), '-i', src, '-frames:v', '1',
    '-vf', 'scale=1280:1280:force_original_aspect_ratio=decrease:flags=lanczos', '-c:v', 'libwebp', '-quality', '80',
    path.join(MEDIA, `${id}-poster.webp`)]);
}

async function encode(src: string, id: string, sonido: boolean, portada: number): Promise<Info> {
  const info = await probe(src);
  // Máximo 1280 px del lado largo, dimensiones pares, 30 fps
  // Siempre a rango limitado BT.709: un video en rango completo (p. ej. exportado desde JPEG o
  // algunas apps) hace fallar decodificadores por hardware y queda congelado en el navegador.
  const vf = 'fps=30,scale=1280:1280:force_original_aspect_ratio=decrease:flags=lanczos:out_range=tv:out_color_matrix=bt709,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p';
  const color = ['-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];
  const audio = sonido && info.audio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an'];
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-vf', vf,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'high', ...color, ...audio,
    '-movflags', '+faststart', path.join(MEDIA, `${id}.mp4`)]);
  await poster(src, id, portada, info);
  return info;
}

const autoDatos = (info: Info) => [`${Math.round(info.duracion)} s`, ...(info.alto > info.ancho ? ['Vertical'] : [])];

const json = (res: ServerResponse, code: number, body: unknown) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};
const readBody = <T>(req: IncomingMessage) => new Promise<T>((resolve, reject) => {
  let s = '';
  req.on('data', (d) => (s += d));
  req.on('end', () => { try { resolve((s ? JSON.parse(s) : {}) as T); } catch { reject(new Error('El cuerpo no es JSON válido')); } });
});

interface NuevoVideo {
  file?: string; titulo?: string; tipo?: string; texto?: string; datos?: string[];
  sonido?: boolean; destacado?: boolean; portada?: number;
}
type Cambios = Partial<Pick<Video, 'titulo' | 'tipo' | 'texto' | 'datos' | 'sonido' | 'destacado'>> & { portada?: number | null };

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const [recurso, id] = url.pathname.split('/').filter(Boolean);

  // Subida del archivo original: el cuerpo es el archivo tal cual
  if (req.method === 'POST' && recurso === 'upload') {
    const ext = (url.searchParams.get('ext') ?? 'mp4').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'mp4';
    const file = `${Date.now()}.${ext}`;
    await new Promise<void>((resolve, reject) => {
      const ws = fs.createWriteStream(path.join(UPLOADS, file));
      req.pipe(ws);
      ws.on('finish', resolve);
      ws.on('error', reject);
    });
    return json(res, 200, { file });
  }

  if (recurso !== 'videos') return json(res, 404, { error: 'Ruta desconocida' });
  const list = readVideos();

  if (req.method === 'GET') return json(res, 200, list);

  if (req.method === 'POST' && id === 'orden') {
    const { ids } = await readBody<{ ids: string[] }>(req);
    const ordenados = ids.map((x) => list.find((v) => v.id === x)).filter((v): v is Video => !!v);
    writeVideos([...ordenados, ...list.filter((v) => !ids.includes(v.id))]);
    return json(res, 200, readVideos());
  }

  if (req.method === 'POST' && !id) {
    const b = await readBody<NuevoVideo>(req);
    if (!b.file || !b.titulo?.trim()) return json(res, 400, { error: 'Falta el archivo o el título' });
    let nuevoId = slug(b.titulo);
    while (list.some((v) => v.id === nuevoId)) nuevoId += '-2';
    const src = path.join(UPLOADS, path.basename(b.file));
    if (!fs.existsSync(src)) return json(res, 400, { error: 'No encuentro el archivo subido' });
    const info = await encode(src, nuevoId, !!b.sonido, Number(b.portada ?? 1));
    const entry: Video = {
      id: nuevoId,
      titulo: b.titulo.trim(),
      tipo: b.tipo?.trim() ?? '',
      texto: b.texto?.trim() ?? '',
      datos: b.datos?.length ? b.datos : autoDatos(info),
      sonido: !!b.sonido && info.audio,
      destacado: !!b.destacado,
      vertical: info.alto > info.ancho,
      original: path.basename(b.file),
    };
    if (entry.destacado) list.forEach((v) => (v.destacado = false));
    writeVideos([entry, ...list]);
    return json(res, 200, entry);
  }

  const i = list.findIndex((v) => v.id === id);
  const actual = list[i];
  if (!actual) return json(res, 404, { error: 'No existe ese video' });

  if (req.method === 'PUT') {
    const b = await readBody<Cambios>(req);
    const { portada, ...campos } = b;
    Object.assign(actual, campos);
    if (campos.destacado) list.forEach((v, j) => { if (j !== i) v.destacado = false; });
    // Nueva portada: se toma del original si existe, si no del video publicado
    if (typeof portada === 'number') {
      const src = actual.original ? path.join(UPLOADS, actual.original) : path.join(MEDIA, `${actual.id}.mp4`);
      await poster(src, actual.id, portada, await probe(src));
    }
    writeVideos(list);
    return json(res, 200, actual);
  }

  if (req.method === 'DELETE') {
    list.splice(i, 1);
    for (const f of [`${actual.id}.mp4`, `${actual.id}-poster.webp`]) fs.rmSync(path.join(MEDIA, f), { force: true });
    writeVideos(list);
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: 'Método no permitido' });
}

export default function panelPlugin(): Plugin {
  return {
    name: 'panel-videos',
    apply: 'serve',
    configureServer(server) {
      fs.mkdirSync(UPLOADS, { recursive: true });
      server.middlewares.use(API, (req, res) => {
        handle(req, res).catch((e: unknown) =>
          json(res, e instanceof VideosInvalidos ? 422 : 500, { error: e instanceof Error ? e.message : String(e) }));
      });
    },
  };
}

/** Falla el build si src/videos.json está mal formado, en vez de publicar una página rota. */
export function validarVideos(): Plugin {
  return {
    name: 'validar-videos',
    buildStart() {
      readVideos();
    },
  };
}
