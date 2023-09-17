import type { TechnologySummaryType } from '@domain-app/entities/technology-summary-type';
import type { TechnologyUsePeriod } from '@domain-app/entities/technology-use-period';
import { AppError } from '@domain-generic/entities/app-error';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';
import { recursiveIngestArray } from '@utils/function/recursive-ingest-array';

export function getTechnologyUsePeriodsBySummaryTypeUC(
  provider: CollectionSourceRepository<TechnologyUsePeriod>,
  summaryType: TechnologySummaryType,
): Promise<Array<TechnologyUsePeriod>> {
  //TODO: Implement logic to handle summaryType

  return recursiveIngestArray<TechnologyUsePeriod, []>(provider).catch(
    (e: unknown) => Promise.reject(AppError.handleError(e)),
  );
}
