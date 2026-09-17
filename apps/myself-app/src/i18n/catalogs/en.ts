/**
 * The site's UI copy in English — the `site` namespace. The shape every other
 * locale must match.
 */
export const en = {
  siteName: 'Herber Colop',
  home: 'Home',
  cv: 'CV',
  techRadar: 'Tech radar',
  /** The name of the *other* language, as the switch shows it. */
  otherLanguage: 'Español',
  homeLead: 'Software engineer. This page is being rebuilt on entifix.',
  cvLead: 'A digital paper sheet, in variants per role. Coming soon.',
  techRadarLead: 'The technologies and techniques I use. Coming soon.',
  redirecting: 'Continue to the English site',
  notFoundTitle: 'Page not found',
  notFoundLead: 'This page does not exist.',
  theme: {
    light: 'Light',
    dark: 'Dark',
  },
} as const;
