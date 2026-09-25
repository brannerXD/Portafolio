# Portafolio — Branner Ramirez

Diseño web, video e IA. El hero es morado (un loop de video original); el resto
de la página es negro cálido y editorial, y **cada proyecto tiene una franja con
los colores del sitio que presenta** (Nythera, además, con sus pétalos cayendo).

**Stack:** React 19 · TypeScript (estricto) · Tailwind CSS v4 · Vite 8 · Node.js
(servidor del panel de videos).

```bash
npm install
npm run dev         # http://localhost:4180
npm run typecheck   # TypeScript del sitio y de Node
npm run build       # typecheck + build → dist/, sitio estático listo para publicar
```

## Estructura

| Qué | Dónde |
|---|---|
| Textos, proyectos, repos, organizaciones, proceso, IA, contacto, redes | `src/data.ts` (tipado con `satisfies`) |
| Colores de la franja de cada proyecto | `tema` de cada proyecto en `src/data.ts` |
| Tipos del contenido | `src/types.ts` |
| Videos | **Panel local** (abajo) → `src/videos.json`, validado por `src/videos-schema.ts` |
| Componentes | `src/components/` (carrusel, franjas, pétalos, palabra rotativa, redes…) |
| Tema de Tailwind (colores, fuentes, vidrio, botones) | `src/index.css` |
| Imágenes y videos | `public/media/` (generados, no se editan a mano) |
| Servidor del panel (Node) | `tools/panel-plugin.ts` |
| Loop del hero | `hero-loop/` (ver abajo) |

`src/videos.json` se valida tres veces: en la página, en el servidor del panel
antes de escribirlo y al compilar. Si está mal formado, `npm run build` falla y
dice qué video y qué campo, en vez de publicar una página rota.

## Panel de videos

```bash
npm run dev
```

Abre <http://localhost:4180/panel.html>:

1. Arrastra un video (MP4, MOV o WebM).
2. Pausa en el cuadro que quieras de portada y pulsa **Usar este cuadro**.
3. Escribe título, tipo y descripción. Los datos (duración, etc.) se llenan solos si los dejas vacíos.
4. Marca si lleva sonido y si va destacado, y pulsa **Subir y agregar**.

El panel lo comprime con FFmpeg (máx. 1280 px), genera la portada y lo agrega al
portafolio. Desde la lista puedes reordenar, editar (incluida la portada) y
quitar videos. Los originales se guardan en `tools/.raw/uploads/`.

Requiere `ffmpeg` y `ffprobe` en el PATH. El panel solo existe en local: no
entra en `npm run build`. Después de agregar videos, vuelve a compilar y publicar.

## Regenerar el material

```bash
npm run capturas    # toma capturas y graba recorridos de cada proyecto
npm run medios      # convierte todo a WebP / MP4 / WebM livianos en public/media/
```

`npm run capturas umbra relevo` captura solo esos. Usa Chrome sin ventana y es
pesado para la GPU: córrelo cuando no estés usando el PC.

## Loop del hero

`hero-loop/render.html` es un shader WebGL original. Todo el movimiento usa
múltiplos enteros de una fase de 2π, así que el cuadro 360 es idéntico al 0 y el
loop no tiene costura (la prueba está en `node capture.mjs --preview`). Hay una
versión horizontal para escritorio y una vertical para celular.

```bash
cd hero-loop
npm run build                                          # escritorio
node capture.mjs --layout mobile && node encode.mjs --layout mobile
cp out/* ../public/media/hero/
```

Muy pesado (renderiza a 4K): `--ss 1` lo hace 4 veces más liviano.

## Al publicar

- Cambia `og:image` en `index.html` por la URL absoluta del póster
  (`https://tu-dominio/media/hero/hero-poster.webp`): las redes no leen rutas relativas.
- Si el portafolio va en una subcarpeta, no hay que tocar nada: todas las rutas son relativas.

## Notas

- **Zeno Divergent** se publica sin audio: la pista original no tiene licencia de sincronización.
- Los videos largos usan `preload="none"`: en la primera carga solo pesan los pósters y el loop del hero.
- Si alguien pide menos movimiento o ahorro de datos, el hero muestra la imagen fija en vez del video.
- Si un navegador no puede decodificar un WebM, la página cambia sola al MP4.
- Los botones de redes siguen el patrón de tres componentes de Uiverse (MIT); los créditos están en `src/components/Social.tsx`.
