import type { ReactNode } from 'react';

interface Props {
  id: string;
  /** Etiqueta corta de la sección, al margen izquierdo en escritorio. */
  label: string;
  title: string;
  lead?: string;
  children: ReactNode;
}

/**
 * Encabezado editorial: una línea fina, la etiqueta al margen y el título al
 * lado. Sin numeración ni palabras en cursiva forzadas: se lee como una
 * revista, no como una plantilla.
 */
export function Section({ id, label, title, lead, children }: Props) {
  return (
    <section id={id} className="mx-auto max-w-[1240px] scroll-mt-4 px-4 pt-20 sm:px-[clamp(16px,5vw,72px)] sm:pt-[clamp(88px,11vw,140px)]">
      <header className="mb-10 grid gap-3 border-t border-line pt-5 sm:mb-14 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] md:gap-10">
        <p className="eyebrow">{label}</p>
        <div className="max-w-[720px]">
          <h2 className="text-[clamp(30px,4.2vw,52px)] leading-[1.05] tracking-[-0.03em]">{title}</h2>
          {lead && <p className="mt-4 max-w-[38em] text-base text-ink-2 sm:text-[17px]">{lead}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
