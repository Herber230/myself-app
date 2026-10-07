import {
  defineSource,
  defineStaticContent,
  type StaticContent,
} from '@myself-app/entifix-incubator-static-adapter';

import { ArchitectureDecision } from '../entities/architecture-decision.entity.js';
import { ArchitectureNode } from '../entities/architecture-node.entity.js';
import { ArchitectureRuntime } from '../entities/architecture-runtime.entity.js';
import { ArchitectureScenario } from '../entities/architecture-scenario.entity.js';
import { Certificate } from '../entities/certificate.entity.js';
import { ContactChannel } from '../entities/contact-channel.entity.js';
import { CvFocus } from '../entities/cv-focus.entity.js';
import { CvVariant } from '../entities/cv-variant.entity.js';
import { Education } from '../entities/education.entity.js';
import { Employer } from '../entities/employer.entity.js';
import { EmploymentHighlight } from '../entities/employment-highlight.entity.js';
import { EmploymentPeriod } from '../entities/employment-period.entity.js';
import { Interest } from '../entities/interest.entity.js';
import { InterestMedia } from '../entities/interest-media.entity.js';
import { LayerPackage } from '../entities/layer-package.entity.js';
import { PackageLayer } from '../entities/package-layer.entity.js';
import { PipelineJob } from '../entities/pipeline-job.entity.js';
import { PipelineScenario } from '../entities/pipeline-scenario.entity.js';
import { PipelineStage } from '../entities/pipeline-stage.entity.js';
import { PipelineStep } from '../entities/pipeline-step.entity.js';
import { Post } from '../entities/post.entity.js';
import { Profile } from '../entities/profile.entity.js';
import { Project } from '../entities/project.entity.js';
import { ProjectPath } from '../entities/project-path.entity.js';
import { ProjectPattern } from '../entities/project-pattern.entity.js';
import { Quadrant } from '../entities/quadrant.entity.js';
import { RadarEdition } from '../entities/radar-edition.entity.js';
import { RefusedImport } from '../entities/refused-import.entity.js';
import { Ring } from '../entities/ring.entity.js';
import { ScenarioStep } from '../entities/scenario-step.entity.js';
import { Tag } from '../entities/tag.entity.js';
import { Technology } from '../entities/technology.entity.js';
import { TechnologyArea } from '../entities/technology-area.entity.js';
import { TechnologyUsePeriod } from '../entities/technology-use-period.entity.js';
import { SITE_LOCALES } from '../locales.js';
import { localizedMembersOf } from '../localized-members.js';
import {
  statusMatchesSupersession,
  supersedesWithinProject,
} from '../rules.js';

/**
 * A small site for the use cases' specs: every entity, a few records each,
 * shaped to exercise an order, a filter and a link. The real content is held
 * to its own checks where it is wired (`implementation/adapters`), so these
 * stay put when it changes.
 */

type Records = Record<string, unknown>[];

/** The same text in both locales. */
const text = (value: string) => ({ en: value, es: `${value} (es)` });

/** Every post's body, per locale, as its Markdown sidecar would hold it. */
const BODIES: Record<string, { en: string; es: string }> = {
  'on-typescript': {
    en: 'Types at the edges.\n\nThen everywhere else.',
    es: 'Tipos en los bordes.',
  },
  'on-testing': { en: 'word '.repeat(401), es: 'palabra' },
  'a-draft': { en: 'Not yet.', es: 'Aún no.' },
};

/** Every decision record's body, as its Markdown file would hold it. */
const DECISION_BODIES: Record<string, string> = {
  'engine-0001': '## Context\n\nA first decision.',
  'engine-0002': '## Context\n\nA second one.',
};

