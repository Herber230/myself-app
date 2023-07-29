import type { TechnologyStage } from '@domain/entities';
import type { TRRingDefinition } from '@presentation-app/organisms';

export function parseTechRadarRingsDefinition(
  techStages: TechnologyStage[],
): TRRingDefinition[] {
  return [
    { stage: 'standard', label: 'Std', color: '#fbb044', radius: 75 },
    { stage: 'adopt', label: 'Adopt', color: '#00bcd4', radius: 150 },
    { stage: 'trial', label: 'Trial', color: '#7e42fc', radius: 225 },
    { stage: 'review', label: 'Review', color: '#2d7007', radius: 300 },
    { stage: 'proposal', label: 'Proposal', color: '#798051', radius: 375 },
    { stage: 'hold', label: 'Hold', color: '#42af12', radius: 450 },
    { stage: 'dismiss', label: 'Dismiss', color: '#261d1f', radius: 525 },
  ];
}
