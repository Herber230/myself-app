import type { EmploymentPeriod } from '@domain-app/entities/employment';
import type {
  Filter,
  Filters,
} from '@domain-generic/entities/entity-filtering';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';

import { employmentPeriodHardCodedData } from '../data/employment-data';

const applySingleFilter =
  (item: EmploymentPeriod) => (filter: Filter<EmploymentPeriod>) => {
    throw new Error('Not implemented filter');
  };

const applyFilterSet =
  (filters: Filters<EmploymentPeriod>) => (item: EmploymentPeriod) =>
    filters.every(applySingleFilter(item));

export function employmentPeriodHardcodedAdapter(
  options?: Retrieving<EmploymentPeriod>,
): Promise<Array<EmploymentPeriod>> {
  const { filters = [] } = options || {};
  let resultData = employmentPeriodHardCodedData;

  if (filters.length) {
    resultData = resultData.filter(applyFilterSet(filters));
  }

  return Promise.resolve(resultData);
}
