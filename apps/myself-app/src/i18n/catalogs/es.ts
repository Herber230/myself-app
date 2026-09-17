import type { en } from './en';
import type { CatalogShape } from './shape';

/** The site's UI copy in Spanish: the English keys, no more and no fewer. */
export const es = {
  siteName: 'Herber Colop',
  home: 'Inicio',
  cv: 'CV',
  techRadar: 'Radar tecnológico',
  otherLanguage: 'English',
  homeLead: 'Ingeniero de software. Esta página se reconstruye sobre entifix.',
  cvLead: 'Una hoja de papel digital, con variantes por rol. Muy pronto.',
  techRadarLead: 'Las tecnologías y técnicas que uso. Muy pronto.',
  redirecting: 'Continuar al sitio en inglés',
  notFoundTitle: 'Página no encontrada',
  notFoundLead: 'Esta página no existe.',
  theme: {
    light: 'Claro',
    dark: 'Oscuro',
  },
} as const satisfies CatalogShape<typeof en>;
