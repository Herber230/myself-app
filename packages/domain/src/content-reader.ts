import {
  ConfigurationRepositoryTag,
  createEntityLinkResolver,
  EntityLoadRequestTag,
  type EntityRepository,
  EntityRepositoryTag,
  type LinkMember,
  loadAllUCFactory,
  resolveLinksUCFactory,
  type UnpagedRequest,
} from '@entifix/business';
import {
  ConfigurationClientInMemory,
  EntifixLogicError,
  type Entity,
  type EntityConstructor,
  type EntityLoadRequest,
} from '@entifix/core';
import { Context, Effect } from 'effect';

/**
 * How the use cases read content, whatever holds it (ADR 0024): every record
 * a request keeps, with the links asked for resolved. It is built on
 * entifix's own ports — an `EntityRepository` per entity, the `loadAll` and
 * `resolveLinks` use cases, entifix's link resolver — so a source is swapped
 * by handing over other repositories: static files at build time today, a
 * REST or Mongo adapter tomorrow.
 */
export interface ContentReader {
  /**
   * Every record a request keeps, filtered and sorted as it asks, with the
   * links named in `resolve` read as the records they point at.
   */
  loadAll<TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request?: UnpagedRequest<TEntity>,
    options?: LoadAllOptions<TEntity>,
  ): Promise<TEntity[]>;
  /**
   * Resolves links of records already loaded — the second step from a
   * record, as a CV's employments to their employers.
   */
  resolve<TEntity extends Entity>(
    records: readonly TEntity[],
    members: readonly LinkMember<TEntity>[],
  ): Promise<TEntity[]>;
  /** The ids of every record a request keeps, as text. */
  ids<TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request?: UnpagedRequest<TEntity>,
  ): Promise<string[]>;
}

export interface LoadAllOptions<TEntity extends Entity> {
  /** The link members to resolve on every record loaded. */
  readonly resolve?: readonly LinkMember<TEntity>[];
}

/** Each entity, and the repository that serves it. */
export type EntityRepositories = ReadonlyArray<
  readonly [EntityConstructor<Entity>, EntityRepository]
>;

/**
 * A reader over `repositories`. Links resolve through the same repositories,
 * so every entity a link points at must be among them.
 */
export function makeContentReader(
  repositories: EntityRepositories,
): ContentReader {
  // No repository here reads configuration, but the port leaves
  // `ConfigurationRepositoryTag` on every method's requirement channel.
  const configuration = Context.make(
    ConfigurationRepositoryTag,
    new ConfigurationClientInMemory({}),
  );
  const byEntity = new Map(repositories);
  const resolver = createEntityLinkResolver(
    configuration,
    repositories.map(
      ([entity, repository]) =>
        [entity, Context.make(EntityRepositoryTag, repository)] as const,
    ),
  );

  const resolve = <TEntity extends Entity>(
    records: readonly TEntity[],
    members: readonly LinkMember<TEntity>[],
  ) =>
    Effect.runPromise(
      Effect.provide(resolveLinksUCFactory(records, members), resolver),
    );

  const loadAll = async <TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request: UnpagedRequest<TEntity> = {},
    { resolve: members = [] }: LoadAllOptions<TEntity> = {},
  ): Promise<TEntity[]> => {
    const repository = byEntity.get(entity as EntityConstructor<Entity>);
    if (repository === undefined) {
      throw new EntifixLogicError(`No repository serves ${entity.name}`);
    }
    const context = Context.make(EntityRepositoryTag, repository).pipe(
      Context.merge(configuration),
      Context.add(
        EntityLoadRequestTag,
        request as unknown as EntityLoadRequest,
      ),
    );
    const records = await Effect.runPromise(
      Effect.provide(loadAllUCFactory<TEntity>(), context),
    );
    return resolve(records, members);
  };

  return {
    loadAll,
    resolve,
    async ids(entity, request) {
      const records = await loadAll(entity, request);
      return records.map(record => String(record.id));
    },
  };
}
