import { AppError } from '@domain-generic/entities/app-error';
import type { Entity } from '@domain-generic/entities/entity-base';
import type { InstanceSourceRepository } from '@domain-generic/repositories/instance-source-repository';

export function ingestInstanceSourceUC<TEntity extends Entity>(
  source: InstanceSourceRepository<TEntity>,
): Promise<TEntity> {
  if (source == null)
    return Promise.reject(
      new AppError({
        message: 'Invalid instance source. It cannot be null or undefined',
        isException: true,
      }),
    );

  if (source instanceof Promise)
    return source.catch(e => Promise.reject(AppError.handleError(e)));

  if (typeof source === 'function') return ingestInstanceSourceUC(source());

  return Promise.resolve(source);
}
