import videosJson from '../videos.json';
import { media } from '../lib/media';
import type { Video } from '../types';
import { ordenarVideos, parseVideos } from '../videos-schema';
import { Carousel } from './Carousel';
import { usePlayer } from './Player';

// Validado al construir (plugin validarVideos) y aquí otra vez por si se editó a mano en desarrollo
const videos = ordenarVideos(parseVideos(videosJson));
const destacado = videos.find((v) => v.destacado);
const resto = videos.filter((v) => !v.destacado);

/** `ancho`: la tarjeta ocupa una fila entera con miniatura y texto lado a lado. */
function VideoCard({ v, ancho = false, className = '' }: { v: Video; ancho?: boolean; className?: string }) {
  const play = usePlayer();
  return (
    <article className={`group reveal flex flex-col overflow-hidden rounded-xl border border-line transition-colors duration-300 hover:border-line-strong
      ${ancho ? 'lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]' : ''} ${className}`}>
      <button type="button" aria-label={`Reproducir ${v.titulo}`} onClick={() => play(media(`${v.id}.mp4`), v.titulo)}
        className="relative block aspect-video w-full cursor-pointer overflow-hidden bg-black">
        <img src={media(`${v.id}-poster.webp`)} alt="" loading="lazy" decoding="async"
          className={`size-full transition-transform duration-700 ease-soft group-hover:scale-[1.03] ${v.vertical ? 'object-contain' : 'object-cover'}`} />
        <span aria-hidden="true"
          className="absolute top-1/2 left-1/2 grid size-14 -translate-1/2 place-items-center rounded-full bg-ink/90 transition-transform duration-300 group-hover:scale-105 sm:size-16 before:ml-[5px] before:border-y-12 before:border-l-20 before:border-y-transparent before:border-l-bg before:content-['']" />
      </button>
      <div className={`flex flex-1 flex-col gap-3 p-5 sm:p-6 ${ancho ? 'justify-center lg:p-[clamp(24px,3vw,40px)]' : ''}`}>
        {v.tipo && <p className="eyebrow">{v.tipo}</p>}
        <h3 className={`leading-[1.1] tracking-[-0.02em] ${ancho ? 'text-[clamp(26px,2.8vw,38px)]' : 'text-2xl'}`}>{v.titulo}</h3>
        {v.texto && <p className="text-[15.5px] text-ink-2">{v.texto}</p>}
        <ul className="mt-auto flex flex-wrap gap-x-3.5 gap-y-1.5 pt-1 text-[13px] text-muted">
          {v.datos.map((d, i) => (
            <li key={`${i}-${d}`} className={i ? "before:mr-2 before:content-['•']" : ''}>{d}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// Si la última fila queda con un solo video, ese video ocupa la fila completa en vez de dejar huecos
const cols = resto.length === 2 || resto.length === 4 ? 2 : 3;
const soloAlFinal = resto.length % cols === 1 && resto.length > 1;

export function Videos() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-[22px]">
      {destacado && <VideoCard v={destacado} ancho />}
      {resto.length > 0 && (
        <Carousel label="Más videos" grid={`sm:grid sm:grid-cols-2 sm:gap-[22px] ${cols === 3 ? 'lg:grid-cols-3' : ''}`}>
          {resto.map((v, i) => {
            const ultimo = soloAlFinal && i === resto.length - 1;
            return <VideoCard key={v.id} v={v} ancho={ultimo}
              className={ultimo ? (cols === 3 ? 'lg:col-span-3' : '') + (resto.length % 2 === 1 ? ' sm:max-lg:col-span-2' : '') : ''} />;
          })}
        </Carousel>
      )}
    </div>
  );
}
