import { TechnologyArea } from '@domain-app/entities/technology-area';
import { TechnologyStage } from '@domain-app/entities/technology-stage';

export interface TechRadarPageSearch {
  areaSelection: Array<TechnologyArea>;
  stageSelection: Array<TechnologyStage>;
}
