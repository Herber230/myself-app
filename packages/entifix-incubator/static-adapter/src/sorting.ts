import type { Entity, EntitySorting } from '@entifix/core';

import { plainValue } from './link-values.js';

/**
 * Ordering, with the Mongo adapter's rules: a missing value sorts below a
 * present one, numbers and dates compare as themselves, and anything else —
 * a link's id among them — compares as text.
 */
function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  // Mongo sorts missing values below present ones.
  if (left === null || left === undefined) return -1;
  if (right === null || right === undefined) return 1;
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  return String(left).localeCompare(String(right));
}

/**
 * One request's keys, flattened in priority order.
 *
 * `EntitySorting` is a record keyed by a number rather than a list, so the
 * caller states priority explicitly and two entries cannot tie by accident.
 */
function keysOf<TEntity extends Entity>(
  sorting: EntitySorting<TEntity>[],
): ReadonlyArray<{ property: keyof TEntity; type: 'asc' | 'desc' }> {
  return sorting.flatMap(entry =>
    Object.keys(entry)
      .map(Number)
      .sort((a, b) => a - b)
      .map(priority => entry[priority]),
  );
}

/**
 * The records in the order a request asks for, as a new array. No request, or
 * one with no keys, leaves the order the records were given in.
 */
export function applySorting<TEntity extends Entity>(
  records: readonly TEntity[],
  sorting: EntitySorting<TEntity>[] | undefined,
): readonly TEntity[] {
  if (sorting === undefined || sorting.length === 0) return records;
  const keys = keysOf(sorting);
  if (keys.length === 0) return records;

  return [...records].sort((left, right) => {
    for (const key of keys) {
      const compared = compareValues(
        plainValue(left[key.property]),
        plainValue(right[key.property]),
      );
      if (compared !== 0) return key.type === 'desc' ? -compared : compared;
    }
    return 0;
  });
}
