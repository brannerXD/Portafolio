import { useEffect, useRef, useState } from 'react';
import { perfil } from '../data';
import { usePreloaderDone } from '../lib/hooks';
import { device, heroSrc, onVideoError } from '../lib/media';
import { BlurWord } from './BlurWord';

// Lo que rota después de «diseña». Cortas: la línea no debe saltar de ancho en celular.
const PALABRAS = ['experiencias', 'landings', 'marcas', 'videos', 'productos'] as const;

/**
 * Loop de video original (hero-loop/). Primero se ve el póster; el video entra
 * con un fundido cuando empieza a reproducirse. Sin video si el usuario pide
 * menos movimiento o ahorro de datos.
 */
function HeroLoop() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const enabled = !device.reduceMotion && !device.saveData;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React no escribe el atributo `muted`, solo la propiedad; Safari y algunos Chrome
    // exigen el atributo para permitir la reproducción automática.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    // El navegador puede pausar el video (pestaña en segundo plano, ahorro de energía)
    // y no siempre lo reanuda: se reintenta cada vez que el hero vuelve a estar a la vista.
    let visible = true;
    const resume = () => { if (visible && !document.hidden && v.paused) v.play().catch(() => {}); };
    const retry = () => setTimeout(resume, 400);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) resume(); else v.pause(); // fuera de pantalla se pausa y libera GPU
    });
    io.observe(v);
    const eventos = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    document.addEventListener('visibilitychange', resume);
    v.addEventListener('pause', retry);
    // Algunos navegadores solo permiten reproducir después de la primera interacción
    for (const ev of eventos) addEventListener(ev, resume, { passive: true });
    resume();
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', resume);
      v.removeEventListener('pause', retry);
      for (const ev of eventos) removeEventListener(ev, resume);
    };
  }, []);

  if (!enabled) return null;
  return (
    <video ref={ref} src={heroSrc()} muted autoPlay loop playsInline preload="auto" aria-hidden="true"
      onPlaying={() => setPlaying(true)} onError={(e) => { setPlaying(false); onVideoError(e); }}
      className={`absolute inset-0 -z-20 size-full object-cover transition-opacity duration-[1.2s] ease-soft ${playing ? 'opacity-100' : 'opacity-0'}`} />
  );
}

const delay = (i: number) => ({ transitionDelay: `${120 + i * 110}ms` });

export function Hero() {
  const listo = usePreloaderDone();
  return (
    <section id="inicio" className="relative isolate grid min-h-svh items-end overflow-hidden sm:items-center">
      <picture>
        <source media="(max-aspect-ratio: 4/5)" srcSet="media/hero/hero-mobile-poster.webp" />
        <img src="media/hero/hero-poster.webp" alt="" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" />
      </picture>
      <HeroLoop />
      {/* Degradados para que el texto se lea: desde abajo en celular, desde la izquierda en escritorio */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,var(--color-bg)_2%,rgb(7_3_15/0.55)_34%,transparent_55%)] sm:bg-[linear-gradient(90deg,rgb(7_3_15/0.62)_0%,rgb(7_3_15/0.15)_50%,transparent_70%),linear-gradient(0deg,var(--color-bg)_0%,transparent_22%)]" />

      <div className="mx-auto w-full max-w-[1240px] px-4 pb-[max(56px,calc(env(safe-area-inset-bottom)+40px))] sm:px-[clamp(16px,5vw,72px)] sm:pt-[120px] sm:pb-[90px]">
        <p className="eyebrow reveal" style={delay(0)}>Diseñador web y de video · Medellín</p>
        <h1 className="reveal mt-3.5 mb-4 max-w-[11ch] text-[clamp(40px,12.5vw,56px)] leading-[0.94] tracking-[-0.04em] sm:mt-5 sm:mb-6 sm:text-[clamp(46px,7.4vw,112px)]" style={delay(1)}>
          {perfil.nombre}<br /><em className="mt-[0.06em] inline-block">diseña <BlurWord words={PALABRAS} start={listo} /></em>
        </h1>
        <p className="reveal mb-[26px] max-w-[30em] text-base text-ink-2 sm:mb-[34px] sm:text-[clamp(17px,1.45vw,20px)]" style={delay(2)}>
          Diseño y construyo sitios, productos y videos. Trabajo remoto desde Medellín.
        </p>
        <div className="reveal flex flex-wrap gap-3 max-sm:[&>a]:flex-auto" style={delay(3)}>
          <a className="btn btn-primary" href="#trabajo">Ver proyectos</a>
          <a className="btn" href="#contacto">Escríbeme</a>
        </div>
      </div>

      <a href="#trabajo" aria-label="Bajar al trabajo"
        className="absolute bottom-7 left-1/2 hidden h-[42px] w-[26px] -translate-x-1/2 rounded-[20px] border border-line sm:block">
        <span className="absolute top-[9px] left-1/2 -ml-[1.5px] h-2 w-[3px] animate-hint rounded-sm bg-lilac" />
      </a>
    </section>
  );
}
