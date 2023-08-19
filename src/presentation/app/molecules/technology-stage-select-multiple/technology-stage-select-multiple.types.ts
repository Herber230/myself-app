import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';

export interface TechnologyStageSelectMultipleProps {
  source: CollectionSourceRepository<TechnologyStage>;
  selection: Array<TechnologyStage>;
  onChange: (newSelection: Array<TechnologyStage>) => void;
}
