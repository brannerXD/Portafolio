/**
 * Controla la pantalla de carga que vive en index.html (#preloader).
 *
 * Se levanta cuando están listas las fuentes y el póster del hero, con:
 *  · un mínimo, para que la entrada del anillo y el nombre alcance a verse;
 *  · un máximo, para que una red lenta nunca deje a nadie mirando el telón.
 * La barra avanza con esas dos cargas reales y el tiempo transcurrido: no
 * finge medir descargas que no están pasando.
 *
 * Todo con setTimeout, no requestAnimationFrame: rAF no corre en pestañas en
 * segundo plano, y un telón que no se levanta porque la página se abrió en
 * otra pestaña sería una pantalla negra con el sitio detrás.
 *
 * Solo la primera vez por sesión; si el visitante recarga, sale casi al instante.
 */
const MIN_MS = 1500;
const MAX_MS = 3200;
const REPEAT_MS = 250;
const EXIT_MS = 800;
const KEY = 'br-intro-vista';

function posterListo(): Promise<void> {
  const portrait = matchMedia('(max-aspect-ratio: 4/5)').matches;
  const img = new Image();
  img.src = `media/hero/hero-${portrait ? 'mobile-' : ''}poster.webp`;
  return img.decode().catch(() => {});
}

let resolver: () => void = () => {};
/** Se cumple cuando el telón empieza a levantarse: el hero anima su entrada a partir de ahí. */
export const preloaderDone = new Promise<void>((r) => (resolver = r));

export function iniciarPreloader() {
  const el = document.getElementById('preloader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || reduce) { el?.remove(); resolver(); return; }

  let visto = false;
  try { visto = sessionStorage.getItem(KEY) === '1'; } catch { /* modo privado */ }

  const barra = el.querySelector<HTMLElement>('.rail span');
  const t0 = performance.now();
  let listas = 0;
  const tareas = [document.fonts.ready.then(() => {}), posterListo()];
  const avanzar = () => {
    const tiempo = Math.min((performance.now() - t0) / MIN_MS, 1);
    if (barra) barra.style.transform = `scaleX(${Math.min(0.15 + 0.35 * (listas / tareas.length) + 0.5 * tiempo, 1)})`;
  };
  tareas.forEach((t) => t.then(() => { listas++; avanzar(); }));
  const tick = window.setInterval(avanzar, 120);

  const minimo = new Promise((r) => setTimeout(r, visto ? REPEAT_MS : MIN_MS));
  const maximo = new Promise((r) => setTimeout(r, MAX_MS));

  Promise.race([Promise.all([...tareas, minimo]), maximo]).then(() => {
    window.clearInterval(tick);
    if (barra) barra.style.transform = 'scaleX(1)';
    try { sessionStorage.setItem(KEY, '1'); } catch { /* modo privado */ }
    setTimeout(() => {
      el.classList.add('is-leaving');
      resolver();
      setTimeout(() => el.remove(), EXIT_MS);
    }, visto ? 0 : 250);
  });
}
