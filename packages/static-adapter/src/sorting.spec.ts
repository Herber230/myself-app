/**
 * Ordering, against the Mongo adapter's rules. The rule worth pinning is where
 * a missing value goes: below a present one, which is where Mongo puts it and
 * where a period with no `end` therefore lands.
 */
import type { Entity, EntityId, EntitySorting } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { applySorting } from './sorting.js';

interface Row extends Entity {
  id: EntityId;
  name: string;
  size: number;
  endedAt?: Date;
}

const ROWS: Row[] = [
  { id: 'b', name: 'Beta', size: 20, endedAt: new Date('2021-01-01') },
  { id: 'a', name: 'Alpha', size: 20 },
  { id: 'c', name: 'Gamma', size: 10, endedAt: new Date('2019-01-01') },
];

const ids = (sorting: EntitySorting<Row>[] | undefined) =>
  applySorting(ROWS, sorting).map(row => row.id);

describe('no sorting', () => {
  it('leaves the order the records were given in', () => {
    expect(ids(undefined)).toEqual(['b', 'a', 'c']);
    expect(ids([])).toEqual(['b', 'a', 'c']);
    expect(ids([{}])).toEqual(['b', 'a', 'c']);
  });

  it('does not reorder the list it was handed', () => {
    applySorting(ROWS, [{ 0: { property: 'size', type: 'asc' } }]);
    expect(ROWS.map(row => row.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('one key', () => {
  it('orders ascending by default', () => {
    expect(ids([{ 0: { property: 'name', type: 'asc' } }])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('reverses for desc', () => {
    expect(ids([{ 0: { property: 'name', type: 'desc' } }])).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it('compares numbers as numbers, not as text', () => {
    // '10' sorts before '20' either way, so the case that tells them apart is
    // a number whose text order differs — 9 against 10.
    const rows: Row[] = [
      { id: 'ten', name: 'ten', size: 10 },
      { id: 'nine', name: 'nine', size: 9 },
    ];
    expect(
      applySorting(rows, [{ 0: { property: 'size', type: 'asc' } }]).map(
        row => row.id,
      ),
    ).toEqual(['nine', 'ten']);
  });

  it('compares dates by their instant', () => {
    expect(ids([{ 0: { property: 'endedAt', type: 'asc' } }])).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('puts a missing value below a present one', () => {
    expect(ids([{ 0: { property: 'endedAt', type: 'asc' } }])[0]).toBe('a');
    expect(ids([{ 0: { property: 'endedAt', type: 'desc' } }]).at(-1)).toBe(
      'a',
    );
  });
});

describe('several keys', () => {
  it('breaks a tie with the next key, numbered lowest first', () => {
    // `a` and `b` are both size 20, so the second key decides between them.
    expect(
      ids([
        {
          0: { property: 'size', type: 'asc' },
          1: { property: 'name', type: 'asc' },
        },
      ]),
    ).toEqual(['c', 'a', 'b']);
  });

  it('reads the priority from the key, not from the order written', () => {
    expect(
      ids([
        {
          1: { property: 'name', type: 'asc' },
          0: { property: 'size', type: 'asc' },
        },
      ]),
    ).toEqual(['c', 'a', 'b']);
  });

  it('takes one entry of the list before the next', () => {
    // The request is a list of records, and the list is the outer priority:
    // every key of the first record decides before any key of the second.
    expect(
      ids([
        { 0: { property: 'name', type: 'asc' } },
        { 0: { property: 'size', type: 'asc' } },
      ]),
    ).toEqual(['a', 'b', 'c']);
  });

  it('keeps records that tie on every key', () => {
    const rows: Row[] = [
      { id: 'first', name: 'same', size: 1 },
      { id: 'second', name: 'same', size: 1 },
    ];
    expect(
      applySorting(rows, [{ 0: { property: 'name', type: 'asc' } }]).map(
        row => row.id,
      ),
    ).toEqual(['first', 'second']);
  });
});
