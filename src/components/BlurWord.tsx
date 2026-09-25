/**
 * Palabra que rota en el titular (el mismo efecto que en Nythera).
 *
 * Cada letra entra desde un desenfoque, escalonada, teñida por un degradado
 * que recorre la palabra: aquí la rampa va de magenta a lila y a cian, los
 * mismos tonos que el anillo de vidrio del loop del hero.
 *
 * La animación es CSS pura, disparada al cambiar la `key` de cada letra: un
 * bucle de rAF con setState por letra volvería a pintar el titular 60 veces
 * por segundo sin ganar nada visible.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { device } from '../lib/media';

const RAMP = ['#E879F9', '#C79BF0', '#A78BFA', '#8B9CF6', '#67E8F9'];
const STAGGER = 45; // ms entre letras
const DURATION = 520; // ms por letra

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];

/** Muestrea la rampa en t (0..1). */
function sample(t: number) {
  const scaled = t * (RAMP.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, RAMP.length - 1);
  const f = scaled - lo;
  const a = hexToRgb(RAMP[lo]!);
  const b = hexToRgb(RAMP[hi]!);
  return `rgb(${a.map((c, i) => Math.round(c + (b[i]! - c) * f)).join(',')})`;
}

export function BlurWord({ words, interval = 2800, start = true }: { words: readonly string[]; interval?: number; start?: boolean }) {
  const [index, setIndex] = useState(0);
  const animate = !device.reduceMotion && words.length > 1;

  useEffect(() => {
    if (!animate || !start) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [animate, start, words.length, interval]);

  const word = words[index] ?? words[0] ?? '';
  const glyphs = [...word];

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Los lectores de pantalla oyen una sola palabra estable, no una lista que parpadea */}
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true">
        {glyphs.map((ch, i) => (
          <span key={`${index}-${i}`} className="inline-block"
            style={{
              color: sample(i / Math.max(glyphs.length - 1, 1)),
              whiteSpace: 'pre',
              animation: animate && start ? `blur-in ${DURATION}ms cubic-bezier(0.22,1,0.36,1) ${i * STAGGER}ms both` : 'none',
            } as CSSProperties}>
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}
