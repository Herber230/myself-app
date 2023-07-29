import { RetrieveSingleEntityRepository } from '@domain/repositories';

import { AppError, type Entity, type EntityId } from '../../entities';

export function retrieveSingleEntity<TEntity extends Entity>(
  provider: RetrieveSingleEntityRepository<TEntity>,
  id: EntityId,
): Promise<TEntity> {
  return provider(id).catch((error: unknown) =>
    Promise.reject(AppError.handleError(error)),
  );
}
