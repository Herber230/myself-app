import type { EntityId } from './entity-base';

export interface TechnologyStage {
  id: EntityId;
  order: number;
  name: string;
  description: string;
}
