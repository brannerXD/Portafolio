/** Secciones de texto: GitHub, proceso, IA, contacto y pie. */
import { herramientasIA, organizaciones, perfil, proceso, repos } from '../data';
import { Carousel } from './Carousel';
import { SocialLinks } from './Social';

// En escritorio el contenido de texto se alinea con el título, no con la etiqueta del margen
const alineado = 'md:ml-[calc(min(220px,max(140px,20%))+2.5rem)]';

export function Github() {
  return (
    <>
      <Carousel label="Repositorios" grid="sm:grid sm:grid-cols-1 sm:gap-4 lg:grid-cols-3">
        {repos.map((r) => {
          const inner = (
            <>
              <p className="eyebrow">{r.lenguaje}</p>
              <h3 className="text-xl tracking-[-0.02em] break-words">
                {r.nombre}{r.href && <span aria-hidden="true" className="text-[0.8em] text-muted"> ↗</span>}
              </h3>
              <p className="text-[15px] text-ink-2">{r.texto}</p>
            </>
          );
          const cls = 'reveal flex flex-col gap-2.5 rounded-xl border border-line p-6 no-underline';
          return r.href ? (
            <a key={r.nombre} href={r.href} target="_blank" rel="noopener"
              className={`${cls} transition-colors duration-300 hover:border-line-strong hover:bg-surface`}>{inner}</a>
          ) : (
            <div key={r.nombre} className={`${cls} border-dashed`}>{inner}</div>
          );
        })}
      </Carousel>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[15px]">
        <p className="eyebrow">Organizaciones que llevo:</p>
        {organizaciones.map((o) => (
          <a key={o.nombre} href={o.href} target="_blank" rel="noopener"
            className="text-ink no-underline underline-offset-4 hover:underline">
            {o.nombre} <span className="text-muted">— {o.texto}</span>
          </a>
        ))}
      </div>
    </>
  );
}

export function Proceso() {
  return (
    <ol className={`m-0 grid list-none p-0 ${alineado}`} aria-label="Pasos del proceso">
      {proceso.map((s) => (
        <li key={s.n} className="reveal grid gap-1 border-b border-line py-5 first:border-t sm:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
          <span aria-hidden="true" className="text-sm text-muted tabular-nums">{s.n}</span>
          <h3 className="text-lg font-semibold tracking-[-0.01em]">{s.titulo}</h3>
          <p className="text-[15.5px] text-ink-2">{s.texto}</p>
        </li>
      ))}
    </ol>
  );
}

export function HerramientasIA() {
  return (
    <div className={`grid gap-x-10 gap-y-8 md:grid-cols-2 ${alineado}`}>
      {herramientasIA.map((h) => (
        <article key={h.titulo} className="reveal border-t border-line pt-4">
          <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em]">{h.titulo}</h3>
          <p className="text-[15.5px] text-ink-2">{h.texto}</p>
        </article>
      ))}
    </div>
  );
}

export function Contacto() {
  const wa = `https://wa.me/${perfil.whatsapp}?text=${encodeURIComponent('Hola Branner, vi tu portafolio y quiero hablar contigo.')}`;
  return (
    <section id="contacto" className="mx-auto max-w-[1240px] scroll-mt-4 px-4 pt-20 pb-[clamp(80px,10vw,130px)] sm:px-[clamp(16px,5vw,72px)] sm:pt-[clamp(88px,11vw,140px)]">
      <div className="grid gap-3 border-t border-line pt-5 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] md:gap-10">
        <p className="eyebrow">Contacto</p>
        <div>
          <h2 className="text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[-0.04em]">¿Hablamos?</h2>
          <p className="mt-5 mb-8 max-w-[34em] text-ink-2 sm:text-[17px]">
            Estoy buscando trabajo remoto y también tomo proyectos en Medellín. Lo más rápido es WhatsApp; si prefieres, escríbeme por cualquiera de estos.
          </p>
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:flex-wrap sm:items-center">
            <a className="btn btn-primary" href={wa} target="_blank" rel="noopener">WhatsApp · {perfil.telefono}</a>
            <SocialLinks redes={perfil.redes} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 border-t border-line px-4 pt-8 pb-12 text-sm text-muted sm:flex-row sm:flex-wrap sm:px-[clamp(16px,5vw,72px)]">
      <p>© {new Date().getFullYear()} {perfil.nombre} · {perfil.ciudad}</p>
      <p>Diseñado y construido por mí. El loop del inicio es un shader que rendericé cuadro a cuadro.</p>
    </footer>
  );
}
