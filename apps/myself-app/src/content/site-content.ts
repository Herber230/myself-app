/**
 * The composition root for content (ADR 0002, 0003): where the JSON of
 * `@myself-app/content`, the entities of `@myself-app/domain` and the static
 * adapter meet.
 *
 * It runs once, while `next build` renders the pages, and never in the
 * browser. Every record is validated here before any repository serves it,
 * so a record that is wrong stops the export with the path to what is wrong
 * rather than rendering `undefined` into a page.
 */
import type { EntityRepository } from '@entifix/business';
import {
  deserializeEntityCollection,
  type Entity,
  type EntityConstructor,
  type EntityId,
} from '@entifix/core';
import {
  ContactChannel,
  CvVariant,
  Employer,
  EmploymentPeriod,
  localizedMembersOf,
  Profile,
  Project,
  Quadrant,
  Ring,
  SITE_LOCALES,
  Technology,
  TechnologyArea,
  TechnologyUsePeriod,
} from '@myself-app/domain';
import {
  ContentValidationError,
  type EntityRule,
  makeStaticRepository,
  validateRecords,
  type ValidationProblem,
} from '@myself-app/static-adapter';
import { Effect } from 'effect';

/** One entity, the file it is read from, and what its links point at. */
interface ContentSource {
  readonly entity: EntityConstructor<Entity>;
  readonly file: string;
  /** Each link member, and the file whose ids it may name. */
  readonly links?: Readonly<Record<string, string>>;
  readonly rules?: readonly EntityRule[];
}

/** A period's `end`, when it has one, is not before its `start`. */
const endNotBeforeStart: EntityRule = (records, report) => {
  records.forEach((record, index) => {
    const { start, end } = record;
    if (start instanceof Date && end instanceof Date && end < start) {
      report(index, 'end', 'is before start');
    }
  });
};

/** At most one `ContactChannel` per type: the keys the reference app had. */
const oneChannelPerType: EntityRule = (records, report) => {
  const seen = new Set<unknown>();
  records.forEach((record, index) => {
    if (seen.has(record.type)) {
      report(index, 'type', `is a second ${String(record.type)} channel`);
    }
    seen.add(record.type);
  });
};

/** One profile: the site is about one person. */
const exactlyOne: EntityRule = (records, report) => {
  if (records.length !== 1) {
    report(
      0,
      undefined,
      `holds ${records.length} records, where one is expected`,
    );
  }
};

export const CONTENT_SOURCES: readonly ContentSource[] = [
  { entity: Profile, file: 'profile.json', rules: [exactlyOne] },
  {
    entity: ContactChannel,
    file: 'contact-channels.json',
    rules: [oneChannelPerType],
  },
  { entity: Employer, file: 'employers.json' },
  {
    entity: EmploymentPeriod,
    file: 'employment-periods.json',
    links: { employer: 'employers.json' },
    rules: [endNotBeforeStart],
  },
  { entity: TechnologyArea, file: 'technology-areas.json' },
  { entity: Quadrant, file: 'quadrants.json' },
  { entity: Ring, file: 'rings.json' },
  {
    entity: Technology,
    file: 'technologies.json',
    links: {
      quadrant: 'quadrants.json',
      ring: 'rings.json',
      areas: 'technology-areas.json',
    },
  },
  {
    entity: TechnologyUsePeriod,
    file: 'technology-use-periods.json',
    links: { technology: 'technologies.json', ring: 'rings.json' },
    rules: [endNotBeforeStart],
  },
  {
    entity: Project,
    file: 'projects.json',
    links: { technologies: 'technologies.json' },
  },
  {
    entity: CvVariant,
    file: 'cv-variants.json',
    links: {
      technologies: 'technologies.json',
      employments: 'employment-periods.json',
    },
  },
];

/** The ids a file declares, so a link into it can be checked. */
function idsOf(records: readonly unknown[] = []): ReadonlySet<EntityId> {
  return new Set(
    records.flatMap(record =>
      record !== null && typeof record === 'object' && 'id' in record
        ? [record.id as EntityId]
        : [],
    ),
  );
}

/** A repository per entity, read by the entity's class. */
export type SiteRepositories = ReadonlyMap<
  EntityConstructor<Entity>,
  EntityRepository
>;

/**
 * Validates every file, then builds a repository over each.
 *
 * Every problem in every file is collected before anything throws, so one
 * build reports all of what is wrong with the content, not the first thing.
 */
export function buildSiteRepositories(
  content: Readonly<Record<string, readonly unknown[]>>,
  sources: readonly ContentSource[] = CONTENT_SOURCES,
): SiteRepositories {
  const problems: ValidationProblem[] = [];
  const validated = sources.map(source => {
    const result = validateRecords(source.entity, content[source.file] ?? [], {
      source: source.file,
      locales: SITE_LOCALES,
      localizedMembers: localizedMembersOf(source.entity),
      linkTargets: Object.fromEntries(
        Object.entries(source.links ?? {}).map(([member, file]) => [
          member,
          idsOf(content[file]),
        ]),
      ),
      rules: source.rules,
    });
    problems.push(...result.problems);
    return { source, records: result.records };
  });

  if (problems.length > 0) throw new ContentValidationError(problems);

  return new Map(
    validated.map(({ source, records }) => {
      const instances = Effect.runSync(
        deserializeEntityCollection(source.entity, records),
      ) as Entity[];
      return [
        source.entity,
        makeStaticRepository(source.entity, instances),
      ] as const;
    }),
  );
}
