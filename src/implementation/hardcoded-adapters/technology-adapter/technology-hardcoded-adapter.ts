import type { Technology } from '@domain-app/entities/technology';
import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type {
  Filter,
  Filters,
} from '@domain-generic/entities/entity-filtering';
import type { Retrieving } from '@domain-generic/entities/entity-retrieving';

import { technologyHardCodedData } from '../data/technology-data';

const applySingleFilter =
  (item: Technology) => (filter: Filter<Technology>) => {
    if (filter.operator === 'in') {
      if (filter.property === 'stage')
        return (
          (filter.value as TechnologyStage[]).find(
            stageFilter => stageFilter.id === item.stage.id,
          ) != null
        );

      if (filter.property === 'areas')
        return (filter.value as unknown as TechnologyArea[][])
          .flatMap(t => t)
          .find(areaFilter =>
            item.areas.find(areaItem => areaItem.id === areaFilter.id),
          );
    }

    throw new Error('Not implemented filter');
  };

const applyFilterSet = (filters: Filters<Technology>) => (item: Technology) =>
  filters.every(applySingleFilter(item));

export function technologyHardcodedAdapter(
  options?: Retrieving<Technology>,
): Array<Technology> {
  const { filters = [] } = options || {};
  let resultData = JSON.parse(
    JSON.stringify(technologyHardCodedData),
  ) as Array<Technology>;

  if (filters.length) {
    resultData = resultData.filter(applyFilterSet(filters));
  }

  return resultData;
}
