import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { proyectos } from '../data';
import { device, media, onVideoError, tourSrc } from '../lib/media';
import type { Proyecto, Tema } from '../types';

/**
 * La franja de cada proyecto se viste con los colores del sitio que presenta:
 * redefine los tokens de Tailwind (bg, ink, line…) solo dentro de ella, así
 * que todo lo de adentro —textos, etiquetas, marcos, enlaces— se adapta solo.
 */
const temaVars = (t: Tema) => ({
  '--color-bg': t.bg,
  '--color-bg-2': t.bg2,
  '--color-ink': t.ink,
  '--color-ink-2': t.ink2,
  '--color-muted': t.muted,
  '--color-lilac': t.acento,
  '--color-line': `color-mix(in oklab, ${t.ink} 14%, transparent)`,
  '--color-line-strong': `color-mix(in oklab, ${t.ink} 38%, transparent)`,
  '--sombra': t.claro ? 'rgb(0 0 0 / 0.28)' : 'rgb(0 0 0 / 0.8)',
  '--marco': `color-mix(in oklab, ${t.ink} 16%, ${t.bg})`,
}) as CSSProperties;
import { PetalDrift } from './PetalDrift';
import { usePlayer } from './Player';

/** Oculta el marco de una captura que no existe en vez de mostrar una imagen rota. */
const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  ((img.closest('[data-frame]') as HTMLElement | null) ?? img).style.visibility = 'hidden';
};

const Badge = () =>
  device.canHover ? (
    <span aria-hidden="true" className="absolute top-3.5 right-3.5 z-10 hidden rounded-full bg-bg/80 px-3 py-2 text-xs font-semibold tracking-[0.04em] text-ink transition-opacity duration-400 group-data-playing:opacity-0 sm:block">
      ▶ Recorrido
    </span>
  ) : null;

/** Video del recorrido que corre dentro de la pantalla mientras el cursor está encima. */
const TourVideo = ({ refVideo }: { refVideo: React.RefObject<HTMLVideoElement | null> }) => (
  <video ref={refVideo} muted loop playsInline preload="none" aria-hidden="true" onError={onVideoError}
    className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-500 ease-soft group-data-playing:opacity-100" />
);

const phoneFrame = 'overflow-hidden border-(--marco) bg-bg-2 shadow-[0_30px_60px_-10px_var(--sombra)] aspect-[390/844]';

function WebVisual({ p, flip, refVideo }: { p: Proyecto; flip: boolean; refVideo: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <div className="relative pb-[6%]">
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg-2 shadow-[0_30px_60px_-24px_var(--sombra)] transition-[transform,box-shadow] duration-700 ease-soft group-hover:-translate-y-1.5 group-hover:shadow-[0_40px_70px_-20px_var(--sombra)] sm:rounded-2xl">
        <div className="flex h-6 items-center gap-[7px] border-b border-white/7 bg-white/4 px-3.5 sm:h-[34px]">
          {[0, 1, 2].map((i) => <i key={i} className="size-2.5 rounded-full bg-white/16" />)}
          <span className="ml-2.5 hidden text-xs tracking-[0.02em] text-muted sm:inline">{p.nombre}</span>
        </div>
        <div className="relative aspect-[1440/900] bg-bg-2">
          <img src={media(`${p.id}-desk-720.webp`)} srcSet={`${media(`${p.id}-desk-720.webp`)} 720w, ${media(`${p.id}-desk.webp`)} 1440w`}
            sizes="(max-width: 768px) 92vw, 58vw" alt={`Captura de ${p.nombre}`} width={1440} height={900}
            loading="lazy" decoding="async" onError={hideOnError}
            className="absolute inset-0 size-full object-cover object-top" />
          <TourVideo refVideo={refVideo} />
          <Badge />
        </div>
      </div>
      {(
        <div data-frame className={`${phoneFrame} absolute bottom-0 w-[24%] rounded-[14px] border-[3px] transition-transform duration-700 ease-soft group-hover:-translate-y-3.5 group-hover:-rotate-[1.5deg] sm:w-[23%] sm:rounded-[22px] sm:border-[5px] ${flip ? 'right-[2%] md:right-auto md:-left-[3%]' : 'right-[2%] md:-right-[3%]'}`}>
          <img src={media(`${p.id}-mobile.webp`)} alt={`Versión móvil de ${p.nombre}`} width={390} height={844}
            loading="lazy" decoding="async" onError={hideOnError} className="size-full object-cover object-top" />
        </div>
      )}
    </div>
  );
}

