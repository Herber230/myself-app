import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import type { RingDefinition } from '@presentation-core/organisms/radar';

const colors = [
  '#632ec7',
  '#c72e2e',
  '#c7a92e',
  '#2ec7c7',
  '#2ec72e',
  '#2e2ec7',
  '#c72ec7',
  '#2ec7a9',
  '#c72e2e',
];

export function parseRings(
  stages: Array<TechnologyStage>,
): Array<RingDefinition> {
  return stages.map((s, i) => ({
    stage: s.name,
    label: s.name,
    color: colors[i],
    radius: 0,
  }));
}
