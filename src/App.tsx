import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { PlayerProvider } from './components/Player';
import { Projects } from './components/Projects';
import { Section } from './components/Section';
import { Contacto, Footer, Github, HerramientasIA, Proceso } from './components/Sections';
import { Videos } from './components/Videos';
import { useRevealOnScroll } from './lib/hooks';

export function App() {
  useRevealOnScroll();
  return (
    <PlayerProvider>
      <a href="#trabajo" className="fixed top-2 -left-[999px] z-[100] rounded-full bg-ink px-4 py-2.5 text-bg focus:left-3">
        Saltar al trabajo
      </a>
      <Nav />
      <main>
        <Hero />

        <Section id="trabajo" label="Trabajo" title="Proyectos recientes"
          lead="Sitios y productos que diseñé y construí. Pasa el cursor sobre una captura, o tócala, para ver el recorrido.">
          <Projects />
        </Section>

        <Section id="video" label="Video" title="Motion y video"
          lead="Comerciales, explainers y piezas para redes.">
          <Videos />
        </Section>

        <Section id="github" label="Código" title="Más en GitHub"
          lead="Lo más técnico, trabajo para clientes y las organizaciones que llevo.">
          <Github />
        </Section>

        <Section id="proceso" label="Proceso" title="Cómo trabajo">
          <Proceso />
        </Section>

        <Section id="ia" label="IA" title="Cómo uso la IA"
          lead="La uso todos los días. Leo todo lo que produce y las decisiones de diseño las tomo yo.">
          <HerramientasIA />
        </Section>

        <Contacto />
      </main>
      <Footer />
    </PlayerProvider>
  );
}
