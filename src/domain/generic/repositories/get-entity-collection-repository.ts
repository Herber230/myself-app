import type { Entity } from '@domain-generic/entities/entity-base';
import type { Filters } from '@domain-generic/entities/entity-filtering';
import type { Sorting } from '@domain-generic/entities/entity-sorting';

export interface GetEntityCollectionRepositoryOptions<TEntity extends Entity> {
  filters?: Filters<TEntity>;
  sorting?: Sorting<TEntity>;
}

export interface GetEntityCollectionRepository<TEntity extends Entity> {
  (
    options?: GetEntityCollectionRepositoryOptions<TEntity>,
  ): Promise<Array<TEntity>>;
}
