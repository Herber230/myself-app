import type { SiteLocale } from './site-locales';

/**
 * The words the empty pages need, until the catalogs and their gates arrive
 * (#17) and replace this file.
 */
interface PlaceholderCopy {
  readonly siteName: string;
  readonly home: string;
  readonly cv: string;
  readonly techRadar: string;
  /** The name of the *other* language, as the switch shows it. */
  readonly otherLanguage: string;
  readonly homeLead: string;
  readonly cvLead: string;
  readonly techRadarLead: string;
  readonly redirecting: string;
  readonly notFoundTitle: string;
  readonly notFoundLead: string;
}

export const PLACEHOLDER_COPY = {
  en: {
    siteName: 'Herber Colop',
    home: 'Home',
    cv: 'CV',
    techRadar: 'Tech radar',
    otherLanguage: 'Español',
    homeLead: 'Software engineer. This page is being rebuilt on entifix.',
    cvLead: 'A digital paper sheet, in variants per role. Coming soon.',
    techRadarLead: 'The technologies and techniques I use. Coming soon.',
    redirecting: 'Continue to the English site',
    notFoundTitle: 'Page not found',
    notFoundLead: 'This page does not exist.',
  },
  es: {
    siteName: 'Herber Colop',
    home: 'Inicio',
    cv: 'CV',
    techRadar: 'Radar tecnológico',
    otherLanguage: 'English',
    homeLead:
      'Ingeniero de software. Esta página se reconstruye sobre entifix.',
    cvLead: 'Una hoja de papel digital, con variantes por rol. Muy pronto.',
    techRadarLead: 'Las tecnologías y técnicas que uso. Muy pronto.',
    redirecting: 'Continuar al sitio en inglés',
    notFoundTitle: 'Página no encontrada',
    notFoundLead: 'Esta página no existe.',
  },
} as const satisfies Record<SiteLocale, PlaceholderCopy>;
