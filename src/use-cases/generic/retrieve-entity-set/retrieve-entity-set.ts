import { AppError } from '@domain-generic/entities/app-error';
import { Entity } from '@domain-generic/entities/entity-base';
import type {
  RetrieveEntitySetRepository,
  RetrieveEntitySetRepositoryOptions,
} from '@domain-generic/repositories/retrieve-entity-set-repository';

export function retrieveEntitySet<TEntity extends Entity>(
  provider: RetrieveEntitySetRepository<TEntity>,
  options?: RetrieveEntitySetRepositoryOptions<TEntity>,
): Promise<Array<TEntity>> {
  return provider(options).catch((error: unknown) =>
    Promise.reject(AppError.handleError(error)),
  );
}
