import type { Technology } from '@domain-app/entities/technology';
import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type { Blip } from '@presentation-core/organisms/radar';

export function parseEntries(
  areas: Array<TechnologyArea>,
  stages: Array<TechnologyStage>,
  technologies: Array<Technology>,
): Array<Blip> {
  return technologies.map((tech, index) => ({
    id: index,
    quadrant: areas.findIndex(area => tech.areas.find(a => a.id === area.id)),
    ring: stages.findIndex(stage => stage.id === tech.stage.id),
    label: tech.name,
    link: '',
    active: true,
    moved: 0,
  }));
}
