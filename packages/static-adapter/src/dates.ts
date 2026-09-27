import {
  describeEntityColumns,
  type Entity,
  type EntityConstructor,
} from '@entifix/core';

/**
 * The records with every `date` member held as text turned into a `Date`.
 *
 * entifix's mapping assigns a date member raw, so a record read back from JSON
 * — a file `serializeEntityCollection` wrote — would compare a string where a
 * filter expects an instant. Anything that is not text is left as it is:
 * checking a date is `validateRecords`'s job, not this one's.
 */
export function withDatesParsed<TEntity extends Entity>(
  entityConstructor: EntityConstructor<TEntity>,
  records: readonly unknown[],
): unknown[] {
  const dates = describeEntityColumns(entityConstructor)
    .filter(column => column.type === 'date')
    .map(column => column.key);
  return records.map(record => {
    if (record === null || typeof record !== 'object') return record;
    const parsed: Record<string, unknown> = { ...record };
    for (const key of dates) {
      const value = parsed[key];
      if (typeof value === 'string') parsed[key] = new Date(value);
    }
    return parsed;
  });
}
