import type { Entity } from '@domain-generic/entities/entity-base';

export type InstanceSourceRepository<TEntity extends Entity> =
  | TEntity
  | Promise<TEntity>
  | (() => TEntity)
  | (() => Promise<TEntity>);
