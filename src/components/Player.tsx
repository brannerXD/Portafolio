import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface Reproduccion { src: string; caption: string }
type Abrir = (src: string, caption: string) => void;

const PlayerContext = createContext<Abrir | null>(null);

/** Abre el reproductor desde cualquier componente: `const play = usePlayer(); play(src, título)`. */
export function usePlayer() {
  const open = useContext(PlayerContext);
  if (!open) throw new Error('usePlayer se usa dentro de <PlayerProvider>');
  return open;
}

/** Un solo reproductor modal para toda la página (recorridos y videos). */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [actual, setActual] = useState<Reproduccion | null>(null);

  const open = useCallback<Abrir>((src, caption) => {
    trigger.current = document.activeElement as HTMLElement | null;
    setActual({ src, caption });
  }, []);

  const close = useCallback(() => {
    video.current?.pause();
    dialog.current?.close();
    setActual(null);
    trigger.current?.focus({ preventScroll: true }); // el foco vuelve a donde estaba
  }, []);

  useEffect(() => {
    if (!actual) return;
    dialog.current?.showModal();
    video.current?.play().catch(() => {});
  }, [actual]);

  return (
    <PlayerContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-label="Reproductor de video"
        className="m-auto w-[min(1200px,94vw)] max-h-[94vh] overflow-visible bg-transparent p-0 text-ink backdrop:bg-[#04010a]/80 backdrop:backdrop-blur-md open:animate-pop"
        onCancel={(e) => { e.preventDefault(); close(); }}
        onClick={(e) => { if (e.target === dialog.current) close(); }}
      >
        <button type="button" aria-label="Cerrar" onClick={close}
          className="glass absolute -top-[54px] right-0 grid size-11 cursor-pointer place-items-center rounded-full text-base text-ink">
          ✕
        </button>
        {actual && (
          <>
            <video ref={video} key={actual.src} src={actual.src} controls playsInline
              className="max-h-[80vh] w-full rounded-[18px] bg-black shadow-[0_40px_120px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.1)]" />
            <p className="mt-3.5 text-center text-[15px] text-ink-2">{actual.caption}</p>
          </>
        )}
      </dialog>
    </PlayerContext.Provider>
  );
}
