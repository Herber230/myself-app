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
  cvLead: 'Una página, en cuatro lecturas. Imprímela, o descárgala en PDF.',
  cvPage: {
    variants: 'Lectura',
    mode: 'Escrita para',
    modes: {
      human: 'Personas',
      ats: 'Sistemas de selección (ATS)',
    },
    atsTitle: 'ATS',
    download: 'Descargar PDF',
    pdfSubject: 'Currículum vítae',
    print: 'Imprimir o guardar en PDF',
    printHint:
      'Para una hoja limpia: A4, sin márgenes, sin encabezados ni pies de página, con gráficos de fondo.',
  },
  cvSheet: {
    headings: {
      summary: 'Resumen',
      skills: 'Habilidades técnicas',
      experience: 'Experiencia',
      education: 'Educación',
      certificates: 'Certificaciones',
    },
    present: 'Actualidad',
    notCompleted: 'sin concluir',
    location: 'Ubicación',
  },
  channels: {
    email: 'Correo',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    stackoverflow: 'Stack Overflow',
    medium: 'Medium',
    goodreads: 'Goodreads',
    x: 'X',
  },
  techRadarLead:
    'Las tecnologías y técnicas que uso, y cuánto confío en cada una.',
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
    projects: {
      technologies: 'Tecnologías de {{project}}',
      site: 'Visitar el sitio',
      repository: 'Ver el código',
    },
    entifix: {
      what: 'entifix es un framework de TypeScript para aplicaciones guiadas por entidades, construido sobre Effect. Una entidad se describe una sola vez, y sus metadatos guían la validación, los repositorios, los casos de uso y los controles de React.',
      here: 'Esta página funciona sobre él. El perfil, los proyectos y los canales de contacto son entidades guardadas como JSON en inglés y español, validadas con sus metadatos por un repositorio estático y leídas al compilar mediante el caso de uso load, el mismo que serviría un backend.',
      repository: 'Código en GitHub',
      npm: 'Paquetes en npm',
    },
    contact: {
      link: '{{channel}}: {{handle}}',
    },
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
    ringKey: 'Qué significa cada anillo',
    quadrants: {
      techniques: 'Técnicas',
      tools: 'Herramientas',
      platforms: 'Plataformas',
      languages: 'Lenguajes y frameworks',
    },
    filter: {
      label: 'Filtrar el radar',
      quadrant: 'Cuadrante',
      ring: 'Anillo',
      area: 'Área',
      search: 'Buscar',
      clear: 'Mostrar todo',
      showing: 'Mostrando {{shown}} de {{total}}',
    },
    detail: {
      back: '← Volver al radar',
      quadrant: 'Cuadrante',
      ring: 'Anillo',
      ringMeaning: '{{ring}} — {{meaning}}',
      areas: 'Áreas',
      site: 'Sitio web',
      repository: 'Código',
      history: 'Cómo se movió',
      projects: 'Dónde la usé',
      noProjects: 'Ningún proyecto de este sitio la usa todavía.',
    },
    rings: {
      adopt: 'Adoptar',
      trial: 'Probar',
      assess: 'Evaluar',
      hold: 'Detener',
    },
  },
} as const satisfies CatalogShape<typeof en>;
