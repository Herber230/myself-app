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
  Certificate,
  ContactChannel,
  CvFocus,
  CvVariant,
  Education,
  Employer,
  EmploymentHighlight,
  EmploymentPeriod,
  localizedMembersOf,
  oneChannelPerType,
  Post,
  Profile,
  Project,
  Quadrant,
  RadarEdition,
  Ring,
  SITE_LOCALES,
  Tag,
  Technology,
  TechnologyArea,
  TechnologyUsePeriod,
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

import { readPostBodyFile } from './post-bodies';

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
  defineSource({ entity: Project, file: 'projects.json' }),
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
