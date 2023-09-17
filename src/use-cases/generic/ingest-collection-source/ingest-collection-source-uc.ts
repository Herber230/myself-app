import { AppError } from '@domain-generic/entities/app-error';
import type { Entity } from '@domain-generic/entities/entity-base';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';
import { recursiveIngestArray } from '@utils/function/recursive-ingest-array';

export function ingestCollectionSourceUC<
  TEntity extends Entity,
  TRetrieving extends Retrieving<TEntity>,
>(
  source: CollectionSourceRepository<TEntity>,
  retrievingOptions?: TRetrieving,
): Promise<Array<TEntity>> {
  return recursiveIngestArray<TEntity, [TRetrieving | undefined]>(
    source,
    retrievingOptions,
  ).catch(e => Promise.reject(AppError.handleError(e)));
}
