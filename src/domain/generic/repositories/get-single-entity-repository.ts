import type { Entity, EntityId } from '@domain-generic/entities/entity-base';

export interface GetSingleEntityRepository<TEntity extends Entity> {
  (id: EntityId): Promise<TEntity>;
}
