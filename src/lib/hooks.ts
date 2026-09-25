import { useEffect, useState } from 'react';
import { preloaderDone } from './preloader';

/**
 * Hace aparecer cada `.reveal` cuando entra en pantalla (una sola vez).
 * Espera a que se levante la pantalla de carga: así la entrada del hero se ve
 * en vez de ocurrir escondida detrás del telón.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    let cancelado = false;
    void preloaderDone.then(() => {
      if (cancelado) return;
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io?.unobserve(e.target);
        }
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal').forEach((el) => io?.observe(el));
    });
    return () => { cancelado = true; io?.disconnect(); };
  }, []);
}

/** true desde que la pantalla de carga empieza a levantarse. */
export function usePreloaderDone() {
  const [done, setDone] = useState(false);
  useEffect(() => { void preloaderDone.then(() => setDone(true)); }, []);
  return done;
}

/** Id de la sección que ocupa el centro de la pantalla, para marcar el menú. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  return active;
}
