import { AppError, Entity } from '../../entities';
import type {
  RetrieveEntitySetRepository,
  RetrieveEntitySetRepositoryOptions,
} from '../../repositories';

export function retrieveEntitySet<TEntity extends Entity>(
  provider: RetrieveEntitySetRepository<TEntity>,
  options?: RetrieveEntitySetRepositoryOptions<TEntity>,
): Promise<Array<TEntity>> {
  return provider(options).catch((error: unknown) =>
    Promise.reject(AppError.handleError(error)),
  );
}
