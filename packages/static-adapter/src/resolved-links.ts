import {
  EntifixLogicError,
  type Entity,
  type EntityCollectionLink,
  type EntityLink,
  type EntityLinkResolver,
} from '@entifix/core';
import { Effect } from 'effect';

/**
 * Links read as the records they name (entifix#38). entifix resolves a link
 * through an `EntityLinkResolver`; this asks it to for chosen members of many
 * records at once, and reads a resolved target without a cast.
 */

/** The members of an entity that link to other records. */
export type LinkMember<TEntity> = {
  [TKey in keyof TEntity & string]: TEntity[TKey] extends {
    readonly entityConstructor: unknown;
    readonly isLoaded: boolean;
  }
    ? TKey
    : never;
}[keyof TEntity & string];

type ResolvableLink = {
  resolve(resolver: EntityLinkResolver): Effect.Effect<unknown, unknown>;
};

/** Resolves `members` of every record, in place, and hands the records back. */
export async function resolveLinks<TEntity extends Entity>(
  records: readonly TEntity[],
  members: readonly LinkMember<TEntity>[],
  resolver: EntityLinkResolver,
): Promise<TEntity[]> {
  await Effect.runPromise(
    Effect.forEach(
      records.flatMap(record =>
        members.map(member =>
          (record[member] as ResolvableLink).resolve(resolver),
        ),
      ),
      resolved => resolved,
      { concurrency: 'unbounded', discard: true },
    ),
  );
  return [...records];
}

/** The record a resolved link names; throws on a link nothing resolved. */
export function targetOf<TEntity extends Entity>(
  link: EntityLink<TEntity>,
): TEntity {
  const { value } = link;
  if (value === undefined) {
    throw new EntifixLogicError(
      `The link to ${link.entityConstructor.name} ${String(link.id)} was read before it was resolved`,
    );
  }
  return value;
}

/** The records a resolved collection names, in its order. */
export function targetsOf<TEntity extends Entity>(
  links: EntityCollectionLink<TEntity>,
): TEntity[] {
  const { values } = links;
  if (values === undefined) {
    throw new EntifixLogicError(
      `The links to ${links.entityConstructor.name} were read before they were resolved`,
    );
  }
  return values;
}
