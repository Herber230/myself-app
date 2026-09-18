/**
 * How a page asks for content: through entifix's own `load` use case, over the
 * repositories `site-content.ts` built (ADR 0003, path A).
 *
 * The use case is what a backend would serve too. Going through it here, rather
 * than reading the arrays directly, is what keeps the static adapter a real
 * `EntityRepository` behind a real port — the seam a REST adapter replaces.
 */
import {
  ConfigurationRepositoryTag,
  EntityLoadRequestTag,
  EntityRepositoryTag,
  loadUCFactory,
} from '@entifix/business';
import {
  ConfigurationClientInMemory,
  type Entity,
  type EntityConstructor,
  type EntityLoadRequest,
  type EntityPage,
} from '@entifix/core';
import { Context, Effect } from 'effect';

import type { SiteRepositories } from './site-content';

/** One page of an entity's records, as the use case returns it. */
export function loadPage<TEntity extends Entity>(
  repositories: SiteRepositories,
  entity: EntityConstructor<TEntity>,
  request: EntityLoadRequest<TEntity> = {},
): Promise<EntityPage<TEntity>> {
  const repository = repositories.get(entity as EntityConstructor<Entity>);
  if (repository === undefined) {
    return Promise.reject(
      new Error(`No repository is registered for ${entity.name}`),
    );
  }
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

/**
 * Every record of an entity, filtered and sorted as asked. The content is a
 * few dozen records per file, so one page as large as can be counted is all
 * of it.
 */
export async function loadEvery<TEntity extends Entity>(
  repositories: SiteRepositories,
  entity: EntityConstructor<TEntity>,
  request: Omit<EntityLoadRequest<TEntity>, 'page' | 'pageSize'> = {},
): Promise<TEntity[]> {
  const page = await loadPage(repositories, entity, {
    ...request,
    page: 1,
    pageSize: Number.MAX_SAFE_INTEGER,
  });
  return page.items;
}
