import type {
  Entity,
  EntityFilter,
  EntityFiltering,
  FilterGroup,
} from '@entifix/core';

import { plainValue } from './link-values.js';

/**
 * Whether a record matches a filter, with the semantics of the Mongo adapter
 * rather than of entifix's in-memory double (ADR 0002).
 *
 * The one deliberate difference from the double is array membership: `in` and
 * `nin` against a member that holds an array match when **any element**
 * matches, as Mongo's `$in` does. The double compares the whole array with
 * `===` and so never matches (entifix#34), and "technologies in any of these
 * areas" is the first query the radar needs.
 */

/**
 * A group rather than a filter. Copied from entifix's own predicate, which
 * both its implementations share: a group has no `property`, and its operator
 * is one of the two logical ones.
 */
function isFilterGroup<TEntity extends Entity>(
  node: EntityFilter<TEntity> | FilterGroup<TEntity>,
): node is FilterGroup<TEntity> {
  return (
    !('property' in node) && (node.operator === 'and' || node.operator === 'or')
  );
}

/** Mongo's `$regex` with `$options: 'i'`, over a literal needle. */
function matchesLike(actual: unknown, value: string): boolean {
  return String(actual ?? '')
    .toLowerCase()
    .includes(value.toLowerCase());
}

/** `$in` semantics: an array member matches, and so does a scalar. */
function matchesAny(actual: unknown, values: readonly unknown[]): boolean {
  return Array.isArray(actual)
    ? actual.some(element => values.includes(element))
    : values.includes(actual);
}

/**
 * Comparable form of a value. Dates compare by their instant rather than by
 * identity, which is what makes `between` over a period work at all.
 */
function comparable(value: unknown): unknown {
  return value instanceof Date ? value.getTime() : value;
}

function isBelow(actual: unknown, bound: unknown): boolean {
  return (comparable(actual) as number) < (comparable(bound) as number);
}

function isAbove(actual: unknown, bound: unknown): boolean {
  return (comparable(actual) as number) > (comparable(bound) as number);
}

function isEqual(actual: unknown, value: unknown): boolean {
  return comparable(actual) === comparable(value);
}

function matchesFilter<TEntity extends Entity>(
  record: TEntity,
  filter: EntityFilter<TEntity>,
): boolean {
  const actual = plainValue(
    (record as Record<string, unknown>)[filter.property as string],
  );
  switch (filter.operator) {
    case 'eq':
      return isEqual(actual, filter.value);
    case 'ne':
      return !isEqual(actual, filter.value);
    case 'gt':
      return isAbove(actual, filter.value);
    case 'gte':
      return isEqual(actual, filter.value) || isAbove(actual, filter.value);
    case 'lt':
      return isBelow(actual, filter.value);
    case 'lte':
      return isEqual(actual, filter.value) || isBelow(actual, filter.value);
    case 'in':
      return matchesAny(actual, filter.values);
    case 'nin':
      return !matchesAny(actual, filter.values);
    case 'between':
      return !isBelow(actual, filter.start) && !isAbove(actual, filter.end);
    case 'nbetween':
      return isBelow(actual, filter.start) || isAbove(actual, filter.end);
    case 'like':
      return matchesLike(actual, filter.value);
    case 'nlike':
      return !matchesLike(actual, filter.value);
    case 'isNull':
      return actual === null || actual === undefined;
    default:
      // `isNotNull`, the last of the declared operators.
      return actual !== null && actual !== undefined;
  }
}

function matchesNode<TEntity extends Entity>(
  record: TEntity,
  node: EntityFilter<TEntity> | FilterGroup<TEntity>,
): boolean {
  if (!isFilterGroup(node)) return matchesFilter(record, node);
  return node.operator === 'and'
    ? node.values.every(child => matchesNode(record, child))
    : node.values.some(child => matchesNode(record, child));
}

/**
 * The records a request keeps. Every top-level entry is combined with `and`,
 * matching the Mongo adapter's `translateFiltering`; an entry that is itself an
 * array is likewise an `and` of its members.
 */
export function applyFiltering<TEntity extends Entity>(
  records: readonly TEntity[],
  filtering: EntityFiltering<TEntity>[] | undefined,
): readonly TEntity[] {
  if (filtering === undefined || filtering.length === 0) return records;
  return records.filter(record =>
    filtering.every(entry =>
      Array.isArray(entry)
        ? entry.every(child => matchesNode(record, child))
        : matchesNode(record, entry),
    ),
  );
}
