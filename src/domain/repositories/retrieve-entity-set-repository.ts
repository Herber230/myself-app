import type { Entity, Filters, Sorting } from '../entities';

export interface RetrieveEntitySetRepositoryOptions<TEntity extends Entity> {
  filters?: Filters<TEntity>;
  sorting?: Sorting<TEntity>;
}

export interface RetrieveEntitySetRepository<TEntity extends Entity> {
  (options?: RetrieveEntitySetRepositoryOptions<TEntity>): Promise<
    Array<TEntity>
  >;
}
