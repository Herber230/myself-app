import { AppError } from '@domain-generic/entities/app-error';
import {
  type Entity,
  type EntityId,
} from '@domain-generic/entities/entity-base';
import type { RetrieveSingleEntityRepository } from '@domain-generic/repositories/retrieve-single-entity-repository';

export function retrieveSingleEntity<TEntity extends Entity>(
  provider: RetrieveSingleEntityRepository<TEntity>,
  id: EntityId,
): Promise<TEntity> {
  return provider(id).catch((error: unknown) =>
    Promise.reject(AppError.handleError(error)),
  );
}
