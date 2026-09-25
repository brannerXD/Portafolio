/** Rutas de public/media y capacidades del dispositivo, calculadas una sola vez. */

export const media = (file: string) => `media/${file}`;

const mq = (q: string) => typeof matchMedia === 'function' && matchMedia(q).matches;

// `navigator.connection` todavía no está en los tipos estándar del DOM
type NavigatorConConexion = Navigator & { connection?: { saveData?: boolean } };

export const device = {
  reduceMotion: mq('(prefers-reduced-motion: reduce)'),
  saveData: !!(navigator as NavigatorConConexion).connection?.saveData,
  canHover: mq('(hover: hover) and (pointer: fine)'),
  portrait: mq('(max-aspect-ratio: 4/5)'),
  webm: document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '',
};

/** Recorrido grabado de un proyecto: WebM donde se pueda, MP4 como respaldo (Safari). */
export const tourSrc = (id: string) => media(`${id}-tour.${device.webm ? 'webm' : 'mp4'}`);

/** Loop del hero: vertical en celular, 1080p solo en pantallas grandes. */
export function heroSrc() {
  const big = Math.max(innerWidth, innerHeight) * Math.min(devicePixelRatio, 2) > 1700;
  return media(`hero/hero-${device.portrait ? 'mobile-' : ''}${big ? '1080' : '720'}.${device.webm ? 'webm' : 'mp4'}`);
}

/**
 * Plan B de decodificación: si el navegador no logra decodificar el WebM (pasa
 * con algunos decodificadores por hardware), cambia al MP4; si ese también
 * falla, deja de intentarlo para que quede la imagen fija en vez de un cuadro
 * congelado a medias.
 */
export function onVideoError(e: { currentTarget: HTMLVideoElement }) {
  const v = e.currentTarget;
  if (v.src.endsWith('.webm')) {
    v.src = v.src.replace(/\.webm$/, '.mp4');
    v.play().catch(() => {});
  } else {
    v.removeAttribute('src');
    v.dataset.fallo = '1';
  }
}
