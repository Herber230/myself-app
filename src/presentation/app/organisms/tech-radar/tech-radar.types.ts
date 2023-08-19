import type { Technology } from '@domain-app/entities/technology';
import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type { CollectionSourceRepository } from '@domain-generic/repositories/collection-source-repository';
import type { Area, Blip, RingDefinition } from '@presentation-core/organisms/radar';

export interface TechRadarProps {
  areas: TechnologyArea[];
  stages: TechnologyStage[];
  technologySource: CollectionSourceRepository<Technology>;
}

export interface TechRadarState {
  technologies: Array<Technology>;
  areas: Array<TechnologyArea>;
  stages: Array<TechnologyStage>;
  radarEntries: Array<Blip>;
  radarRings: Array<RingDefinition>;
  radarAreas: Array<Area>;
  ready: boolean;
}

export interface TechRadarStateUpdate {
  technologies: Array<Technology>;
  areas: Array<TechnologyArea>;
  stages: Array<TechnologyStage>;
}
