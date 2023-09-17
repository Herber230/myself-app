import type { TechnologyArea } from '@domain-app/entities/technology-area';
import { AppError } from '@domain-generic/entities/app-error';
import type { GetEntityCollectionRepository } from '@domain-generic/repositories/get-entity-collection-repository';

import { technologyAreaHardcodedData } from '../data/technology-data';

export const technologyAreaHardcodedAdapter: GetEntityCollectionRepository<
  TechnologyArea
> = options => {
  if (options?.filters)
    Promise.reject(
      new AppError({
        message: 'Filters on this adapter are not supported yet',
        isException: true,
      }),
    );

  if (options?.sorting)
    Promise.reject(
      new AppError({
        message: 'Sorting son this adapter is not supported yet',
        isException: true,
      }),
    );

  return Promise.resolve(technologyAreaHardcodedData);
};
