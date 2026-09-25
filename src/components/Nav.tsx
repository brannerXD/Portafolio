import { useActiveSection } from '../lib/hooks';

// `movil: false` = se oculta en celular para que el menú quepa en una píldora
const LINKS = [
  { id: 'trabajo', label: 'Web', movil: true },
  { id: 'video', label: 'Video', movil: true },
  { id: 'github', label: 'GitHub', movil: false },
  { id: 'proceso', label: 'Proceso', movil: false },
  { id: 'ia', label: 'IA', movil: false },
] as const;

const SECCIONES = ['inicio', ...LINKS.map((l) => l.id), 'contacto'] as const;

const base = 'rounded-full px-[13px] py-[9px] text-sm font-medium no-underline transition-colors duration-300 sm:px-[15px]';

export function Nav() {
  const active = useActiveSection(SECCIONES);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[max(10px,env(safe-area-inset-top))] z-50 flex justify-center px-4 sm:top-4">
      <nav aria-label="Principal" className="glass pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5">
        <a href="#inicio" aria-label="Inicio"
          className={`${base} font-bold tracking-[0.02em] text-ink`}>
          BR
        </a>
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}
            className={`${base} ${l.movil ? '' : 'hidden sm:inline'} text-ink-2 hover:bg-white/7 hover:text-ink aria-[current]:bg-white/10 aria-[current]:text-ink aria-[current]:shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]`}>
            {l.label}
          </a>
        ))}
        <a href="#contacto" className={`${base} bg-ink text-bg hover:bg-lilac`}>Contacto</a>
      </nav>
    </header>
  );
}