export const FIXTURE_RECORDS: Readonly<Record<string, Records>> = {
  'profile.json': [
    {
      id: 'ada',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      title: text('Engineer'),
      tagline: text('Analytical engines'),
      bio: text('Wrote the first program.'),
      pictureUrl: 'https://example.com/ada.png',
      pictureAlt: text('Ada'),
      location: text('London'),
    },
  ],
  'contact-channels.json': [
    {
      id: 'email',
      type: 'email',
      displayName: 'ada@example.com',
      url: 'mailto:ada@example.com',
      order: 1,
    },
    {
      id: 'github',
      type: 'github',
      displayName: 'ada',
      url: 'https://github.com/ada',
      order: 0,
    },
    {
      id: 'goodreads',
      type: 'goodreads',
      displayName: 'Ada reads',
      url: 'https://www.goodreads.com/ada',
      personal: true,
      order: 3,
    },
    {
      id: 'instagram',
      type: 'instagram',
      displayName: 'ada.photos',
      url: 'https://www.instagram.com/ada/',
      personal: true,
      order: 2,
    },
  ],
  'employers.json': [
    { id: 'acme', name: 'Acme' },
    { id: 'globex', name: 'Globex' },
  ],
  'employment-periods.json': [
    {
      id: 'acme-engineer',
      employer: 'acme',
      role: text('Engineer'),
      responsibilities: text('Engines.'),
      start: '2015-01-01',
      end: '2019-12-31',
      technologies: ['typescript', 'jest'],
    },
    {
      id: 'globex-architect',
      employer: 'globex',
      role: text('Architect'),
      responsibilities: text('Plans.'),
      start: '2020-01-01',
      technologies: ['typescript'],
    },
  ],
  'cv-focuses.json': [
    { id: 'backend', name: text('Backend'), order: 0 },
    { id: 'frontend', name: text('Frontend'), order: 1 },
  ],
  'cv-variants.json': [
    {
      id: 'backend',
      title: text('Backend engineer'),
      summary: text('Servers.'),
      technologies: ['typescript'],
      employments: ['acme-engineer'],
      focuses: ['backend'],
      order: 1,
    },
    {
      id: 'full-stack',
      title: text('Engineer'),
      summary: text('Everything.'),
      technologies: ['react', 'typescript'],
      employments: ['globex-architect', 'acme-engineer'],
      focuses: ['backend', 'frontend'],
      order: 0,
    },
  ],
  'employment-highlights.json': [
    {
      id: 'migration',
      period: 'acme-engineer',
      text: text('Migrated.'),
      focuses: ['backend'],
      order: 1,
    },
    {
      id: 'redesign',
      period: 'acme-engineer',
      text: text('Redesigned.'),
      focuses: ['frontend'],
      order: 0,
    },
    {
      id: 'platform',
      period: 'globex-architect',
      text: text('Platform.'),
      focuses: ['frontend'],
      order: 0,
    },
  ],
  'education.json': [
    {
      id: 'masters',
      degree: text("Master's"),
      field: text('Computing'),
      institution: 'University',
      start: '2016-01-01',
      end: '2017-12-31',
      completed: false,
      order: 1,
    },
    {
      id: 'bachelors',
      degree: text("Bachelor's"),
      field: text('Engineering'),
      institution: 'College',
      start: '2008-01-01',
      end: '2014-12-31',
      completed: true,
      order: 0,
    },
  ],
  'certificates.json': [
    { id: 'scrum', name: 'Scrum', issuer: 'Scrum.org', order: 1 },
    { id: 'cloud', name: 'Cloud', issuer: 'A cloud', order: 0 },
  ],
  'quadrants.json': [
    {
      id: 'techniques',
      order: 0,
      name: text('Techniques'),
      description: text('How.'),
    },
    { id: 'tools', order: 2, name: text('Tools'), description: text('With.') },
  ],
  'rings.json': [
    { id: 'adopt', order: 0, name: text('Adopt'), description: text('Use.') },
    { id: 'trial', order: 1, name: text('Trial'), description: text('Try.') },
    { id: 'hold', order: 3, name: text('Hold'), description: text('Stop.') },
  ],
  'technology-areas.json': [
    { id: 'web', name: text('Web'), description: text('Pages.') },
    { id: 'quality', name: text('Quality'), description: text('Checks.') },
  ],
  'technologies.json': [
    {
      id: 'typescript',
      name: text('TypeScript'),
      description: text('Types.'),
      quadrant: 'tools',
      ring: 'adopt',
      areas: ['web', 'quality'],
    },
    {
      id: 'react',
      name: text('React'),
      description: text('Views.'),
      quadrant: 'tools',
      ring: 'trial',
      areas: ['web'],
    },
    {
      id: 'jest',
      name: text('Jest'),
      description: text('Tests.'),
      quadrant: 'techniques',
      ring: 'hold',
      areas: ['quality'],
    },
  ],
  'technology-use-periods.json': [
    {
      id: 'jest-hold',
      technology: 'jest',
      ring: 'hold',
      start: '2026-01-01',
    },
    {
      id: 'jest-adopt',
      technology: 'jest',
      ring: 'adopt',
      start: '2017-08-01',
      end: '2026-01-01',
    },
    {
      id: 'typescript-adopt',
      technology: 'typescript',
      ring: 'adopt',
      start: '2017-08-01',
    },
    {
      id: 'react-trial',
      technology: 'react',
      ring: 'trial',
      start: '2025-06-01',
    },
  ],
  'radar-editions.json': [
    { id: 'first', date: '2025-01-01' },
    { id: 'second', date: '2025-09-01' },
  ],
  'projects.json': [
    {
      id: 'engine',
      name: 'engine',
      summary: text('An engine.'),
      repositoryUrl: 'https://example.com/engine',
      technologies: ['typescript', 'react'],
      featured: true,
      order: 1,
    },
    {
      id: 'library',
      name: 'library',
      summary: text('A library.'),
      repositoryUrl: 'https://example.com/library',
      technologies: ['typescript'],
      featured: true,
      order: 0,
    },
    {
      id: 'side-project',
      name: 'side',
      summary: text('A side project.'),
      repositoryUrl: 'https://example.com/side',
      technologies: ['jest'],
      featured: false,
      order: 2,
    },
  ],
  'project-patterns.json': [
    {
      id: 'engine-ports',
      project: 'engine',
      name: text('Ports'),
      summary: text('Adapters behind ports.'),
      order: 1,
    },
    {
      id: 'engine-entities',
      project: 'engine',
      name: text('Entities'),
      summary: text('Metadata first.'),
      order: 0,
    },
    {
      id: 'library-books',
      project: 'library',
      name: text('Books'),
      summary: text('On shelves.'),
      order: 0,
    },
  ],
  // The architecture views (ADR 0022).
  'architecture-runtimes.json': [],
  'architecture-nodes.json': [],
  'architecture-scenarios.json': [],
  'scenario-steps.json': [],
  'package-layers.json': [],
  'layer-packages.json': [],
  'refused-imports.json': [],
  // The delivery pipeline (ADR 0023).
  'pipeline-stages.json': [],
  'pipeline-jobs.json': [],
  'pipeline-scenarios.json': [],
  'pipeline-steps.json': [],
  'project-paths.json': [
    {
      id: 'engine-src',
      project: 'engine',
      path: 'src/',
      note: text('The code.'),
      order: 0,
    },
    {
      id: 'engine-docs',
      project: 'engine',
      path: 'docs/adr/',
      note: text('The decisions.'),
      order: 1,
    },
  ],
  'adrs.json': [
    {
      id: 'engine-0002',
      number: 2,
      title: 'Ports everywhere',
      status: 'accepted',
      date: '2025-02-01',
      area: 'platform',
      readWhen: 'adding an adapter',
      summary: 'Every edge is a port.\nAdapters sit outside.',
      project: 'engine',
      supersedes: ['engine-0001'],
    },
    {
      id: 'engine-0001',
      number: 1,
      title: 'A single adapter',
      status: 'superseded-in-part',
      date: '2025-01-01',
      area: 'platform',
      project: 'engine',
      supersedes: [],
    },
    {
      id: 'library-0001',
      number: 1,
      title: 'Shelves by subject',
      status: 'proposed',
      date: '2025-03-01',
      area: 'data',
      project: 'library',
      supersedes: [],
    },
  ],
  'tags.json': [
    { id: 'architecture', label: text('architecture') },
    { id: 'testing', label: text('testing') },
  ],
  'posts.json': [
    {
      id: 'on-testing',
      title: text('On testing'),
      summary: text('Tests.'),
      publishedAt: '2025-01-01',
      updatedAt: '2025-02-01',
      draft: false,
      tags: ['testing'],
      technologies: ['jest', 'typescript'],
    },
    {
      id: 'on-typescript',
      title: text('On TypeScript'),
      summary: text('Types.'),
      publishedAt: '2026-03-01',
      draft: false,
      tags: ['architecture'],
      technologies: ['typescript'],
    },
    {
      id: 'a-draft',
      title: text('A draft'),
      summary: text('Soon.'),
      publishedAt: '2026-05-01',
      draft: true,
      tags: ['architecture'],
      technologies: [],
    },
  ],
  'interests.json': [
    {
      id: 'chess',
      name: text('Chess'),
      summary: text('Sixty-four squares.'),
      posts: [],
      order: 1,
    },
    {
      id: 'reading',
      name: text('Reading'),
      summary: text('Books.'),
      posts: ['on-typescript', 'on-testing'],
      order: 0,
    },
  ],
  'interest-media.json': [
    {
      id: 'board',
      interest: 'chess',
      kind: 'photo',
      src: '/beyond-code/board.webp',
      alt: text('A board'),
      featured: false,
      order: 0,
    },
    {
      id: 'shelf',
      interest: 'reading',
      kind: 'photo',
      src: '/beyond-code/shelf.webp',
      thumbnail: '/beyond-code/shelf-thumb.webp',
      alt: text('A shelf'),
      featured: true,
      order: 1,
    },
    {
      id: 'library',
      interest: 'reading',
      kind: 'video',
      src: '/beyond-code/library.mp4',
      poster: '/beyond-code/library.webp',
      alt: text('A library'),
      featured: true,
      order: 0,
    },
  ],
};

