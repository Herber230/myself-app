/**
 * Each rule factory, with records that pass it and records that break it.
 */
import { describe, expect, it } from 'vitest';

import { atLeast, exactly, nonEmpty, notBefore, present } from './rules.js';
import type { EntityRule } from './validation.js';

type Row = Readonly<Record<string, unknown>>;

/** Every problem a rule reports, as `<index> <member> <message>`. */
function problems(rule: EntityRule, records: readonly Row[]): string[] {
  const found: string[] = [];
  rule(records, (index, member, message) =>
    found.push([String(index), member, message].filter(Boolean).join(' ')),
  );
  return found;
}

const rows = (n: number): Row[] =>
  Array.from({ length: n }, (_, index) => ({ id: `r${index}` }));

describe('exactly', () => {
  it('passes the count it names', () => {
    expect(problems(exactly(1), rows(1))).toEqual([]);
  });

  it('names the count it held and the one it expected', () => {
    expect(problems(exactly(1), rows(2))).toEqual([
      '0 holds 2 records, where one is expected',
    ]);
    expect(problems(exactly(3), rows(0))).toEqual([
      '0 holds 0 records, where three are expected',
    ]);
    expect(problems(exactly(12), rows(1))).toEqual([
      '0 holds 1 record, where 12 are expected',
    ]);
  });
});

describe('atLeast', () => {
  it('passes the count it names, and more', () => {
    expect(problems(atLeast(1), rows(1))).toEqual([]);
    expect(problems(atLeast(1), rows(4))).toEqual([]);
  });

  it('names what it held, in words', () => {
    expect(problems(atLeast(1), rows(0))).toEqual([
      '0 holds no record, where at least one is expected',
    ]);
    expect(problems(atLeast(2), rows(1))).toEqual([
      '0 holds 1 record, where at least two are expected',
    ]);
    expect(problems(atLeast(3), rows(2))).toEqual([
      '0 holds 2 records, where at least three are expected',
    ]);
  });
});

describe('nonEmpty', () => {
  it('passes a list with an element', () => {
    expect(problems(nonEmpty('tags'), [{ tags: ['a'] }])).toEqual([]);
  });

  it('reports an empty or missing list, with why when given', () => {
    expect(problems(nonEmpty('tags'), [{ tags: [] }, {}])).toEqual([
      '0 tags is empty',
      '1 tags is empty',
    ]);
    expect(
      problems(nonEmpty('tags', 'so it relates to nothing'), [{ tags: [] }]),
    ).toEqual(['0 tags is empty, so it relates to nothing']);
  });
});

describe('present', () => {
  it('passes a member that is there, whatever it holds', () => {
    expect(problems(present('body'), [{ body: '' }, { body: null }])).toEqual(
      [],
    );
  });

  it('reports one that is not', () => {
    expect(problems(present('body'), [{ body: 'x' }, {}])).toEqual([
      '1 body is required, and is missing',
    ]);
  });
});

describe('notBefore', () => {
  const start = new Date('2020-01-01');
  const later = new Date('2021-01-01');

  it('passes an end after its start, the same day, or no end', () => {
    expect(
      problems(notBefore('end', 'start'), [
        { start, end: later },
        { start, end: start },
        { start },
        { end: start },
      ]),
    ).toEqual([]);
  });

  it('reports an end before its start', () => {
    expect(
      problems(notBefore('end', 'start'), [{ start: later, end: start }]),
    ).toEqual(['0 end is before start']);
  });
});
