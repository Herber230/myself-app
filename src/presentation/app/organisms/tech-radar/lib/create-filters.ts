import { Technology } from '@domain-app/entities/technology';
import { TechnologyArea } from '@domain-app/entities/technology-area';
import { TechnologyStage } from '@domain-app/entities/technology-stage';
import { Filters } from '@domain-generic/entities/entity-filtering';

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
