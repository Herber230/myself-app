import type { EntityRepository } from '@entifix/business';
import {
  deserializeEntityCollection,
  type Entity,
  type EntityConstructor,
} from '@entifix/core';
import {
  makeStaticRepository,
  withDatesParsed,
} from '@myself-app/static-adapter';
import { Effect } from 'effect';

/** Where a repository comes from: asked for once, answered once. */
export type EntitySource = () => Promise<EntityRepository>;

/**
 * A read-only repository over the records a static JSON file holds, as
 * `serializeEntityCollection` wrote them (ADR 0016).
 *
 * The file is fetched the first time the source is asked, and the repository
 * built from it is kept: a filter asks again on every change, and the file
 * never changes under a page. A failed fetch is not kept, so the next ask
 * tries again.
 */
export function staticJsonSource<TEntity extends Entity>(
  entity: EntityConstructor<TEntity>,
  url: string,
  fetchFile: typeof fetch = (...args) => fetch(...args),
): EntitySource {
  let repository: Promise<EntityRepository> | undefined;
  const build = async () => {
    const response = await fetchFile(url);
    if (!response.ok) {
      throw new Error(`Could not read ${url}: ${response.status}`);
    }
    const body: unknown = await response.json();
    if (!Array.isArray(body)) {
      throw new Error(`${url} does not hold a list of records`);
    }
    const records = await Effect.runPromise(
      deserializeEntityCollection(entity, withDatesParsed(entity, body)),
    );
    return makeStaticRepository(entity, records as readonly TEntity[]);
  };
  return () => {
    repository ??= build().catch((error: unknown) => {
      repository = undefined;
      throw error;
    });
    return repository;
  };
}
