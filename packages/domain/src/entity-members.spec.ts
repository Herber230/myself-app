/**
 * Every member of every entity, written and read back.
 *
 * Driven by the metadata rather than by a list, so a member added to a class
 * without being described — or described as a type it does not hold — is
 * caught here instead of at the moment the adapter maps a record onto it.
 *
 * The values are the ones each declared type admits; what is asserted is only
 * that the pair round-trips. What each member *means* is asserted in
 * `entities.spec.ts`.
 */
import {
  COLLECTION_TYPES,
  describeEntityColumns,
  type Entity,
  type EntityCollectionLink,
  type EntityConstructor,
  type EntityFieldDescriptor,
  type EntityLink,
} from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { Certificate } from './entities/certificate.entity.js';
import { ContactChannel } from './entities/contact-channel.entity.js';
import { CvFocus } from './entities/cv-focus.entity.js';
import { CvVariant } from './entities/cv-variant.entity.js';
import { Education } from './entities/education.entity.js';
import { Employer } from './entities/employer.entity.js';
import { EmploymentHighlight } from './entities/employment-highlight.entity.js';
import { EmploymentPeriod } from './entities/employment-period.entity.js';
import { Profile } from './entities/profile.entity.js';
import { Project } from './entities/project.entity.js';
import { Quadrant } from './entities/quadrant.entity.js';
import { RadarEdition } from './entities/radar-edition.entity.js';
import { Ring } from './entities/ring.entity.js';
import { Technology } from './entities/technology.entity.js';
import { TechnologyArea } from './entities/technology-area.entity.js';
import { TechnologyUsePeriod } from './entities/technology-use-period.entity.js';
import { SITE_LOCALES } from './locales.js';
import { localizedMembersOf } from './localized-members.js';
import { isLocalizedText } from './localized-text.js';

const ENTITIES: ReadonlyArray<[string, EntityConstructor<Entity>]> = [
  ['Profile', Profile],
  ['ContactChannel', ContactChannel],
  ['Employer', Employer],
  ['EmploymentPeriod', EmploymentPeriod],
  ['TechnologyArea', TechnologyArea],
  ['Quadrant', Quadrant],
  ['Ring', Ring],
  ['RadarEdition', RadarEdition],
  ['Technology', Technology],
  ['TechnologyUsePeriod', TechnologyUsePeriod],
  ['Project', Project],
  ['CvVariant', CvVariant],
  ['CvFocus', CvFocus],
  ['EmploymentHighlight', EmploymentHighlight],
  ['Education', Education],
  ['Certificate', Certificate],
];

const SAMPLE_DATE = new Date('2024-03-01T00:00:00.000Z');

/** A value the member's declared type admits. */
function sampleFor(
  column: EntityFieldDescriptor,
  localized: readonly string[],
): unknown {
  if (localized.includes(column.name)) {
    return Object.fromEntries(
      SITE_LOCALES.map(locale => [locale, `${column.name} in ${locale}`]),
    );
  }
  switch (column.type) {
    case 'id':
      return `${column.name}-1`;
    case 'number':
      return 7;
    case 'boolean':
      return true;
    case 'date':
      return SAMPLE_DATE;
    case 'enum':
      return column.enumValues?.[0];
    default:
      return `a ${column.name}`;
  }
}

describe.each(ENTITIES)('%s', (name, entityConstructor) => {
  const instance = new entityConstructor() as unknown as Record<
    string,
    unknown
  >;
  const columns = describeEntityColumns(entityConstructor);
  const localized = localizedMembersOf(entityConstructor);

  it('describes at least its id and one member of its own', () => {
    // Pinned: a `describeEntityColumns` that reported nothing would make every
    // case below vacuous.
    expect(columns.length, name).toBeGreaterThan(1);
  });

  const scalars = columns.filter(
    column => !COLLECTION_TYPES.includes(column.type) && column.type !== 'link',
  );

  it.each(scalars.map(column => [column.name, column] as const))(
    'reads back the %s it was given',
    (member, column) => {
      const value = sampleFor(column, localized);
      instance[member] = value;
      expect(instance[member], member).toEqual(value);
      if (localized.includes(member)) {
        expect(isLocalizedText(instance[member]), member).toBe(true);
      }
    },
  );

  const relations = columns.filter(
    column => column.type === 'link' || COLLECTION_TYPES.includes(column.type),
  );

  it.each(relations.map(column => [column.name, column] as const))(
    'hands out a %s link that knows its target',
    (member, column) => {
      const link = instance[member] as
        EntityLink<Entity> | EntityCollectionLink<Entity>;
      expect(link, member).toBeDefined();
      expect(link.entityConstructor, member).toBeTypeOf('function');
      // Getter-only on purpose: a link is populated through the mapping, and a
      // setter would let a caller swap the target type out from under it.
      expect(link.isLoaded, member).toBe(false);
      expect(column.filterable, member).toBe(false);
    },
  );
});
