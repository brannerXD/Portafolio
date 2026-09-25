/**
 * Panel local de videos. Cada cambio reescribe src/videos.json y Vite recarga
 * el portafolio solo. Solo existe en `npm run dev`.
 */
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Video } from '../types';
import { crear, datosDe, editar, fmt, listar, ordenar, quitar, subir } from './api';

const input = 'rounded-xl border border-line bg-black/25 px-3.5 py-3 text-[15px] font-normal tracking-normal text-ink outline-none focus:border-violet-2 focus:shadow-[0_0_0_3px_rgb(139_92_246/0.25)]';
const labelCls = 'grid gap-1.5 text-[13px] font-semibold tracking-[0.04em] text-ink-2';
const chip = 'cursor-pointer rounded-full border border-line-strong bg-violet/30 px-3 py-1 text-[13px] font-semibold text-ink hover:bg-violet/45';
const iconBtn = 'size-[34px] cursor-pointer rounded-[10px] border border-line bg-white/5 text-sm text-ink hover:bg-white/12 disabled:cursor-default disabled:opacity-30';
// Evita que el navegador muestre una portada vieja después de cambiarla
const bust = () => `?v=${Date.now()}`;

type Estado = { msg: string; tipo?: 'ok' | 'error' };

function Campos({ v }: { v?: Video }) {
  return (
    <>
      <label className={labelCls}>Título <input name="titulo" required defaultValue={v?.titulo} placeholder="Ej.: Spot para Vibras Store" className={input} /></label>
      <label className={labelCls}>Tipo <input name="tipo" defaultValue={v?.tipo} placeholder="Ej.: Motion design · Comercial" className={input} /></label>
      <label className={labelCls}>Descripción <textarea name="texto" rows={3} defaultValue={v?.texto} placeholder="Qué es, qué hiciste y para qué sirvió." className={`${input} resize-y`} /></label>
      <label className={labelCls}>Datos <input name="datos" defaultValue={v?.datos.join(', ')} placeholder="30 s, 1080p, Reel vertical (separados por coma; vacío = automático)" className={input} /></label>
      <div className="flex flex-wrap gap-x-[22px] gap-y-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-[15px] font-medium"><input type="checkbox" name="sonido" defaultChecked={v ? v.sonido : true} className="size-[18px] accent-violet" /> Con sonido</label>
        <label className="flex cursor-pointer items-center gap-2 text-[15px] font-medium"><input type="checkbox" name="destacado" defaultChecked={v?.destacado} className="size-[18px] accent-violet" /> Destacado (grande, primero)</label>
      </div>
    </>
  );
}

const leer = (form: HTMLFormElement) => {
  const d = new FormData(form);
  return {
    titulo: String(d.get('titulo') ?? ''), tipo: String(d.get('tipo') ?? ''), texto: String(d.get('texto') ?? ''),
    datos: datosDe(String(d.get('datos') ?? '')), sonido: d.get('sonido') === 'on', destacado: d.get('destacado') === 'on',
  };
};

