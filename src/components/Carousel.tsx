/**
 * Carrusel para celular; grilla normal desde `sm`.
 *
 * En celular la fila se desliza con snap y muestra dónde estás: puntos,
 * contador y botones anterior/siguiente. Un desvanecido en el borde derecho
 * avisa que hay más y desaparece al llegar al final. Con el foco en la fila,
 * las flechas del teclado también mueven el carrusel.
 */
import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

interface Props {
  label: string;
  /** Clases de la grilla desde `sm` (p. ej. "sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"). */
  grid: string;
  children: ReactNode;
}

const arrow = 'grid size-10 cursor-pointer place-items-center rounded-full border border-line text-ink transition-colors hover:border-line-strong disabled:cursor-default disabled:opacity-30';

export function Carousel({ label, grid, children }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  // Índice visible a partir del scroll (throttled con rAF)
  const sync = useCallback(() => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
    setActive(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, [items.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); };
    el.addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    sync();
    return () => { el.removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [sync]);

  const go = (i: number) => {
    const el = track.current;
    const target = el?.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined;
    if (!el || !target) return;
    // scroll-padding del carril: se alinea el elemento con el margen izquierdo
    el.scrollTo({ left: target.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).scrollPaddingLeft || '0'), behavior: 'smooth' });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
  };

  return (
    <div className="min-w-0">
      <div ref={track} role="region" aria-roledescription="carrusel" aria-label={label} tabIndex={0} onKeyDown={onKey}
        className={`carousel transition-[mask-image] ${atEnd ? '' : 'max-sm:[mask-image:linear-gradient(90deg,#000_82%,transparent)]'} ${grid}`}>
        {items}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-between gap-4 sm:hidden">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted tabular-nums" aria-live="polite">{active + 1} / {items.length}</span>
            <div className="flex gap-1.5" aria-hidden="true">
              {items.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-ink' : 'w-1.5 bg-line-strong'}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className={arrow} aria-label="Anterior" disabled={active === 0} onClick={() => go(active - 1)}>←</button>
            <button type="button" className={arrow} aria-label="Siguiente" disabled={atEnd} onClick={() => go(active + 1)}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
