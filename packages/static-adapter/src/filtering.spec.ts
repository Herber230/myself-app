/**
 * Every operator the port declares, against the Mongo adapter's meaning.
 *
 * The failure this exists to catch is the one entifix's own in-memory double
 * has: `in` compared against a whole array instead of its elements, so
 * "technologies in any of these areas" matched nothing and reported no error
 * (entifix#34). The array cases below are the ones that differ.
 */
import type { Entity, EntityFiltering, EntityId } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { applyFiltering } from './filtering.js';

interface Row extends Entity {
  id: EntityId;
  name: string;
  size: number;
  areas: string[];
  retiredAt?: Date | null;
}

const ROWS: Row[] = [
  {
    id: 'a',
    name: 'Alpha',
    size: 10,
    areas: ['web', 'build'],
    retiredAt: new Date('2020-01-01'),
  },
  { id: 'b', name: 'Beta', size: 20, areas: ['web'], retiredAt: null },
  { id: 'c', name: 'Gamma', size: 30, areas: ['data'] },
];

const ids = (filtering: EntityFiltering<Row>[] | undefined) =>
  applyFiltering(ROWS, filtering).map(row => row.id);

describe('no filtering at all', () => {
  it('keeps every record', () => {
    expect(ids(undefined)).toEqual(['a', 'b', 'c']);
    expect(ids([])).toEqual(['a', 'b', 'c']);
  });
});

describe('the binary operators', () => {
  it('compare a scalar as Mongo does', () => {
    expect(ids([{ property: 'size', operator: 'eq', value: 20 }])).toEqual([
      'b',
    ]);
    expect(ids([{ property: 'size', operator: 'ne', value: 20 }])).toEqual([
      'a',
      'c',
    ]);
    expect(ids([{ property: 'size', operator: 'gt', value: 20 }])).toEqual([
      'c',
    ]);
    expect(ids([{ property: 'size', operator: 'gte', value: 20 }])).toEqual([
      'b',
      'c',
    ]);
    expect(ids([{ property: 'size', operator: 'lt', value: 20 }])).toEqual([
      'a',
    ]);
    expect(ids([{ property: 'size', operator: 'lte', value: 20 }])).toEqual([
      'a',
      'b',
    ]);
  });

  it('compare a date by its instant, not by identity', () => {
    // Two Date objects for the same moment are never `===`, so an adapter that
    // compared them directly would answer nothing here.
    expect(
      ids([
        {
          property: 'retiredAt',
          operator: 'eq',
          value: new Date('2020-01-01'),
        },
      ]),
    ).toEqual(['a']);
  });
});

describe('the array operators', () => {
  it('match any element of a member that holds an array', () => {
    // Mongo's `$in`. entifix's in-memory double answers `[]` here.
    expect(
      ids([{ property: 'areas', operator: 'in', values: [['web']] as never }]),
    ).toEqual([]);
    expect(
      ids([
        {
          property: 'areas',
          operator: 'in',
          values: ['web', 'data'] as never,
        },
      ]),
    ).toEqual(['a', 'b', 'c']);
    expect(
      ids([{ property: 'areas', operator: 'in', values: ['data'] as never }]),
    ).toEqual(['c']);
  });

  it('exclude any element for nin', () => {
    expect(
      ids([{ property: 'areas', operator: 'nin', values: ['web'] as never }]),
    ).toEqual(['c']);
  });

  it('still match a scalar member', () => {
    expect(
      ids([{ property: 'id', operator: 'in', values: ['a', 'c'] }]),
    ).toEqual(['a', 'c']);
    expect(ids([{ property: 'id', operator: 'nin', values: ['a'] }])).toEqual([
      'b',
      'c',
    ]);
  });
});

describe('the range operators', () => {
  it('include both bounds', () => {
    expect(
      ids([{ property: 'size', operator: 'between', start: 10, end: 20 }]),
    ).toEqual(['a', 'b']);
  });

  it('invert to everything outside them', () => {
    expect(
      ids([{ property: 'size', operator: 'nbetween', start: 10, end: 20 }]),
    ).toEqual(['c']);
  });
});

describe('the string operators', () => {
  it('match a substring, ignoring case', () => {
    expect(ids([{ property: 'name', operator: 'like', value: 'ET' }])).toEqual([
      'b',
    ]);
    expect(ids([{ property: 'name', operator: 'nlike', value: 'a' }])).toEqual(
      [],
    );
  });

  it('treat a missing value as empty rather than throwing', () => {
    expect(
      ids([{ property: 'retiredAt', operator: 'like', value: 'anything' }]),
    ).toEqual([]);
  });
});

describe('the null operators', () => {
  it('count both null and absent as null', () => {
    expect(ids([{ property: 'retiredAt', operator: 'isNull' }])).toEqual([
      'b',
      'c',
    ]);
    expect(ids([{ property: 'retiredAt', operator: 'isNotNull' }])).toEqual([
      'a',
    ]);
  });
});

describe('groups and several entries', () => {
  it('combine every top-level entry with and', () => {
    expect(
      ids([
        { property: 'size', operator: 'gte', value: 20 },
        { property: 'name', operator: 'like', value: 'a' },
      ]),
    ).toEqual(['b', 'c']);
  });

  it('combine an entry that is itself a list with and', () => {
    expect(
      ids([
        [
          { property: 'size', operator: 'gte', value: 20 },
          { property: 'id', operator: 'eq', value: 'c' },
        ],
      ]),
    ).toEqual(['c']);
  });

  it('take either branch of an or', () => {
    expect(
      ids([
        {
          operator: 'or',
          values: [
            { property: 'id', operator: 'eq', value: 'a' },
            { property: 'id', operator: 'eq', value: 'c' },
          ],
        },
      ]),
    ).toEqual(['a', 'c']);
  });

  it('nest a group inside a group', () => {
    expect(
      ids([
        {
          operator: 'and',
          values: [
            { property: 'size', operator: 'gte', value: 10 },
            {
              operator: 'or',
              values: [
                { property: 'name', operator: 'eq', value: 'Alpha' },
                { property: 'name', operator: 'eq', value: 'Gamma' },
              ],
            },
          ],
        },
      ]),
    ).toEqual(['a', 'c']);
  });
});
