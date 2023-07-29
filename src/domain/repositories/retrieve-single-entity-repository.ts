import type { Entity, EntityId } from '../entities';

export interface RetrieveSingleEntityRepository<TEntity extends Entity> {
  (id: EntityId): Promise<TEntity>;
}
