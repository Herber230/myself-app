import type { TechnologyUsePeriod } from '@domain-app/entities/technology-use-period';
import type {
  Filter,
  Filters,
} from '@domain-generic/entities/entity-filtering';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';

import { technologyUsePeriodHardCodedData } from '../data/technology-data';

const applySingleFilter =
  (item: TechnologyUsePeriod) => (filter: Filter<TechnologyUsePeriod>) => {
    throw new Error('Not implemented filter');
  };

const applyFilterSet =
  (filters: Filters<TechnologyUsePeriod>) => (item: TechnologyUsePeriod) =>
    filters.every(applySingleFilter(item));

export function technologyUsePeriodHardcodedAdapter(
  options?: Retrieving<TechnologyUsePeriod>,
): Array<TechnologyUsePeriod> {
  const { filters = [] } = options || {};
  let resultData = technologyUsePeriodHardCodedData;
  if (filters.length) {
    resultData = resultData.filter(applyFilterSet(filters));
  }

  return resultData;
}
