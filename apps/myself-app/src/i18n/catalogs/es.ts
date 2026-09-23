import type { en } from './en';
import type { CatalogShape } from './shape';

/** The site's UI copy in Spanish: the English keys, no more and no fewer. */
export const es = {
  siteName: 'Herber Colop',
  home: 'Inicio',
  cv: 'CV',
  menu: 'Menú',
  techRadar: 'Radar tecnológico',
  /** The language menu. Each language is named in itself, in every locale. */
  language: {
    label: 'Idioma',
    en: 'English',
    es: 'Español',
  },
  cvLead: 'Una hoja de papel digital, con variantes por rol. Muy pronto.',
  techRadarLead: 'Las tecnologías y técnicas que uso. Muy pronto.',
  redirecting: 'Continuar al sitio en inglés',
  notFoundTitle: 'Página no encontrada',
  notFoundLead: 'Esta página no existe.',
  landing: {
    hero: {
      cv: 'Ver mi CV',
      techRadar: 'Explorar mi radar tecnológico',
      scroll: 'Desliza para ver más',
    },
    nav: {
      label: 'Secciones',
      about: 'Sobre mí',
      projects: 'Proyectos',
      entifix: 'entifix',
      contact: 'Contacto',
    },
    headings: {
      about: 'Sobre mí',
      projects: 'Proyectos',
      entifix: 'Construido sobre entifix',
      contact: 'Contacto',
    },
    comingSoon: 'Muy pronto.',
  },
  theme: {
    label: 'Tema',
    blue: 'Azul',
    light: 'Claro',
    dark: 'Oscuro',
  },
  radar: {
    chartLabel:
      'Radar tecnológico: cuatro cuadrantes de tecnologías, en anillos según cuánto confío en ellas',
    legend: 'Cada punto, por cuadrante y anillo',
    placeholder:
      'Entradas provisionales: las descripciones y fechas aún se están escribiendo.',
    quadrants: {
      techniques: 'Técnicas',
      tools: 'Herramientas',
      platforms: 'Plataformas',
      languages: 'Lenguajes y frameworks',
    },
    rings: {
      adopt: 'Adoptar',
      trial: 'Probar',
      assess: 'Evaluar',
      hold: 'Detener',
    },
  },
} as const satisfies CatalogShape<typeof en>;
