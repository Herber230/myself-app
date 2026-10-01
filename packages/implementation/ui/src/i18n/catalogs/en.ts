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
  blog: 'Blog',
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
      contact: 'Professional contact',
    },
    contact: {
      /** A link's name: the channel, then the handle it shows. */
      link: '{{channel}}: {{handle}}',
      lead: 'Open to new roles, collaborations and a good conversation about software. Pick whichever way suits you best.',
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
    decisions: 'Architecture decisions',
    decisionsLead:
      'Every significant decision is recorded, with the symptom that should send a reader — or an agent — to it before the rule is broken.',
    englishOnly: 'The records are written in English.',
    readWhen: 'Read when',
    /** How the records are written, found and kept: the practice, told. */
    practice: {
      summary: 'How the records steer the work',
      lead: 'People and agents read the same records. Each one names the symptom that should send a reader to it, so a rule is found before it is broken, not after.',
      steps: {
        decide: {
          name: 'Decide',
          text: 'A choice that would be costly to undo, or easy to break by accident, gets a numbered record.',
        },
        record: {
          name: 'Record',
          text: 'Its header holds a status, a date, an area and a Read when line: the symptom that should bring a reader back.',
        },
        point: {
          name: 'Point',
          text: 'The repository’s CLAUDE.md sends every agent session to docs/adr, whose README indexes the records.',
        },
        match: {
          name: 'Match',
          text: 'When a task meets a symptom — a failing check, a strange build — the agent finds the record whose Read when names it, and follows its rule.',
        },
        evolve: {
          name: 'Evolve',
          text: 'A fact that changes is corrected in place, on a Revised line. A decision that no longer holds gets a new record that supersedes it. Nothing is deleted.',
        },
      },
      synced:
        'The records below are copied from each repository by a script, and this repository’s CI fails when a copy drifts from its record.',
      /** `{{number}}` is the record's, four digits. */
      anatomy:
        'Anatomy of a record: the header of ADR {{number}}, the newest with a Read when line.',
      callouts: {
        title:
          'A number that never changes, and the decision in one line. The README lists them.',
        status:
          'Where it stands. A superseded record stays, and names the record that replaced it.',
        date: 'When it was decided. A later correction adds a Revised line below, with its own date.',
        area: 'The part of the system it governs.',
        readWhen:
          'What an agent matches against: the symptom it would meet, not the topic.',
      },
    },
    timeline: 'The records in the order they were decided',
    points: 'The decision',
    open: 'Read the record →',
    filter: {
      label: 'Filter the records',
      status: 'Status',
      area: 'Area',
      search: 'Search titles and symptoms',
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
      posts: 'Posts about it',
    },
    rings: {
      adopt: 'Adopt',
      trial: 'Trial',
      assess: 'Assess',
      hold: 'Hold',
    },
  },
  blogLead: 'Notes on what I build and how I build it.',
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
    },
    tags: 'Tags',
    technologies: 'On the radar',
    related: 'Related posts',
    feed: 'RSS feed',
    feedTitle: '{{name}} — Blog',
    /** What each paragraph type is called, above its text. */
    callout: {
      note: 'Note',
      tip: 'Tip',
      warning: 'Warning',
    },
  },
} as const;
