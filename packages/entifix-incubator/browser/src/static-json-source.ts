import type { EntityRepository } from '@entifix/business';
import {
  type Entity,
  type EntityConstructor,
  extractMetaEntity,
} from '@entifix/core';
import type { EntitySource } from '@entifix/react-integration/url';
import { staticRepositoryFromRecords } from '@entifix/static';

/**
 * A read-only repository over the records a static JSON file holds, as
 * `serializeEntityCollection` wrote them (ADR 0016), through `view` where the
 * entity declares it: the members the view leaves out are not asked of a
 * record. `@entifix/static` checks every record and parses its dates before
 * anything is served.
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
  view = 'published',
): EntitySource {
  const declared = extractMetaEntity(entity).views ?? {};
  const options = view in declared ? { source: url, view } : { source: url };
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
    return staticRepositoryFromRecords(entity, body, options);
  };
  return () => {
    repository ??= build().catch((error: unknown) => {
      repository = undefined;
      throw error;
    });
    return repository;
  };
}
