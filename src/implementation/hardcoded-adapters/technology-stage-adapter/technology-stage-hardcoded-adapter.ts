import { AppError, type TechnologyStage } from '@domain/entities';
import type { RetrieveEntitySetRepository } from '@domain/repositories';

import { technologyStageHardcodedData } from './data';

export const technologyStageHardcodedAdapter: RetrieveEntitySetRepository<
  TechnologyStage
> = (options) => {
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

  return Promise.resolve(technologyStageHardcodedData);
};
