/**
 * Pétalos de cerezo cayendo: el mismo efecto de Nythera, portado para vestir
 * su franja en el portafolio.
 *
 * Es decorativo, así que no importa que se congele en una pestaña de fondo
 * (rAF no corre ahí). Con "reducir movimiento" los pétalos se dibujan una vez
 * y se quedan quietos; en equipos con pocos núcleos se dibuja la mitad.
 */
import { useEffect, useRef } from 'react';
import { device } from '../lib/media';

interface Petal {
  x: number; y: number; vy: number; drift: number;
  rot: number; vrot: number; size: number; alpha: number;
  sway: number; swaySpeed: number; hue: number;
}

/** Tonos tomados de las flores del logo de Nythera. */
const HUES = [346, 340, 332, 322, 310];
const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;

function makePetal(w: number, h: number, seeded: boolean): Petal {
  return {
    x: Math.random() * w,
    // Al llenar por primera vez se reparten por toda la caja para que no empiece vacía
    y: seeded ? Math.random() * h : -20 - Math.random() * 60,
    vy: 0.18 + Math.random() * 0.42,
    drift: (Math.random() - 0.5) * 0.34,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.02,
    size: 3 + Math.random() * 4.5,
    alpha: 0.18 + Math.random() * 0.42,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.006 + Math.random() * 0.014,
    hue: HUES[Math.floor(Math.random() * HUES.length)]!,
  };
}

export function PetalDrift() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!host || !canvas || !ctx) return;

    const still = device.reduceMotion;
    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let raf = 0;
    let running = true;

    const count = () => {
      const base = w < 700 ? 14 : 30;
      return lowPower ? Math.round(base / 2) : base;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsla(${p.hue} 62% 78% / ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const build = () => {
      const rect = host.getBoundingClientRect();
      // Son manchas rosadas suaves: a 1x nadie nota la diferencia y cuesta mucho menos
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      petals = Array.from({ length: count() }, () => makePetal(w, h, true));
      if (still) draw();
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      for (const p of petals) {
        p.sway += p.swaySpeed;
        p.y += p.vy;
        p.x += p.drift + Math.sin(p.sway) * 0.42;
        p.rot += p.vrot;
        // Se reciclan al salir por abajo o por los lados en vez de crear nuevos
        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) Object.assign(p, makePetal(w, h, false));
      }
      draw();
    };

    build();

    // Solo se reconstruye con un cambio de tamaño real, no con ruido de subpíxeles
    let lastW = w;
    let lastH = h;
    const ro = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      if (Math.abs(rect.width - lastW) < 24 && Math.abs(rect.height - lastH) < 24) return;
      lastW = Math.round(rect.width);
      lastH = Math.round(rect.height);
      build();
    });
    ro.observe(host);

    // Fuera de pantalla no se anima
    const io = new IntersectionObserver(([e]) => { running = !!e?.isIntersecting; });
    io.observe(host);

    if (!still) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {/* Los pétalos entran y salen con un fundido en vez de aparecer de golpe en los bordes */}
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-bg)_0%,transparent_18%,transparent_78%,var(--color-bg)_100%)]" />
    </div>
  );
}
