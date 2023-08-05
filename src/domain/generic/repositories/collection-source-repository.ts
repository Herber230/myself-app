import type { Entity } from '@domain-generic/entities/entity-base';

export type CollectionSourceRepository<TEntity extends Entity> =
  | Array<TEntity>
  | Promise<Array<TEntity>>
  | (() => Array<TEntity>)
  | (() => Promise<Array<TEntity>>);
