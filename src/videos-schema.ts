/**
 * Validación de src/videos.json. Sin dependencias ni DOM: la usan la página,
 * el panel y el servidor del panel (tools/panel-plugin.ts).
 *
 * El JSON lo escribe el panel, pero también se puede editar a mano; si algo
 * queda mal, esto dice exactamente qué y dónde en vez de romper la página.
 */
import type { Video } from './types';

const ID = /^[a-z0-9][a-z0-9-]*$/;

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x);

export class VideosInvalidos extends Error {
  constructor(public readonly problemas: string[]) {
    super(`videos.json tiene ${problemas.length} problema(s):\n- ${problemas.join('\n- ')}`);
    this.name = 'VideosInvalidos';
  }
}

/** Devuelve los problemas de un video; lista vacía si está bien. */
export function problemasDeVideo(x: unknown, donde = 'video'): string[] {
  if (!isObj(x)) return [`${donde}: no es un objeto`];
  const p: string[] = [];
  const str = (k: string, requerido = true) => {
    if (x[k] === undefined && !requerido) return;
    if (typeof x[k] !== 'string' || (requerido && !(x[k] as string).trim())) p.push(`${donde}: "${k}" debe ser texto${requerido ? ' no vacío' : ''}`);
  };
  const bool = (k: string, requerido = true) => {
    if (x[k] === undefined && !requerido) return;
    if (typeof x[k] !== 'boolean') p.push(`${donde}: "${k}" debe ser true o false`);
  };
  str('id');
  if (typeof x.id === 'string' && !ID.test(x.id)) p.push(`${donde}: "id" solo admite minúsculas, números y guiones (${x.id})`);
  str('titulo');
  str('tipo', false);
  str('texto', false);
  if (!Array.isArray(x.datos) || !x.datos.every((d) => typeof d === 'string')) p.push(`${donde}: "datos" debe ser una lista de textos`);
  bool('sonido');
  bool('destacado');
  bool('vertical', false);
  str('original', false);
  return p;
}

/** Valida la lista completa (incluye ids repetidos y más de un destacado). */
export function parseVideos(raw: unknown): Video[] {
  if (!Array.isArray(raw)) throw new VideosInvalidos(['la raíz debe ser una lista []']);
  const problemas = raw.flatMap((v, i) => problemasDeVideo(v, `video #${i + 1}${isObj(v) && typeof v.id === 'string' ? ` (${v.id})` : ''}`));
  const ids = raw.filter(isObj).map((v) => v.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (repetidos.length) problemas.push(`ids repetidos: ${[...new Set(repetidos)].join(', ')}`);
  if (raw.filter((v) => isObj(v) && v.destacado === true).length > 1) problemas.push('hay más de un video destacado; solo puede haber uno');
  if (problemas.length) throw new VideosInvalidos(problemas);
  return raw.map((v: Obj) => ({ tipo: '', texto: '', ...v }) as Video);
}

/** El destacado primero; el resto, en el orden del panel. */
export const ordenarVideos = (lista: readonly Video[]): Video[] =>
  [...lista.filter((v) => v.destacado), ...lista.filter((v) => !v.destacado)];
