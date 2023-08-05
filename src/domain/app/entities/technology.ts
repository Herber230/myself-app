import type { EntityId } from '@domain-generic/entities/entity-base';

import type { TechnologyArea } from './technology-area';

export interface Technology {
  id: EntityId;
  name: string;
  description: string;
  site?: string;
  repositoryUrl?: string;
  areas: Array<TechnologyArea>;
}
