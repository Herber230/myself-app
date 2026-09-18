import type { EntityRepository } from '@entifix/business';
import {
  deserializeSingleEntity,
  EntifixConnError,
  EntifixLogicError,
  type Entity,
  type EntityConstructor,
  type EntityId,
  type EntityLoadRequest,
  type EntityPage,
  extractMetaAccessors,
  serializeEntity,
} from '@entifix/core';
import { Effect } from 'effect';

import { applyFiltering } from './filtering.js';
import { applySorting } from './sorting.js';

/** The Mongo adapter's defaults, which this one copies exactly. */
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

/**
 * A copy of a record, so a caller can never reach into the store.
 *
 * A serialize/deserialize round trip when the entity has accessors, which is
 * what entifix's own in-memory repository does; a prototype-preserving shallow
 * copy otherwise, because an entity with no metadata has nothing to map
 * through.
 */
function copyOf<TEntity extends Entity>(
  record: TEntity,
): Effect.Effect<TEntity, EntifixConnError> {
  const entityConstructor = record.constructor as EntityConstructor<TEntity>;
  if (extractMetaAccessors(entityConstructor).length === 0) {
    return Effect.succeed(
      Object.assign(
        Object.create(Object.getPrototypeOf(record) as object) as TEntity,
        record,
      ),
    );
  }
  return deserializeSingleEntity(
    entityConstructor,
    serializeEntity(entityConstructor, record),
  ).pipe(
    Effect.map(copy => copy as TEntity),
    Effect.mapError(
      cause =>
        new EntifixConnError(
          `Failed to copy a ${entityConstructor.name} out of the static store`,
          cause,
        ),
    ),
  );
}

export interface StaticRepositoryOptions {
  /**
   * The name used in an error message. Defaults to the entity's class name,
   * which is why the build keeps class names.
   */
  readonly label?: string;
}

/**
 * A read-only `EntityRepository` over records held in memory (ADR 0002).
 *
 * It knows no entity of this site: it is handed a constructor and a list, so
 * promoting it into entifix is a copy rather than a rewrite (entifix#37).
 *
 * `get` and `load` carry the Mongo adapter's semantics — every filter operator,
 * groups, multi-key sorting, 1-based paging defaulting to ten — and hand out
 * copies. `save` and `delete` fail: a static source is read-only, and
 * pretending otherwise is worse than refusing.
 */
export function makeStaticRepository<TEntity extends Entity>(
  entityConstructor: EntityConstructor<TEntity>,
  records: readonly TEntity[],
  { label = entityConstructor.name }: StaticRepositoryOptions = {},
): EntityRepository {
  const stored = [...records];

  const readOnly = (verb: string) =>
    Effect.fail(
      new EntifixLogicError(
        `Cannot ${verb} a ${label}: it is served from static content, which is read-only`,
        undefined,
        { entity: label, operation: verb },
      ),
    );

  const get = (id: EntityId) =>
    Effect.gen(function* () {
      const found = stored.find(record => record.id === id);
      if (found === undefined) {
        return yield* Effect.fail(
          new EntifixConnError(`Entity not found`, undefined, {
            entity: label,
            id,
          }),
        );
      }
      return yield* copyOf(found);
    });

  const load = (request: EntityLoadRequest<TEntity>) =>
    Effect.gen(function* () {
      const matched = applySorting(
        applyFiltering(stored, request.filtering),
        request.sorting,
      );
      const page = request.page ?? DEFAULT_PAGE;
      const pageSize = request.pageSize ?? DEFAULT_PAGE_SIZE;
      const start = (page - 1) * pageSize;
      const items = yield* Effect.forEach(
        matched.slice(start, start + pageSize),
        copyOf,
      );

      return {
        items,
        total: matched.length,
        request,
      } satisfies EntityPage<TEntity>;
    });

  // The port types every method's requirement channel as
  // `ConfigurationRepositoryTag`; these effects require nothing, which is
  // assignable. Cast through the interface to keep the generic signatures, as
  // both of entifix's own adapters do.
  return {
    get,
    load,
    save: () => readOnly('save'),
    delete: () => readOnly('delete'),
  } as unknown as EntityRepository;
}
