import type { Entity } from '@domain-generic/entities/entity-base';
import type { Filters } from '@domain-generic/entities/entity-filtering';
import type { Sorting } from '@domain-generic/entities/entity-sorting';

export interface RetrieveEntitySetRepositoryOptions<TEntity extends Entity> {
  filters?: Filters<TEntity>;
  sorting?: Sorting<TEntity>;
}

export interface RetrieveEntitySetRepository<TEntity extends Entity> {
  (options?: RetrieveEntitySetRepositoryOptions<TEntity>): Promise<
    Array<TEntity>
  >;
}
