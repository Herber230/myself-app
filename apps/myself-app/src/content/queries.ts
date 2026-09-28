/**
 * How a page asks for content: through entifix's own `load` use case, over the
 * repositories `site-content.ts` built (ADR 0003, path A).
 *
 * The use case is what a backend would serve too. Going through it here, rather
 * than reading the arrays directly, is what keeps the static adapter a real
 * `EntityRepository` behind a real port — the seam a REST adapter replaces.
 * The browser's filters make the same call (`@myself-app/entifix-browser`,
 * ADR 0016).
 */
import type {
  Entity,
  EntityConstructor,
  EntityLoadRequest,
  EntityPage,
} from '@entifix/core';
import { loadThroughUseCase } from '@myself-app/entifix-browser';

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
  return loadThroughUseCase(repository, request);
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
