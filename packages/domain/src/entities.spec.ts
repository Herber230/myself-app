/**
 * The metadata every other layer reads. Three failures these exist to catch,
 * none of which shows up as an error anywhere else:
 *
 * - a class that lost its `@entity()` — `extractMetaEntity` throws at the
 *   moment a page asks for it, during `next build`;
 * - a localized member marked `filterable` or `sortable`, which would have a
 *   generic comparison match an object against text and find nothing;
 * - a member listed in `LOCALIZED_MEMBERS` that no longer exists, which would
 *   make validation check a locale on nothing at all.
 */
import {
  describeEntityColumns,
  type Entity,
  type EntityConstructor,
  type EntityId,
  extractMetaEntity,
  SCALAR_TYPES,
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
import { LOCALIZED_MEMBERS, localizedMembersOf } from './localized-members.js';

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

/** The members `describeEntityColumns` reports, by name. */
const columnsOf = (entityConstructor: EntityConstructor<Entity>) =>
  new Map(
    describeEntityColumns(entityConstructor).map(column => [
      column.name,
      column,
    ]),
  );

describe('every entity the three pages read', () => {
  it('is one of sixteen, and each carries its metadata', () => {
    // Pinned: a table that stopped matching would assert nothing below.
    expect(ENTITIES).toHaveLength(16);
    for (const [name, entityConstructor] of ENTITIES) {
      expect(() => extractMetaEntity(entityConstructor), name).not.toThrow();
    }
  });

  it.each(ENTITIES)(
    '%s declares a key and an id',
    (name, entityConstructor) => {
      const meta = extractMetaEntity(entityConstructor);
      expect(meta.key, name).toMatch(/^[a-z][a-z-]*$/);
      expect(columnsOf(entityConstructor).get('id')?.type, name).toBe('id');
    },
  );

  it.each(ENTITIES)(
    '%s keeps every collection out of the query surface',
    (name, entityConstructor) => {
      // `describeEntityColumns` throws on a queryable collection, so reaching
      // here is half the assertion; the rest guards a member that stopped
      // being reported at all.
      for (const column of describeEntityColumns(entityConstructor)) {
        if (SCALAR_TYPES.includes(column.type)) continue;
        expect(column.filterable, `${name}.${column.name}`).toBe(false);
        expect(column.sortable, `${name}.${column.name}`).toBe(false);
      }
    },
  );
});

describe('a localized member', () => {
  it('is declared for every entity, so none is forgotten', () => {
    expect(LOCALIZED_MEMBERS.size).toBe(ENTITIES.length);
    for (const [, entityConstructor] of ENTITIES) {
      expect(LOCALIZED_MEMBERS.has(entityConstructor)).toBe(true);
    }
  });

  it.each(ENTITIES)(
    '%s localizes members it really has',
    (name, entityConstructor) => {
      const columns = columnsOf(entityConstructor);
      for (const member of localizedMembersOf(entityConstructor)) {
        const column = columns.get(member);
        expect(column, `${name}.${member}`).toBeDefined();
        // It rides on `type: 'string'`, which is what makes it survive entifix's
        // mapping untouched (entifix#36).
        expect(column?.type, `${name}.${member}`).toBe('string');
      }
    },
  );

  it.each(ENTITIES)(
    '%s never lets one be filtered or sorted',
    (name, entityConstructor) => {
      const columns = columnsOf(entityConstructor);
      for (const member of localizedMembersOf(entityConstructor)) {
        expect(columns.get(member)?.filterable, `${name}.${member}`).toBe(
          false,
        );
        expect(columns.get(member)?.sortable, `${name}.${member}`).toBe(false);
      }
    },
  );

  it('covers the text the pages actually render', () => {
    expect(localizedMembersOf(Profile)).toContain('bio');
    expect(localizedMembersOf(EmploymentPeriod)).toContain('responsibilities');
    expect(localizedMembersOf(Technology)).toContain('description');
    expect(localizedMembersOf(CvVariant)).toContain('title');
    // A technique's name translates, so every technology's name is localized.
    expect(localizedMembersOf(Technology)).toContain('name');
    expect(localizedMembersOf(Project)).not.toContain('name');
    expect(localizedMembersOf(ContactChannel)).toEqual([]);
    expect(localizedMembersOf(Profile)).toContain('location');
    expect(localizedMembersOf(EmploymentHighlight)).toEqual(['text']);
    expect(localizedMembersOf(Education)).toEqual(['degree', 'field']);
    // A certificate's name and issuer are proper names.
    expect(localizedMembersOf(Certificate)).toEqual([]);
  });

  it('claims none for an entity the list has never heard of', () => {
    // The adapter is generic and is handed this function, so it is asked about
    // entities from elsewhere — entifix's own contract fixture among them.
    // Answering "none localized" is what lets validation skip them rather than
    // fail on them.
    class Elsewhere implements Entity {
      id: EntityId = 'elsewhere';
    }
    expect(localizedMembersOf(Elsewhere)).toEqual([]);
  });
});

describe('the links between entities', () => {
  it('point where the pages need to walk', () => {
    expect(columnsOf(EmploymentPeriod).get('employer')?.type).toBe('link');
    expect(columnsOf(Technology).get('quadrant')?.type).toBe('link');
    expect(columnsOf(Technology).get('ring')?.type).toBe('link');
    expect(columnsOf(Technology).get('areas')?.type).toBe('linkCollection');
    expect(columnsOf(TechnologyUsePeriod).get('technology')?.type).toBe('link');
    expect(columnsOf(Project).get('technologies')?.type).toBe('linkCollection');
    expect(columnsOf(CvVariant).get('employments')?.type).toBe(
      'linkCollection',
    );
    expect(columnsOf(CvVariant).get('focuses')?.type).toBe('linkCollection');
    expect(columnsOf(EmploymentHighlight).get('period')?.type).toBe('link');
    expect(columnsOf(EmploymentHighlight).get('focuses')?.type).toBe(
      'linkCollection',
    );
  });
});
