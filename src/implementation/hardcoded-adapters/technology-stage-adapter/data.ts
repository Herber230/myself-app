import type { TechnologyStage } from '@domain-app/entities/technology-stage';

export const technologyStageHardcodedData: TechnologyStage[] = [
  {
    id: '1',
    order: 1,
    name: 'Dismiss',
    description:
      'The technology is dismissed since it was evaluated but not considered after the inital results.',
  },
  {
    id: '2',
    order: 2,
    name: 'Hold',
    description:
      'The technology is held since it was used in the past but not considered for further implementations.',
  },
  {
    id: '3',
    order: 3,
    name: 'Proposal',
    description: 'Some description for this technology stage.',
  },
  {
    id: '4',
    order: 4,
    name: 'Review',
    description: 'Some description for this technology stage.',
  },
  {
    id: '5',
    order: 5,
    name: 'Trial',
    description: 'Some description for this technology stage.',
  },
  {
    id: '6',
    order: 6,
    name: 'Adopt',
    description: 'Some description for this technology stage.',
  },
  {
    id: '7',
    order: 7,
    name: 'Standard',
    description: 'Some description for this technology stage.',
  },
];