function Card({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="glass rounded-3xl p-[clamp(20px,3vw,32px)]">
      <h2 className="mb-[18px] text-2xl tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}

/* ---------- Nuevo video ---------- */
function Nuevo({ onAdded }: { onAdded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [portada, setPortada] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [estado, setEstado] = useState<Estado>({ msg: '' });
  const preview = useRef<HTMLVideoElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const pick = (f: File | undefined) => {
    if (!f || !f.type.startsWith('video/')) { setEstado({ msg: 'Ese archivo no es un video.', tipo: 'error' }); return; }
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setPortada(null);
    const titulo = form.current?.elements.namedItem('titulo') as HTMLInputElement | null;
    if (titulo && !titulo.value) titulo.value = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    setEstado({ msg: `${f.name} · ${(f.size / 1048576).toFixed(1)} MB` });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const campos = leer(e.currentTarget);
    setBusy(true);
    try {
      const subido = await subir(file, (pct) => setEstado({ msg: `Subiendo… ${pct} %` }));
      setEstado({ msg: 'Comprimiendo y generando portada… (tarda más o menos lo que dura el video)' });
      const v = await crear(subido, { ...campos, portada: portada ?? 1 });
      setEstado({ msg: `✓ "${v.titulo}" agregado al portafolio.`, tipo: 'ok' });
      form.current?.reset();
      setFile(null);
      setUrl(null);
      onAdded();
    } catch (err) {
      setEstado({ msg: (err as Error).message, tipo: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Agregar video">
      <div
        onClick={() => { if (!file) picker.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        className={`grid min-h-[200px] place-items-center overflow-hidden rounded-[18px] border-[1.5px] text-center text-ink-2 transition-colors
          ${file ? 'border-solid border-line-strong' : 'cursor-pointer border-dashed border-line-strong hover:border-violet-2 hover:bg-violet/8'} ${over ? 'border-violet-2 bg-violet/8' : ''}`}>
        <input ref={picker} type="file" accept="video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        {url
          ? <video ref={preview} src={url} controls playsInline muted className="max-h-[360px] w-full bg-black" />
          : <span>Arrastra un video aquí o <u>elígelo</u><br /><small className="text-muted">MP4, MOV o WebM · se comprime solo a 1280 px</small></span>}
      </div>
      {file && (
        <p className="my-3 text-sm text-muted">
          Pausa en el cuadro que quieras de portada y pulsa{' '}
          <button type="button" className={chip} onClick={() => setPortada(preview.current?.currentTime ?? 1)}>Usar este cuadro</button>{' '}
          {portada === null ? 'Portada: primer segundo' : `Portada: ${fmt(portada)} ✓`}
        </p>
      )}
      <form ref={form} onSubmit={submit} className="mt-4 grid gap-3.5">
        <Campos />
        <button type="submit" disabled={!file || busy} className="btn btn-primary cursor-pointer justify-self-start disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? 'Trabajando…' : 'Subir y agregar'}
        </button>
        <p role="status" className={`min-h-[1.4em] text-sm ${estado.tipo === 'error' ? 'text-rose-300' : estado.tipo === 'ok' ? 'text-green-300' : 'text-ink-2'}`}>{estado.msg}</p>
      </form>
    </Card>
  );
}

/* ---------- Editar ---------- */
function Editar({ v, onClose }: { v: Video; onClose: (cambio: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [portada, setPortada] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { dialog.current?.showModal(); }, []);

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await editar(v.id, { ...leer(e.currentTarget), portada });
      onClose(true);
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <dialog ref={dialog} onCancel={() => onClose(false)}
      className="glass m-auto max-h-[92vh] w-[min(640px,94vw)] overflow-auto rounded-3xl p-7 text-ink backdrop:bg-[#04010a]/75 backdrop:backdrop-blur-sm">
      <form onSubmit={guardar} className="grid gap-3.5">
        <h2 className="text-2xl tracking-[-0.02em]">Editar video</h2>
        <video ref={video} src={`/media/${v.id}.mp4${bust()}`} controls playsInline muted className="max-h-[300px] w-full rounded-xl bg-black" />
        <p className="text-sm text-muted">
          Para cambiar la portada, pausa en el cuadro y pulsa{' '}
          <button type="button" className={chip} onClick={() => setPortada(video.current?.currentTime ?? 0)}>Usar este cuadro</button>{' '}
          {portada !== null && `Portada: ${fmt(portada)} ✓`}
        </p>
        <Campos v={v} />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex justify-end gap-2.5">
          <button type="button" className="btn cursor-pointer" onClick={() => onClose(false)}>Cancelar</button>
          <button type="submit" className="btn btn-primary cursor-pointer">Guardar</button>
        </div>
      </form>
    </dialog>
  );
}

/* ---------- Lista ---------- */
export function PanelApp() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<Video | null>(null);
  const [version, setVersion] = useState(bust());

  const load = useCallback(async () => {
    try {
      setVideos(await listar());
      setVersion(bust());
      setError('');
    } catch (err) { setError((err as Error).message); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const accion = async (fn: () => Promise<unknown>) => {
    try { await fn(); await load(); } catch (err) { alert((err as Error).message); }
  };
  const mover = (i: number, d: -1 | 1) => {
    if (!videos) return;
    const ids = videos.map((v) => v.id);
    const a = ids[i]!, b = ids[i + d]!;
    ids[i] = b; ids[i + d] = a;
    void accion(() => ordenar(ids));
  };
  const borrar = (v: Video) => {
    if (!confirm(`¿Quitar "${v.titulo}" del portafolio?\nSe borran su video comprimido y su portada de public/media. El original que subiste se conserva.`)) return;
    void accion(() => quitar(v.id));
  };

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(16px,4vw,48px)] pt-8 pb-16">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Solo local · no se publica</p>
          <h1 className="mt-2.5 text-[clamp(36px,5vw,56px)]">Panel de <em>videos</em></h1>
        </div>
        <a className="btn" href="/" target="_blank">Ver portafolio ↗</a>
      </header>

      {error ? (
        <p className="text-rose-300">No se pudo cargar el panel: {error}<br />Ábrelo con <code>npm run dev</code>, no desde el sitio publicado.</p>
      ) : (
        <main className="grid items-start gap-5 lg:grid-cols-2">
          <Nuevo onAdded={load} />
          <Card title={<>En el portafolio <span className="text-lg font-normal text-muted">· {videos?.length ?? '…'}</span></>}>
            <p className="mb-4 text-sm text-muted">El orden de esta lista es el orden en la página (el destacado siempre va primero).</p>
            <ol className="grid gap-2.5">
              {videos?.map((v, i) => (
                <li key={v.id} className="grid grid-cols-[112px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-2xl border border-line bg-black/22 p-2.5">
                  <img src={`/media/${v.id}-poster.webp${version}`} alt="" className="aspect-video w-28 rounded-[10px] bg-black object-cover" />
                  <div>
                    <h3 className="text-base leading-tight tracking-[-0.01em]">{v.destacado && <span className="text-amber-300" title="Destacado">★ </span>}{v.titulo}</h3>
                    <p className="mt-1 text-[13px] text-muted">{[v.tipo, ...v.datos].filter(Boolean).join(' · ')}{v.sonido ? ' · 🔊' : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className={iconBtn} title="Subir" aria-label={`Subir ${v.titulo}`} disabled={i === 0} onClick={() => mover(i, -1)}>↑</button>
                    <button className={iconBtn} title="Bajar" aria-label={`Bajar ${v.titulo}`} disabled={i === videos.length - 1} onClick={() => mover(i, 1)}>↓</button>
                    <button className={iconBtn} title="Editar" aria-label={`Editar ${v.titulo}`} onClick={() => setEditando(v)}>✎</button>
                    <button className={`${iconBtn} hover:bg-rose-500/30`} title="Quitar" aria-label={`Quitar ${v.titulo}`} onClick={() => borrar(v)}>✕</button>
                  </div>
                </li>
              ))}
              {videos?.length === 0 && <li className="text-sm text-muted">Todavía no hay videos.</li>}
            </ol>
          </Card>
        </main>
      )}

      {editando && <Editar key={editando.id} v={editando} onClose={(cambio) => { setEditando(null); if (cambio) void load(); }} />}
    </div>
  );
}
