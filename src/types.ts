/** Tipos del contenido del portafolio. `src/data.ts` y `src/videos.json` se validan contra ellos. */

export interface Perfil {
  nombre: string;
  rol: string;
  ciudad: string;
  email: string;
  /** Como se muestra, con espacios. */
  telefono: string;
  /** Solo dígitos, con indicativo de país: se usa en el enlace de wa.me. */
  whatsapp: string;
  github: string;
  redes: readonly Red[];
}

export interface Red {
  id: 'email' | 'github' | 'linkedin' | 'instagram' | 'x' | 'discord';
  /** Texto que aparece al expandir el botón. */
  usuario: string;
  href: string;
}

export interface Proyecto {
  /** Prefijo de los archivos en public/media/: `<id>-desk.webp`, `<id>-mobile.webp`, `<id>-tour.mp4`… */
  id: string;
  nombre: string;
  tipo: string;
  /** La idea central del diseño, en una frase corta. */
  idea: string;
  texto: string;
  tags: readonly string[];
  /** Sitio publicado. */
  link?: string;
  /** Repositorio de código. */
  repo?: string;
  /** App de celular: se muestra en dos teléfonos en vez de navegador + teléfono. */
  movil?: boolean;
  /** Paleta de la franja del proyecto, tomada del sitio que presenta. */
  tema: Tema;
  /** Efecto de fondo de la franja, traído del propio sitio. */
  efecto?: 'petalos';
}

/** Colores de una franja. Redefinen los tokens de Tailwind solo dentro de ella. */
export interface Tema {
  bg: string;
  /** Fondo de los marcos (navegador y teléfonos). */
  bg2: string;
  ink: string;
  ink2: string;
  muted: string;
  /** Color de acento: enlaces al pasar el cursor, detalles. */
  acento: string;
  /** true si el fondo es claro: ajusta líneas y sombras. */
  claro?: boolean;
}

export interface Repo {
  nombre: string;
  lenguaje: string;
  texto: string;
  /** Sin `href` el repo se muestra como privado. */
  href?: string;
}

export interface Organizacion {
  nombre: string;
  href: string;
  texto: string;
}

export interface Paso {
  n: string;
  titulo: string;
  texto: string;
}

export interface Herramienta {
  titulo: string;
  texto: string;
}

export interface Video {
  /** Prefijo de `<id>.mp4` y `<id>-poster.webp` en public/media/. */
  id: string;
  titulo: string;
  tipo: string;
  texto: string;
  datos: string[];
  sonido: boolean;
  destacado: boolean;
  vertical?: boolean;
  /** Archivo original en tools/.raw/uploads/ (solo videos subidos desde el panel). */
  original?: string;
}
