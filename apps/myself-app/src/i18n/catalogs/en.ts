/**
 * The site's UI copy in English — the `site` namespace. The shape every other
 * locale must match.
 */
export const en = {
  siteName: 'Herber Colop',
  home: 'Home',
  cv: 'CV',
  /** The narrow screen's menu button. */
  menu: 'Menu',
  techRadar: 'Tech radar',
  /** The language menu. Each language is named in itself, in every locale. */
  language: {
    label: 'Language',
    en: 'English',
    es: 'Español',
  },
  cvLead: 'One page, in four readings. Print it, or download it as a PDF.',
  /** The CV page around the sheet: its controls, hidden in print. */
  cvPage: {
    variants: 'Reading',
    mode: 'Written for',
    modes: {
      human: 'People',
      ats: 'Applicant tracking systems',
    },
    atsTitle: 'ATS',
    download: 'Download PDF',
    /** The prebuilt PDF's subject, in its metadata. */
    pdfSubject: 'Curriculum vitae',
    print: 'Print or save as PDF',
    printHint:
      'For a clean sheet: A4, margins none, headers and footers off, background graphics on.',
    /** Tailoring the human sheet before printing (#38, ADR 0015). */
    customize: {
      label: 'Customize',
      sections: 'Sections',
      positions: 'Positions',
      technologies: 'Technologies',
      reset: 'Show everything',
      downloadNote:
        'The download is the full sheet; printing keeps what you chose.',
    },
  },
  /** The CV sheet (ADR 0012). Headings are copy; every fact is content. */
  cvSheet: {
    headings: {
      summary: 'Summary',
      skills: 'Technical skills',
      experience: 'Experience',
      education: 'Education',
      certificates: 'Certificates',
    },
    present: 'Present',
    notCompleted: 'not completed',
    location: 'Location',
  },
  /** A contact channel's name: the CV's ATS labels, the landing's link names. */
  channels: {
    email: 'Email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    stackoverflow: 'Stack Overflow',
    medium: 'Medium',
    goodreads: 'Goodreads',
    x: 'X',
  },
  techRadarLead:
    'The technologies and techniques I use, and how far I trust each one.',
  redirecting: 'Continue to the English site',
  notFoundTitle: 'Page not found',
  notFoundLead: 'This page does not exist.',
  /** The landing page (ADR 0008, 0011). Facts come from `Profile`, not here. */
  landing: {
    hero: {
      cv: 'Read my CV',
      techRadar: 'Explore my tech radar',
      scroll: 'Scroll to read more',
    },
    /** The section nav's anchors. */
    nav: {
      label: 'Sections',
      about: 'About',
      projects: 'Projects',
      entifix: 'entifix',
      contact: 'Contact',
    },
    /** Each section's heading. */
    headings: {
      about: 'About me',
      projects: 'Projects',
      entifix: 'Built on entifix',
      contact: 'Contact',
    },
    projects: {
      /** Names the list of a project's technologies. */
      technologies: 'Technologies in {{project}}',
      site: 'Visit the site',
      repository: 'Read the source',
    },
    /** Copy, not content (ADR 0008): each claim is one `content/` makes true. */
    entifix: {
      what: 'entifix is a TypeScript framework for entity-driven applications, built on Effect. An entity is described once, and its metadata drives validation, repositories, use cases and React controls.',
      here: 'This page runs on it. The profile, the projects and the contact channels are entities, stored as JSON in English and Spanish, checked against their metadata by a static repository, and read at build time through the load use case, the same one a backend would serve.',
      repository: 'Source on GitHub',
      npm: 'Packages on npm',
    },
    contact: {
      /** A link's name: the channel, then the handle it shows. */
      link: '{{channel}}: {{handle}}',
    },
  },
  theme: {
    label: 'Theme',
    blue: 'Blue',
    light: 'Light',
    dark: 'Dark',
  },
  /**
   * The radar's quadrants and rings, in index order: Thoughtworks' names, kept
   * for a one-person radar (#39, ADR 0014). What each ring means is content
   * (`rings.json`); the control takes the names as props, never the SVG.
   */
  radar: {
    chartLabel:
      'Tech radar: four quadrants of technologies, ringed by how far I trust them',
    legend: 'Every blip, by quadrant and ring',
    ringKey: 'What the rings mean',
    quadrants: {
      techniques: 'Techniques',
      tools: 'Tools',
      platforms: 'Platforms',
      languages: 'Languages & frameworks',
    },
    filter: {
      label: 'Filter the radar',
      quadrant: 'Quadrant',
      ring: 'Ring',
      area: 'Area',
      search: 'Search',
      clear: 'Show everything',
      showing: 'Showing {{shown}} of {{total}}',
    },
    detail: {
      back: '← Back to the radar',
      quadrant: 'Quadrant',
      ring: 'Ring',
      ringMeaning: '{{ring}} — {{meaning}}',
      areas: 'Areas',
      site: 'Website',
      repository: 'Source',
      history: 'How it moved',
      projects: 'Where I used it',
      noProjects: 'No project on this site uses it yet.',
    },
    rings: {
      adopt: 'Adopt',
      trial: 'Trial',
      assess: 'Assess',
      hold: 'Hold',
    },
  },
} as const;
