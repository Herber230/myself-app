import type { EntityId } from '@domain-generic/entities/entity-base';

export interface TechnologyArea {
  id: EntityId;
  name: string;
  description: string;
}
