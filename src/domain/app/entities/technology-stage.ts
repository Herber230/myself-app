import type { EntityId } from '@domain-generic/entities/entity-base';

export interface TechnologyStage {
  id: EntityId;
  order: number;
  name: string;
  description: string;
}
