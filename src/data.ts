/**
 * Contenido del portafolio. Cambiar un texto, quitar un proyecto o reordenar
 * no obliga a tocar el HTML.
 *
 * Los videos NO están aquí: viven en src/videos.json y se administran desde el
 * panel local (npm run dev → http://localhost:4180/panel.html).
 *
 * Cada export se valida contra src/types.ts con `satisfies`: un campo mal
 * escrito o faltante falla en `npm run typecheck` y en el build.
 */
import type { Herramienta, Organizacion, Paso, Perfil, Proyecto, Repo } from './types';

export const perfil = {
  nombre: 'Branner Ramirez',
  rol: 'Diseñador web y de video',
  ciudad: 'Medellín, Colombia',
  email: 'branner360@gmail.com',
  telefono: '314 260 0182',
  whatsapp: '573142600182',
  github: 'https://github.com/brannerXD',
  redes: [
    { id: 'email', usuario: 'branner360@gmail.com', href: 'mailto:branner360@gmail.com' },
    { id: 'github', usuario: 'brannerXD', href: 'https://github.com/brannerXD' },
    { id: 'linkedin', usuario: 'LinkedIn', href: 'https://www.linkedin.com/in/branner-ram%C3%ADrez-1b23a231a/' },
    { id: 'instagram', usuario: '@branner.__', href: 'https://www.instagram.com/branner.__/' },
    { id: 'x', usuario: '@branner360', href: 'https://x.com/branner360' },
    { id: 'discord', usuario: 'branner_', href: 'https://discord.com/users/726869060872044617' },
  ],
} satisfies Perfil;

/**
 * Proyectos con captura. `media` sale de public/media/<id>-*.
 * `movil: true` = app de celular: se muestra solo en marco de teléfono.
 */
export const proyectos = [
  {
    id: 'umbra',
    nombre: 'Umbra',
    tipo: 'Producto de IA · Plataforma',
    idea: 'Reputación que se demuestra',
    texto:
      'Una red donde los agentes de IA compiten en retos y Claude los califica con una rúbrica fija, así que la reputación sale de resultados y no de promesas. Tiene ranking en vivo, historial por agente y un marketplace.',
    tags: ['Producto completo', 'Supabase + RLS', 'Anthropic API'],
    link: 'https://umbra-agents.vercel.app/',
    repo: 'https://github.com/brannerXD/umbra-ai',
    tema: { bg: '#e7e7e5', bg2: '#f4f4f2', ink: '#0d0d0d', ink2: '#3a3a3a', muted: '#6e6e6c', acento: '#0d0d0d', claro: true },
  },
  {
    id: 'nythera',
    nombre: 'Nythera',
    tipo: 'Marca · Experiencia digital',
    idea: 'Editorial y estratégica',
    texto:
      'Un venture studio de inteligencia aplicada presentado como una experiencia editorial: encabezados tipográficos, arte para redes (OG) generado por código, sitemap y SEO completos.',
    tags: ['Dirección de arte', 'Next.js 16', 'SEO'],
    link: 'https://nythera-ten.vercel.app/',
    repo: 'https://github.com/brannerXD/nythera',
    efecto: 'petalos',
    tema: { bg: '#080607', bg2: '#140f11', ink: '#f4ede8', ink2: '#bfb3ae', muted: '#8a7d78', acento: '#e58ca8' },
  },
  {
    id: 'relevo',
    nombre: 'Relevo',
    tipo: 'MVP · #AIForImpact NAUFest 2026',
    idea: 'Tú con lo importante',
    texto:
      'Para quien cuida a un paciente crónico: le tomas foto a cada papel médico y Relevo lo lee, cruza fechas y arma el plan del mes. La IA lee la letra manuscrita y el cálculo de fechas se hace en código. Es una app instalable, con letra grande y contraste medido.',
    tags: ['IA con visión', 'Accesibilidad', 'App web instalable'],
    link: 'https://relevo-rho.vercel.app/',
    repo: 'https://github.com/brannerXD/relevo',
    tema: { bg: '#f6efe4', bg2: '#fffaf2', ink: '#2c211b', ink2: '#5c4c42', muted: '#8b796c', acento: '#b5532f', claro: true },
  },
  {
    id: 'emou',
    nombre: 'Emou Beatz',
    tipo: 'Sitio oficial · Artista musical',
    idea: 'Póster en movimiento',
    texto:
      'Una paleta que sale del estudio del artista: negro, blanco y rojo como acento. Su logo, un Launchpad, está reconstruido en SVG y se repite como favicon, telón de carga y secuenciador animado. Las 22 fotos están gradadas para que se lean como una sola serie.',
    tags: ['Identidad en SVG', 'Motion', 'Video hero'],
    tema: { bg: '#0a0a0a', bg2: '#141414', ink: '#f5f5f5', ink2: '#bcbcbc', muted: '#8a8a8a', acento: '#e3202f' },
  },
  {
    id: 'hexor',
    nombre: 'Hexor Labs',
    tipo: 'Mi estudio · Web, software e IA',
    idea: 'Estudio digital',
    texto:
      'La marca de mi estudio: experiencias digitales, software e inteligencia artificial aplicada. Tiene una escena 3D interactiva en Spline, remezclada y encuadrada desde el frontend, y secciones de proceso, capacidades y crecimiento.',
    tags: ['Marca propia', '3D interactivo', 'Next.js'],
    tema: { bg: '#161519', bg2: '#201e24', ink: '#f1f0f4', ink2: '#b8b4c2', muted: '#86818f', acento: '#b86cff' },
  },
  {
    id: 'easy-parking',
    nombre: 'Easy Parking',
    tipo: 'App móvil · Marketplace',
    idea: 'Parquear sin dar vueltas',
    texto:
      'Un marketplace de parqueaderos para Colombia en iOS, Android y web, hecho con React Native y Expo. Tiene sistema de diseño propio, mapas y una arquitectura lista para conectar Supabase sin tocar la interfaz.',
    tags: ['React Native', 'Expo', 'Sistema de diseño'],
    repo: 'https://github.com/Easy-Parking-app/easy-parking-mobile',
    movil: true,
    tema: { bg: '#0c1016', bg2: '#151b24', ink: '#f3f5f8', ink2: '#b3bbc8', muted: '#7d8797', acento: '#7c83ff' },
  },
] satisfies readonly Proyecto[];

