import type { EntityRule } from './validation.js';

/**
 * The rules every content source ends up needing, which entity metadata cannot
 * yet express (entifix#39): how many records a file holds, a collection that
 * must not be empty, a member that must be there, one date not before another.
 *
 * Each is a factory, named for what it holds a source to. A rule only one site
 * knows is still written by that site as an `EntityRule`.
 */

/** `one`, `two`… up to ten, then the digits: how a message counts. */
const COUNTS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];
const counted = (n: number) => COUNTS[n] ?? String(n);
const isOrAre = (n: number) => (n === 1 ? 'is' : 'are');
const records = (n: number) => `${n} record${n === 1 ? '' : 's'}`;

/** The file holds exactly `n` records: `exactly(1)` for a site's one profile. */
export function exactly(n: number): EntityRule {
  return (held, report) => {
    if (held.length !== n) {
      report(
        0,
        undefined,
        `holds ${records(held.length)}, where ${counted(n)} ${isOrAre(n)} expected`,
      );
    }
  };
}

/** The file holds at least `n` records. */
export function atLeast(n: number): EntityRule {
  return (held, report) => {
    if (held.length < n) {
      report(
        0,
        undefined,
        `holds ${held.length === 0 ? 'no record' : records(held.length)}, where at least ${counted(n)} ${isOrAre(n)} expected`,
      );
    }
  };
}

/**
 * Every record's `member` holds at least one element. `why` finishes the
 * message with what an empty one would cost: `is empty, so … `.
 */
export function nonEmpty(member: string, why?: string): EntityRule {
  return (records, report) => {
    records.forEach((record, index) => {
      const value = record[member];
      if (!Array.isArray(value) || value.length === 0) {
        report(
          index,
          member,
          why === undefined ? 'is empty' : `is empty, ${why}`,
        );
      }
    });
  };
}

/**
 * Every record has `member`, when the metadata cannot say so: a member left
 * out of a published view (a post's body) is optional on the entity and
 * required of its source.
 */
export function present(member: string): EntityRule {
  return (records, report) => {
    records.forEach((record, index) => {
      if (record[member] === undefined) {
        report(index, member, 'is required, and is missing');
      }
    });
  };
}

/** A record's `later` date, when it has one, is not before its `earlier`. */
export function notBefore(later: string, earlier: string): EntityRule {
  return (records, report) => {
    records.forEach((record, index) => {
      const end = record[later];
      const start = record[earlier];
      if (start instanceof Date && end instanceof Date && end < start) {
        report(index, later, `is before ${earlier}`);
      }
    });
  };
}
