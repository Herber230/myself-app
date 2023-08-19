import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';

export interface TechnologyAreaSelectMultipleProps {
  source: CollectionSourceRepository<TechnologyArea>;
  selection: Array<TechnologyArea>;
  onChange: (newSelection: Array<TechnologyArea>) => void;
}
