import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';

export interface TechRadarPageSearch {
  areaSelection: Array<TechnologyArea>;
  stageSelection: Array<TechnologyStage>;
}