/** Repositorios que no son sitios visuales pero muestran criterio técnico. */
export const repos = [
  {
    nombre: 'systematic-trading-agent',
    lenguaje: 'Python',
    texto: 'Laboratorio cuantitativo: 5 estrategias probadas con costos reales y Deflated Sharpe Ratio. La conclusión fue negativa y la publiqué igual, porque la evidencia vale más que un backtest bonito.',
    href: 'https://github.com/brannerXD/systematic-trading-agent',
  },
  {
    nombre: 't3n-trusted-agent',
    lenguaje: 'Rust',
    texto: 'Un agente de verificación que responde "¿es elegible?" sin exponer datos personales, procesándolos dentro de un TEE. Funciona en testnet, y encontré y reporté un bug del SDK que el equipo confirmó.',
    href: 'https://github.com/brannerXD/t3n-trusted-agent',
  },
  {
    nombre: 'Vibras Store',
    lenguaje: 'Cliente · Privado',
    texto: 'E-commerce para una tienda de streetwear en Medellín: catálogo, carrito con tallas, contraentrega y pedidos por WhatsApp. El código es privado; lo muestro a solicitud.',
  },
] satisfies readonly Repo[];

export const organizaciones = [
  { nombre: 'Hexor-Labs', href: 'https://github.com/Hexor-Labs', texto: 'Mi estudio de web, software e IA.' },
  { nombre: 'Easy-Parking-app', href: 'https://github.com/Easy-Parking-app', texto: 'El marketplace de parqueaderos.' },
] satisfies readonly Organizacion[];

export const proceso = [
  { n: '01', titulo: 'Entender', texto: 'Antes de diseñar reviso el negocio, a quién le habla y qué hay publicado. Si un dato no lo puedo comprobar, no lo pongo.' },
  { n: '02', titulo: 'Encontrar la idea', texto: 'Busco una sola idea que decida el resto: colores, tipografía y ritmo.' },
  { n: '03', titulo: 'Construir', texto: 'Diseño directamente en el navegador, empezando por el celular.' },
  { n: '04', titulo: 'Revisar', texto: 'Peso, velocidad, accesibilidad y textos. El feedback lo aplico tal como me lo dan.' },
  { n: '05', titulo: 'Entregar', texto: 'Cada canal con su versión: el sitio, el video para redes, el máster y la documentación.' },
] satisfies readonly Paso[];

export const herramientasIA = [
  { titulo: 'Claude y Claude Code', texto: 'Los uso para escribir y revisar código, investigar y probar ideas rápido. Leo todo lo que generan y corrijo lo que está mal.' },
  { titulo: 'IA dentro del producto', texto: 'En Umbra un modelo califica a los agentes con una rúbrica fija. En Relevo la IA lee fórmulas médicas escritas a mano, y se puede cambiar entre Claude y Gemini para comparar calidad y costo.' },
  { titulo: 'Video generado por código', texto: 'Algunas piezas las animo con código: shaders WebGL que renderizo cuadro a cuadro y codifico con FFmpeg. Así hice el loop del inicio.' },
  { titulo: 'Stack', texto: 'Next.js, React, TypeScript y Tailwind. Supabase y Postgres. React Native con Expo para móvil, Python para análisis y Vercel para publicar.' },
] satisfies readonly Herramienta[];
