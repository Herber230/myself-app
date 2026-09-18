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
  /**
   * The radar's quadrants and rings, in index order. Thoughtworks' names for
   * now: what they mean on a one-person radar is still open (#39), and the
   * control takes them as props so that decision lands here, not in the SVG.
   */
  radar: {
    chartLabel:
      'Tech radar: four quadrants of technologies, ringed by how far I trust them',
    legend: 'Every blip, by quadrant and ring',
    placeholder: 'Placeholder entries — the real ones arrive with the content.',
    quadrants: {
      techniques: 'Techniques',
      tools: 'Tools',
      platforms: 'Platforms',
      languages: 'Languages & frameworks',
    },
    rings: {
      adopt: 'Adopt',
      trial: 'Trial',
      assess: 'Assess',
      hold: 'Hold',
    },
  },
} as const;
