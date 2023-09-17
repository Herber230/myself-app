import { AppError } from '@domain-generic/entities/app-error';
import {
  type Entity,
  type EntityId,
} from '@domain-generic/entities/entity-base';
import type { GetSingleEntityRepository } from '@domain-generic/repositories/get-single-entity-repository';

export function getSingleEntity<TEntity extends Entity>(
  provider: GetSingleEntityRepository<TEntity>,
  id: EntityId,
): Promise<TEntity> {
  return provider(id).catch(e => Promise.reject(AppError.handleError(e)));
}
