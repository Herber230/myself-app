import { TechnologyArea } from '@domain-app/entities/technology-area';
import { TechnologyStage } from '@domain-app/entities/technology-stage';
import { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';

export interface TechnologySearchPanelState {
  areaSelection: Array<TechnologyArea>;
  stageSelection: Array<TechnologyStage>;
}

export interface TechnologySearchPanelProps {
  areaSource: CollectionSourceRepository<TechnologyArea>;
  stageSource: CollectionSourceRepository<TechnologyStage>;
  state: TechnologySearchPanelState;
  onChange: (state: TechnologySearchPanelState) => void;
}
