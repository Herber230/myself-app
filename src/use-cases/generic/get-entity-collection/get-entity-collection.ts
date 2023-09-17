import { AppError } from '@domain-generic/entities/app-error';
import type { Entity } from '@domain-generic/entities/entity-base';
import type {
  GetEntityCollectionRepository,
  GetEntityCollectionRepositoryOptions,
} from '@domain-generic/repositories/get-entity-collection-repository';

export function getEntityCollection<TEntity extends Entity>(
  provider: GetEntityCollectionRepository<TEntity>,
  options?: GetEntityCollectionRepositoryOptions<TEntity>,
): Promise<Array<TEntity>> {
  return provider(options).catch((error: unknown) =>
    Promise.reject(AppError.handleError(error)),
  );
}
