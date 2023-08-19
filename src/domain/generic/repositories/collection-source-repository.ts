import type { Entity } from '@domain-generic/entities/entity-base';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';
export type { Retrieving } from '@domain-generic/entities/entity-retrieving';

export type CollectionSourceRepository<
  TEntity extends Entity,
  TRetrieveOptions = Retrieving<TEntity>,
> =
  | Array<TEntity>
  | Promise<Array<TEntity>>
  | ((options?: TRetrieveOptions) => Array<TEntity>)
  | ((options?: TRetrieveOptions) => Promise<Array<TEntity>>);
