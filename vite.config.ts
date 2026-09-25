import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import panelPlugin, { validarVideos } from './tools/panel-plugin';

// Rutas relativas: el sitio funciona en la raíz de un dominio o en una subcarpeta.
// El panel de videos (panel.html + /__panel/api) solo existe en `npm run dev`:
// el build usa únicamente index.html como entrada.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), panelPlugin(), validarVideos()],
  server: {
    port: 4180,
    // public/media NO se ignora: Vite solo sirve los archivos de public/ que su vigilante conoce,
    // así que ignorarlo haría invisibles los videos nuevos del panel hasta reiniciar.
    watch: { ignored: ['**/tools/.raw/**', '**/hero-loop/**'] },
  },
  build: { assetsInlineLimit: 0 },
});
