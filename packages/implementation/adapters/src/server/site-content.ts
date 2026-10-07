/**
 * The composition root for content (ADR 0002, 0003, 0018): where the JSON of
 * `@myself-app/content`, the entities of `@myself-app/domain` and the static
 * adapter meet.
 *
 * It runs once, while `next build` renders the pages, and never in the
 * browser. Every record is validated before any repository serves it, so a
 * record that is wrong stops the export with the path to what is wrong
 * rather than rendering `undefined` into a page. What is left here is the
 * site's own: which file holds which entity, and which rules apply to it (the
 * rules only the site knows are the domain's).
 */
import {
  ArchitectureDecision,
  ArchitectureNode,
  ArchitectureRuntime,
  ArchitectureScenario,
  Certificate,
  connectsOthers,
  ContactChannel,
  CvFocus,
  CvVariant,
  Education,
  Employer,
  EmploymentHighlight,
  EmploymentPeriod,
  folderOrNote,
  Interest,
  InterestMedia,
  jobInItsWorkflow,
  LayerPackage,
  localizedMembersOf,
  oneChannelPerType,
  PackageLayer,
  PipelineJob,
  PipelineScenario,
  PipelineStage,
  PipelineStep,
  Post,
  Profile,
  Project,
  ProjectPath,
  ProjectPattern,
  Quadrant,
  RadarEdition,
  RefusedImport,
  refusesOthers,
  Ring,
  ScenarioStep,
  SITE_LOCALES,
  statusMatchesSupersession,
  supersedesWithinProject,
  Tag,
  Technology,
  TechnologyArea,
  TechnologyUsePeriod,
  travelsBothEnds,
  variantIdNotReserved,
} from '@myself-app/domain';
import {
  atLeast,
  type ContentSource,
  defineSource,
  defineStaticContent,
  exactly,
  nonEmpty,
  notBefore,
  present,
  type StaticContent,
} from '@myself-app/entifix-incubator-static-adapter';

import {
  readDecisionBodyFile,
  readInterestBodyFile,
  readPostBodyFile,
  readProjectOverviewFile,
} from './post-bodies.js';

export const CONTENT_SOURCES: readonly ContentSource[] = [
  // One profile: the site is about one person.
  defineSource({ entity: Profile, file: 'profile.json', rules: [exactly(1)] }),
  defineSource({
    entity: ContactChannel,
    file: 'contact-channels.json',
    rules: [oneChannelPerType],
  }),
  defineSource({ entity: Employer, file: 'employers.json' }),
  defineSource({
    entity: EmploymentPeriod,
    file: 'employment-periods.json',
    rules: [notBefore('end', 'start')],
  }),
  defineSource({ entity: TechnologyArea, file: 'technology-areas.json' }),
  defineSource({ entity: Quadrant, file: 'quadrants.json' }),
  defineSource({ entity: Ring, file: 'rings.json' }),
  defineSource({
    entity: RadarEdition,
    file: 'radar-editions.json',
    // A blip's movement is measured against an edition.
    rules: [atLeast(1)],
  }),
  defineSource({ entity: Technology, file: 'technologies.json' }),
  defineSource({
    entity: TechnologyUsePeriod,
    file: 'technology-use-periods.json',
    rules: [notBefore('end', 'start')],
  }),
  defineSource({
    entity: Project,
    file: 'projects.json',
    // Its page's overview is Markdown beside the record (#77).
    sidecars: { overview: readProjectOverviewFile },
    rules: [present('overview')],
    published: { omit: ['overview'] },
  }),
  defineSource({ entity: ProjectPattern, file: 'project-patterns.json' }),
  defineSource({ entity: ProjectPath, file: 'project-paths.json' }),
  // A project's hexagon and its layers (ADR 0022): read at build only.
  defineSource({
    entity: ArchitectureRuntime,
    file: 'architecture-runtimes.json',
  }),
  defineSource({
    entity: ArchitectureNode,
    file: 'architecture-nodes.json',
    rules: [connectsOthers],
  }),
  defineSource({
    entity: ArchitectureScenario,
    file: 'architecture-scenarios.json',
  }),
  defineSource({
    entity: ScenarioStep,
    file: 'scenario-steps.json',
    rules: [travelsBothEnds],
  }),
  defineSource({ entity: PackageLayer, file: 'package-layers.json' }),
  defineSource({
    entity: LayerPackage,
    file: 'layer-packages.json',
    rules: [folderOrNote],
  }),
  defineSource({
    entity: RefusedImport,
    file: 'refused-imports.json',
    rules: [refusesOthers],
  }),
  // A project's delivery pipeline (ADR 0023): read at build only. The
  // conventions spec holds its jobs to the workflow files.
  defineSource({ entity: PipelineStage, file: 'pipeline-stages.json' }),
  defineSource({
    entity: PipelineJob,
    file: 'pipeline-jobs.json',
    rules: [jobInItsWorkflow],
  }),
  defineSource({ entity: PipelineScenario, file: 'pipeline-scenarios.json' }),
  defineSource({ entity: PipelineStep, file: 'pipeline-steps.json' }),
  defineSource({
    entity: ArchitectureDecision,
    file: 'adrs.json',
    // Copied from each repository's docs/adr, in English only (ADR 0020).
    plainSidecars: { body: readDecisionBodyFile },
    rules: [
      present('body'),
      // The sync script reads it from the record's Decision section.
      present('summary'),
      supersedesWithinProject,
      statusMatchesSupersession,
    ],
    // The explorer filters and sorts; it reads no body.
    published: { omit: ['body'] },
  }),
  defineSource({
    entity: Interest,
    file: 'interests.json',
    // Its section is Markdown beside the record, like a project's overview.
    sidecars: { body: readInterestBodyFile },
    rules: [present('body')],
    published: { omit: ['body'] },
  }),
  defineSource({ entity: InterestMedia, file: 'interest-media.json' }),
  defineSource({ entity: CvFocus, file: 'cv-focuses.json' }),
  defineSource({
    entity: EmploymentHighlight,
    file: 'employment-highlights.json',
  }),
  defineSource({
    entity: CvVariant,
    file: 'cv-variants.json',
    rules: [
      variantIdNotReserved,
      nonEmpty('focuses', 'so the variant shows no highlight'),
    ],
  }),
  defineSource({
    entity: Education,
    file: 'education.json',
    rules: [notBefore('end', 'start')],
  }),
  defineSource({ entity: Certificate, file: 'certificates.json' }),
  defineSource({ entity: Tag, file: 'tags.json' }),
  defineSource({
    entity: Post,
    file: 'posts.json',
    // Its body is Markdown beside the record (ADR 0017).
    sidecars: { body: readPostBodyFile },
    rules: [
      // Optional on the entity, which the browser's copy lacks (ADR 0017).
      present('body'),
      // Tags are what relate posts to each other.
      nonEmpty('tags', 'so the post relates to nothing'),
    ],
    // The blog's filter needs no body, and a draft is never exported.
    published: {
      request: {
        filtering: [{ property: 'draft', operator: 'eq', value: false }],
      },
      omit: ['body'],
    },
  }),
];

/** The site's content, validated and served. */
export type SiteContent = StaticContent;

/**
 * Validates every file, then serves each entity from its own repository.
 * Every problem in every file is reported at once.
 */
export function buildSiteContent(
  records: Readonly<Record<string, readonly unknown[]>>,
  sources: readonly ContentSource[] = CONTENT_SOURCES,
): SiteContent {
  return defineStaticContent(records, sources, {
    locales: SITE_LOCALES,
    localizedMembersOf,
  });
}
