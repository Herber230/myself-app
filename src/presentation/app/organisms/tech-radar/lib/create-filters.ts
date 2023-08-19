import type { Technology } from '@domain-app/entities/technology';
import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type { Filters } from '@domain-generic/entities/entity-filtering';

export const createFilters = (
  areas: Array<TechnologyArea>,
  stages: Array<TechnologyStage>,
): Filters<Technology> => [
  {
    property: 'stage',
    operator: 'in',
    value: stages,
  },
  {
    property: 'areas',
    operator: 'in',
    value: [areas],
  },
];