const SOURCES = [
  defineSource({ entity: Profile, file: 'profile.json' }),
  defineSource({ entity: ContactChannel, file: 'contact-channels.json' }),
  defineSource({ entity: Employer, file: 'employers.json' }),
  defineSource({ entity: EmploymentPeriod, file: 'employment-periods.json' }),
  defineSource({ entity: CvFocus, file: 'cv-focuses.json' }),
  defineSource({ entity: CvVariant, file: 'cv-variants.json' }),
  defineSource({
    entity: EmploymentHighlight,
    file: 'employment-highlights.json',
  }),
  defineSource({ entity: Education, file: 'education.json' }),
  defineSource({ entity: Certificate, file: 'certificates.json' }),
  defineSource({ entity: Quadrant, file: 'quadrants.json' }),
  defineSource({ entity: Ring, file: 'rings.json' }),
  defineSource({ entity: TechnologyArea, file: 'technology-areas.json' }),
  defineSource({ entity: Technology, file: 'technologies.json' }),
  defineSource({
    entity: TechnologyUsePeriod,
    file: 'technology-use-periods.json',
  }),
  defineSource({ entity: RadarEdition, file: 'radar-editions.json' }),
  defineSource({
    entity: Project,
    file: 'projects.json',
    sidecars: {
      overview: (id, locale) =>
        id === 'engine' ? `The engine, in ${locale}.` : undefined,
    },
  }),
  defineSource({ entity: ProjectPattern, file: 'project-patterns.json' }),
  defineSource({ entity: ProjectPath, file: 'project-paths.json' }),
  defineSource({
    entity: ArchitectureRuntime,
    file: 'architecture-runtimes.json',
  }),
  defineSource({ entity: ArchitectureNode, file: 'architecture-nodes.json' }),
  defineSource({
    entity: ArchitectureScenario,
    file: 'architecture-scenarios.json',
  }),
  defineSource({ entity: ScenarioStep, file: 'scenario-steps.json' }),
  defineSource({ entity: PackageLayer, file: 'package-layers.json' }),
  defineSource({ entity: LayerPackage, file: 'layer-packages.json' }),
  defineSource({ entity: RefusedImport, file: 'refused-imports.json' }),
  defineSource({ entity: PipelineStage, file: 'pipeline-stages.json' }),
  defineSource({ entity: PipelineJob, file: 'pipeline-jobs.json' }),
  defineSource({ entity: PipelineScenario, file: 'pipeline-scenarios.json' }),
  defineSource({ entity: PipelineStep, file: 'pipeline-steps.json' }),
  defineSource({
    entity: ArchitectureDecision,
    file: 'adrs.json',
    plainSidecars: { body: id => DECISION_BODIES[id] },
    rules: [supersedesWithinProject, statusMatchesSupersession],
  }),
  defineSource({ entity: Tag, file: 'tags.json' }),
  defineSource({
    entity: Post,
    file: 'posts.json',
    sidecars: {
      body: (id, locale) => BODIES[id]?.[locale as 'en' | 'es'],
    },
  }),
  defineSource({
    entity: Interest,
    file: 'interests.json',
    sidecars: { body: (id, locale) => `About ${id}, in ${locale}.` },
  }),
  defineSource({ entity: InterestMedia, file: 'interest-media.json' }),
];

/** The fixture site, with any file replaced by `overrides`. */
export function fixtureContent(
  overrides: Readonly<Record<string, Records>> = {},
): StaticContent {
  return defineStaticContent({ ...FIXTURE_RECORDS, ...overrides }, SOURCES, {
    locales: SITE_LOCALES,
    localizedMembersOf,
  });
}
