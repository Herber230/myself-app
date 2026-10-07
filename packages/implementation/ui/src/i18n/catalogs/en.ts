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
  // A page's table of contents: a post's, a project's, a record's.
  outline: 'On this page',
  blog: 'Blog',
  /** The language menu. Each language is named in itself, in every locale. */
  language: {
    label: 'Language',
    en: 'English',
    es: 'Español',
  },
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
      'Keeps what you hid. A4, margins none, headers and footers off, background graphics on.',
    /** The ▾ beside Download: printing and sharing this version. */
    downloadMore: 'More ways to save',
    copyLink: 'Copy link to this version',
    linkCopied: 'Link copied',
    /** Tailoring the human sheet before printing (#38, ADR 0015). */
    customize: {
      label: 'Customize',
      hidden: 'Hidden: {{n}}',
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
    technologies: 'Technologies: {{names}}',
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
    facebook: 'Facebook',
    instagram: 'Instagram',
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
      blog: 'Read my blog',
      scroll: 'Scroll to read more',
    },
    /** The section nav's anchors. */
    nav: {
      label: 'Sections',
      about: 'About',
      projects: 'Projects',
      allProjects: 'All projects',
      contact: 'Contact',
    },
    /** Each section's heading. */
    headings: {
      about: 'About me',
      projects: 'Projects',
      contact: 'Get in touch',
    },
    /** The facts beside the bio; their values come from content. */
    about: {
      facts: 'At a glance',
      location: 'Based in',
      since: 'Building software since',
      current: 'Currently',
      role: '{{role}} at {{employer}}',
    },
    contact: {
      /** A link's name: the channel, then the handle it shows. */
      link: '{{channel}}: {{handle}}',
      lead: 'Open to new roles, collaborations and a good conversation about software. Pick whichever way suits you best.',
      /** The link to the default CV's prebuilt PDF, under the cards. */
      cv: 'Download my CV (PDF)',
      /** Each card's cue: what following the channel does. */
      actions: {
        email: 'Send me an email',
        linkedin: 'Connect on LinkedIn',
        github: 'See my code',
        stackoverflow: 'See my answers',
        medium: 'Read my articles',
        goodreads: 'See what I read',
        x: 'Follow me',
        facebook: 'Follow me on Facebook',
        instagram: 'See my photos',
      },
      /** The email card's copy button: its text, its name, its confirmation. */
      copy: 'Copy',
      copyName: 'Copy email address',
      copied: 'Copied',
    },
  },
  /** The "Beyond the code" page, and its teaser on the landing page. */
  beyondCode: {
    title: 'Beyond the code',
    lead: 'Who I am away from the keyboard: the roads, the books and the music that keep me curious, and that shape how I work more than it might seem.',
    teaserLead:
      'Away from the keyboard there are mountain roads, books about the mind and the universe, and salsa.',
    cta: 'Get to know me better',
    back: '← Back to the home page',
    /** The chips that jump to each interest. */
    jump: 'Interests on this page',
    /** A gallery's name. */
    gallery: 'Photos and videos: {{interest}}',
    previous: 'Previous photo',
    next: 'Next photo',
    close: 'Close',
    /** Where a photo sits among the rest: `{at}` and `{of}` are filled in by the browser. */
    position: '{at} of {of}',
    fromTheBlog: 'From the blog',
    /** The personal channels' list: its name. */
    elsewhere: 'Find me elsewhere',
  },
  /** A project's page (#77): how its repository works, and its decisions. */
  projectPage: {
    /** The landing card's cue, beside the project's name. */
    explore: 'How it works',
    back: '← Back to the projects',
    technologies: 'Technologies in {{project}}',
    site: 'Visit the site',
    repository: 'Read the source',
    overview: 'Overview',
    patterns: 'Patterns',
    structure: 'File structure',
    decisions: 'All records',
    /** Under the records' heading: they are copies, kept in step by CI. */
    synced:
      'The records below are copied from each repository by a script, and this repository’s CI fails when a copy drifts from its record.',
    /** A pattern's link to the record that decided it. */
    decisionLink: 'ADR {{number}}',
    englishOnly: 'The records are written in English.',
    readWhen: 'Read when',
    /** The decisions' lifecycle band, first on a project's page. */
    lifecycle: {
      title: 'Decisions that evolve',
      lead: 'I build with coding agents. They write fast; these records keep them right: every decision is written down, and every agent reads it before it acts.',
      totals: '{{records}} records · {{revisions}} revisions',
      legend: 'The states a record lives through',
      /** The cue on the closed band. */
      /** On the closed band: what a record is, and how Claude Code reads it. */
      about:
        'An ADR (architecture decision record) is a short file in the repository: one decision, why it was made, and the symptom that should send a reader back to it. The repository’s CLAUDE.md points Claude Code to them, so every session starts from the same rules a person would read.',
      expand: 'See how it works',
      /** Above the states: what choosing one does. */
      pick: 'Pick a state to see a real record',
      /** A state's count, for a screen reader. */
      count: ', {{count}}',
      states: {
        proposed: { name: 'Proposed', meaning: 'Written, not yet agreed.' },
        accepted: {
          name: 'Accepted',
          meaning: 'The rule. People and agents follow it.',
        },
        revised: {
          name: 'Revised',
          meaning: 'A fact changed; the record is corrected in place.',
        },
        'superseded-in-part': {
          name: 'Superseded in part',
          meaning: 'A newer record replaces part of it.',
        },
        superseded: {
          name: 'Superseded',
          meaning: 'A newer record replaces it. Its text is kept.',
        },
        promoted: {
          name: 'Promoted',
          meaning: 'Incubated here, moved to entifix with its code.',
        },
      },
      none: 'None yet.',
      example: 'ADR {{number}} · {{title}}',
      all: 'See all {{count}} →',
      loopLabel: 'How an agent uses the records',
      loop: {
        symptom: 'A symptom',
        readWhen: 'Its Read when',
        rule: 'The rule, followed',
        evolve: 'Revised or superseded',
      },
    },
    timeline: 'The records in the order they were decided',
    points: 'The decision',
    open: 'Read the record →',
    filter: {
      label: 'Filter the records',
      status: 'Status',
      changes: 'Changes',
      revised: 'Revised',
      area: 'Area',
      search: 'Search',
      /** What to type, while the search is empty: titles and symptoms. */
      placeholder: 'A symptom, a title…',
      /** `{{n}}` is replaced: the card's count of what is in force. */
      active: '{{n}} active',
      /** `{{name}}` is replaced: an active filter's remove button. */
      remove: 'Remove {{name}}',
      clear: 'Clear filters',
      /** `{{shown}}` and `{{total}}` are replaced in the browser. */
      showing: 'Showing {{shown}} of {{total}}',
      empty: 'No record matches the filter.',
      sort: 'Sort by',
      ascending: 'ascending',
      descending: 'descending',
    },
    sort: {
      number: 'Number',
      date: 'Date',
      title: 'Title',
      status: 'Status',
    },
    status: {
      proposed: 'Proposed',
      accepted: 'Accepted',
      'superseded-in-part': 'Superseded in part',
      superseded: 'Superseded',
    },
  },
  /** One decision record's page (#77). */
  decisionPage: {
    back: 'All the decisions of {{project}}',
    number: 'ADR {{number}}',
    date: 'Decided',
    area: 'Area',
    supersedes: 'Supersedes',
    supersededBy: 'Superseded by',
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
    legendHide: 'Hide the list',
    legendShow: 'Show the list',
    legendCount: '{{n}} technologies',
    zoomOut: 'Show the whole radar',
    view: {
      label: 'Show as',
      list: 'List',
      chart: 'Chart',
    },
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
      placeholder: 'Kubernetes, Effect, Nx…',
      title: 'Filters',
      active: '{{n}} active',
      remove: 'Remove {{name}}',
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
      employment: '{{role}} at {{employer}}',
      project: 'A project on this site',
      noProjects: 'Neither a job nor a project on this site has used it yet.',
      posts: 'Posts about it',
    },
    rings: {
      adopt: 'Adopt',
      trial: 'Trial',
      assess: 'Assess',
      hold: 'Hold',
    },
  },
  blogLead:
    'Notes on what I build and how I build it, and essays and stories on everything else.',
  /** The blog (ADR 0017): its home, its filter and each post. */
  blogPage: {
    filter: {
      label: 'Filter the posts',
      tag: 'Tag',
      technology: 'Technology',
      year: 'Year',
      search: 'Search titles',
      clear: 'Show every post',
      showing: 'Showing {{shown}} of {{total}}',
      placeholder: 'TypeScript, architecture…',
      active: '{{n}} active',
      remove: 'Remove {{name}}',
    },
    empty: 'No post matches this filter.',
    published: 'Published',
    updated: 'Updated {{date}}',
    readingTime: '{{minutes}} min read',
    draft: 'Draft',
    back: '← Every post',
    /** The toggle that folds the blog's sidebar away, and back. */
    sidebar: {
      show: 'Show filters',
      hide: 'Hide filters',
      showContents: 'Show contents',
      hideContents: 'Hide contents',
    },
    tags: 'Tags',
    technologies: 'On the radar',
    related: 'Related posts',
    feed: 'RSS feed',
    /** Over the newest post's card, while nothing is filtered. */
    latest: 'Latest',
    /** The folded technology filter: its name and how many there are. */
    moreTechnologies: 'Technology ({{n}})',
    feedTitle: '{{name}} — Blog',
    /** What each paragraph type is called, above its text. */
    callout: {
      note: 'Note',
      tip: 'Tip',
      warning: 'Warning',
    },
  },
} as const;
