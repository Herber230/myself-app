import { AppError } from '@domain-generic/entities/app-error';
import type { Entity } from '@domain-generic/entities/entity-base';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';

export function ingestCollectionSourceUC<
  TEntity extends Entity,
  TRetrieving extends Retrieving<TEntity>,
>(
  source: CollectionSourceRepository<TEntity>,
  retrievingOptions?: TRetrieving,
): Promise<Array<TEntity>> {
  if (source == null) return Promise.resolve([]);

  if (source instanceof Array) return Promise.resolve(source);

  if (source instanceof Promise)
    return source.catch(e => Promise.reject(AppError.handleError(e)));

  if (typeof source === 'function')
    return ingestCollectionSourceUC(
      source(retrievingOptions),
      retrievingOptions,
    );

  return Promise.reject(
    new AppError({
      message: 'Invalid collection source',
      isException: true,
    }),
  );
}
