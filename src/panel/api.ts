/** Cliente del servidor del panel (tools/panel-plugin.ts). */
import type { Video } from '../types';
import { parseVideos } from '../videos-schema';

const API = '/__panel/api';

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, opts);
  const body: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Error ${res.status}`);
  return body as T;
}
const send = <T>(path: string, method: string, data: unknown) =>
  api<T>(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

export interface NuevoVideo {
  titulo: string; tipo: string; texto: string; datos: string[];
  sonido: boolean; destacado: boolean; portada: number;
}
export type Cambios = Omit<NuevoVideo, 'portada'> & { portada: number | null };

export const listar = async () => parseVideos(await api<unknown>('/videos'));
export const ordenar = (ids: string[]) => send<unknown>('/videos/orden', 'POST', { ids });
export const quitar = (id: string) => api<unknown>(`/videos/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const editar = (id: string, c: Cambios) => send<Video>(`/videos/${encodeURIComponent(id)}`, 'PUT', c);
export const crear = (file: string, v: NuevoVideo) => send<Video>('/videos', 'POST', { file, ...v });

/** Sube el archivo tal cual, informando el progreso (fetch no lo reporta). */
export function subir(file: File, onProgress: (pct: number) => void): Promise<string> {
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/upload?ext=${encodeURIComponent(ext)}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status < 300 ? resolve((JSON.parse(xhr.responseText) as { file: string }).file) : reject(new Error(`Error ${xhr.status} al subir`)));
    xhr.onerror = () => reject(new Error('Se perdió la conexión con el servidor local'));
    xhr.send(file);
  });
}

export const datosDe = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
export const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