function AppVisual({ p, refVideo }: { p: Proyecto; refVideo: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <div className="flex items-end justify-center pt-[2%] pb-[4%]">
      <div data-frame className={`${phoneFrame} relative z-10 w-[52%] rounded-[26px] border-[5px] transition-transform duration-700 ease-soft group-hover:-translate-y-2.5 md:w-[min(46%,300px)] md:rounded-[34px] md:border-[7px]`}>
        <img src={media(`${p.id}-mobile.webp`)} alt={`Pantalla de ${p.nombre}`} width={390} height={844}
          loading="lazy" decoding="async" onError={hideOnError} className="absolute inset-0 size-full object-cover object-top" />
        <TourVideo refVideo={refVideo} />
        <Badge />
      </div>
      <div data-frame className={`${phoneFrame} -ml-[12%] mb-[6%] w-[42%] rotate-6 rounded-[22px] border-[5px] opacity-75 transition-transform duration-700 ease-soft group-hover:translate-x-2.5 group-hover:rotate-8 md:w-[min(38%,240px)]`}>
        <img src={media(`${p.id}-mobile-2.webp`)} alt="" width={390} height={844}
          loading="lazy" decoding="async" onError={hideOnError} className="size-full object-cover object-top" />
      </div>
    </div>
  );
}

const linkOut = 'border-b border-transparent pb-1 text-[15px] font-semibold text-ink-2 no-underline transition-colors duration-300 hover:border-lilac hover:text-lilac';

function ProjectCard({ p, index }: { p: Proyecto; index: number }) {
  const play = usePlayer();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const flip = index % 2 === 1;
  const openTour = () => play(tourSrc(p.id), `Recorrido · ${p.nombre}`);

  // Escritorio: el recorrido corre en la propia pantalla al pasar el cursor
  const hover = device.canHover && !device.reduceMotion ? {
    onMouseEnter: () => {
      const v = video.current;
      if (!v) return;
      if (!v.src) v.src = tourSrc(p.id);
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => {});
    },
    onMouseLeave: () => { video.current?.pause(); setPlaying(false); },
  } : {};

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTour(); }
  };

  return (
    <article aria-labelledby={`p-${p.id}`} data-playing={playing || undefined} style={temaVars(p.tema)}
      className="group relative isolate ml-[calc(50%-50vw)] w-screen overflow-hidden bg-bg text-ink">
      {p.efecto === 'petalos' && <PetalDrift />}
      <div className={`reveal relative mx-auto grid max-w-[1240px] items-center gap-6 px-4 py-16 sm:px-[clamp(16px,5vw,72px)] md:gap-[clamp(24px,4vw,64px)] md:py-[clamp(72px,9vw,120px)] ${flip ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]' : 'md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'}`}>
      <div role="button" tabIndex={0} aria-label={`Ver el recorrido de ${p.nombre}`} onClick={openTour} onKeyDown={onKey} {...hover}
        className={`cursor-pointer rounded-[18px] focus-visible:outline-offset-8 ${flip ? 'md:order-2' : ''}`}>
        {p.movil ? <AppVisual p={p} refVideo={video} /> : <WebVisual p={p} flip={flip} refVideo={video} />}
      </div>

      <div>
        <p className="eyebrow mb-3.5 text-lilac!">{p.tipo}</p>
        <h3 id={`p-${p.id}`} className="mb-2 text-[32px] sm:text-[clamp(30px,3.2vw,44px)]">{p.nombre}</h3>
        <p className="mb-3 font-serif text-xl text-ink-2 italic sm:mb-[18px] sm:text-[22px]">{p.idea}</p>
        <p className="mb-[22px] text-[15.5px] text-ink-2 sm:text-base">{p.texto}</p>
        <ul className="mb-6 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-[6px] text-[13px] text-ink-2">{t}</li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3">
          <button type="button" onClick={openTour}
            className="inline-flex cursor-pointer items-center gap-2.5 border-b border-line-strong pb-1 text-[15px] font-semibold text-ink hover:border-lilac hover:text-lilac">
            Ver recorrido →
          </button>
          {p.link && <a className={linkOut} href={p.link} target="_blank" rel="noopener">Ver sitio<span className="sr-only"> de {p.nombre}</span> ↗</a>}
          {p.repo && <a className={linkOut} href={p.repo} target="_blank" rel="noopener">Código<span className="sr-only"> de {p.nombre}</span> ↗</a>}
        </div>
      </div>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <div>
      {proyectos.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
    </div>
  );
}
