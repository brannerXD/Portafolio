/**
 * Botones de redes. Patrón tomado de Uiverse (MIT): un cuadrado con el ícono
 * que al pasar el cursor se estira, muestra el usuario y deja una "cola" en
 * rombo que lo convierte en globo de diálogo.
 *   GitHub     → uiverse.io/charlie_4212/tricky-bobcat-68
 *   LinkedIn   → uiverse.io/Javierrocadev/slimy-eagle-32
 *   Instagram  → uiverse.io/ParasSalunke/curly-husky-54
 * Correo, X y Discord siguen el mismo patrón; el correo con los morados del sitio.
 *
 * En pantallas táctiles no hay hover: el botón queda como ícono con su
 * etiqueta accesible, y un toque abre el perfil.
 */
import type { CSSProperties } from 'react';
import type { Red } from '../types';

interface Marca {
  nombre: string;
  /** Fondo del botón y de su cola en reposo / al pasar el cursor. */
  bg: string;
  bgHover: string;
  viewBox: string;
  path: string;
  /** Ancho expandido; el correo necesita más espacio que un usuario. */
  ancho?: string;
  /** Color sólido de la cola cuando el fondo es degradado (un rombo pequeño no puede repetir el degradado). */
  cola?: string;
  colaHover?: string;
}

const MARCAS: Record<Red['id'], Marca> = {
  email: {
    nombre: 'Correo', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', bgHover: 'linear-gradient(135deg,#8b5cf6,#c084fc)', viewBox: '0 0 24 24', ancho: '17rem', cola: '#a855f7', colaHover: '#c084fc',
    path: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2.3.5 6.1 5.2c.35.3.85.3 1.2 0L18.7 6H5.3ZM19 7.6l-5.1 4.35a2.9 2.9 0 0 1-3.8 0L5 7.6V18.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V7.6Z',
  },
  github: {
    nombre: 'GitHub', bg: '#1f1a2b', bgHover: '#2c2540', viewBox: '0 0 24 24',
    path: 'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.55v-1.94c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.26 3.38.96.1-.76.4-1.26.72-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.28 1.2-3.08-.12-.3-.52-1.5.12-3.1 0 0 .98-.32 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.18 3.2-1.18.64 1.6.24 2.8.12 3.1.75.8 1.2 1.82 1.2 3.08 0 4.44-2.7 5.4-5.28 5.68.4.34.76 1.02.76 2.06v3.05c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z',
  },
  linkedin: {
    nombre: 'LinkedIn', bg: '#0369a1', bgHover: '#0284c7', viewBox: '0 0 100 100',
    path: 'M92.86,0H7.12A7.17,7.17,0,0,0,0,7.21V92.79A7.17,7.17,0,0,0,7.12,100H92.86A7.19,7.19,0,0,0,100,92.79V7.21A7.19,7.19,0,0,0,92.86,0ZM30.22,85.71H15.4V38H30.25V85.71ZM22.81,31.47a8.59,8.59,0,1,1,8.6-8.59A8.6,8.6,0,0,1,22.81,31.47Zm63,54.24H71V62.5c0-5.54-.11-12.66-7.7-12.66s-8.91,6-8.91,12.26V85.71H39.53V38H53.75v6.52H54c2-3.75,6.83-7.7,14-7.7,15,0,17.79,9.89,17.79,22.74Z',
  },
  instagram: {
    nombre: 'Instagram', bg: 'linear-gradient(90deg,#a855f7,#ec4899,#f97316)', bgHover: 'linear-gradient(90deg,#b56ef9,#f064a8,#fb8a3c)', viewBox: '0 0 24 24', cola: '#db2777', colaHover: '#ec4899',
    path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
  },
  x: {
    nombre: 'X', bg: '#000000', bgHover: '#18181b', viewBox: '0 0 24 24',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  discord: {
    nombre: 'Discord', bg: '#5865f2', bgHover: '#6d78f5', viewBox: '0 0 24 24',
    path: 'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
  },
};

function SocialButton({ red }: { red: Red }) {
  const m = MARCAS[red.id];
  // Colores por variable CSS: así el botón y su cola comparten el mismo fondo
  const vars = { '--s-bg': m.bg, '--s-bg-hover': m.bgHover, '--s-w': m.ancho ?? '11rem', '--s-tail': m.cola ?? m.bg, '--s-tail-hover': m.colaHover ?? m.bgHover } as CSSProperties;
  return (
    <a href={red.href} {...(red.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})} aria-label={`${m.nombre}: ${red.usuario}`} style={vars}
      className="group relative isolate flex h-12 w-12 items-center justify-start gap-2 rounded p-2 pr-6 font-bold text-neutral-50 no-underline
        shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_10px_24px_rgb(0_0_0/0.35)] ring-1 ring-white/12 [background:var(--s-bg)]
        transition-[width,background] duration-700 hover:w-(--s-w) hover:[background:var(--s-bg-hover)] focus-visible:w-(--s-w)
        before:absolute before:left-8 before:-z-10 before:h-6 before:w-6 before:rotate-45 before:content-[''] before:[background:var(--s-tail)]
        before:transition-[left,background] before:duration-700 hover:before:left-[calc(var(--s-w)-1rem)] hover:before:[background:var(--s-tail-hover)] focus-visible:before:left-[calc(var(--s-w)-1rem)]">
      <svg viewBox={m.viewBox} aria-hidden="true" className="h-8 w-8 shrink-0 fill-neutral-50">
        <path d={m.path} />
      </svg>
      <span aria-hidden="true"
        className="inline-flex origin-left scale-x-0 border-l-2 px-1 text-[15px] whitespace-nowrap opacity-0 transition-all duration-100
          group-hover:scale-x-100 group-hover:opacity-100 group-hover:delay-500 group-hover:duration-300
          group-focus-visible:scale-x-100 group-focus-visible:opacity-100 group-focus-visible:delay-500 group-focus-visible:duration-300">
        {red.usuario}
      </span>
    </a>
  );
}

export function SocialLinks({ redes }: { redes: readonly Red[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-3" aria-label="Redes">
      {redes.map((r) => <li key={r.id}><SocialButton red={r} /></li>)}
    </ul>
  );
}
