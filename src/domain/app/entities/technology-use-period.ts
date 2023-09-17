import type { EntityId } from '@domain-generic/entities/entity-base';

import type { Technology } from './technology';
import type { TechnologyStage } from './technology-stage';

export interface TechnologyUsePeriod {
  id: EntityId;
  technology: Technology;
  stage: TechnologyStage;
  start: Date;
  end?: Date;
}
