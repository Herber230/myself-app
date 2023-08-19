import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { Area } from '@presentation-core/organisms/radar';

export function parseAreas(areas: Array<TechnologyArea>): Array<Area> {
  return areas.map(t => t.name);
}
