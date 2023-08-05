import type { Entity, EntityId } from '@domain-generic/entities/entity-base';

export interface RetrieveSingleEntityRepository<TEntity extends Entity> {
  (id: EntityId): Promise<TEntity>;
}
