import type { EntityRepository } from '@entifix/business';
import {
  ConfigurationRepositoryTag,
  EntityLoadRequestTag,
  EntityRepositoryTag,
  loadUCFactory,
} from '@entifix/business';
import {
  ConfigurationClientInMemory,
  type Entity,
  type EntityLoadRequest,
  type EntityPage,
} from '@entifix/core';
import { Context, Effect } from 'effect';

/**
 * One page of records, through entifix's own `load` use case (ADR 0003, 0016).
 *
 * The same call answers a page at build time and a filter in the browser; only
 * the repository handed in differs. Going through the use case rather than the
 * repository is what keeps the repository a real adapter behind a real port —
 * the seam a REST adapter replaces.
 */
export function loadThroughUseCase<TEntity extends Entity>(
  repository: EntityRepository,
  request: EntityLoadRequest<TEntity> = {},
): Promise<EntityPage<TEntity>> {
  // A static source reads no configuration, but the port leaves
  // `ConfigurationRepositoryTag` on every method's requirement channel.
  const context = Context.make(EntityRepositoryTag, repository).pipe(
    Context.add(
      ConfigurationRepositoryTag,
      new ConfigurationClientInMemory({}),
    ),
    Context.add(EntityLoadRequestTag, request as unknown as EntityLoadRequest),
  );
  return Effect.runPromise(Effect.provide(loadUCFactory<TEntity>(), context));
}
