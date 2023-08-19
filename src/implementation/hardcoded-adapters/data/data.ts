import type { Technology } from '@domain-app/entities/technology';
import type { TechnologyArea } from '@domain-app/entities/technology-area';
import type { TechnologyStage } from '@domain-app/entities/technology-stage';

export const technologyStageHardcodedData: TechnologyStage[] = [
  {
    id: '1',
    order: 1,
    name: 'Standard',
    description: 'Some description for this technology stage.',
  },
  {
    id: '2',
    order: 2,
    name: 'Adopt',
    description: 'Some description for this technology stage.',
  },
  {
    id: '3',
    order: 3,
    name: 'Trial',
    description: 'Some description for this technology stage.',
  },
  {
    id: '4',
    order: 4,
    name: 'Research',
    description: 'Some description for this technology stage.',
  },
  {
    id: '5',
    order: 5,
    name: 'Proposal',
    description: 'Some description for this technology stage.',
  },
  {
    id: '6',
    order: 6,
    name: 'Hold',
    description:
      'The technology is held since it was used in the past but not considered for further implementations.',
  },
  {
    id: '7',
    order: 7,
    name: 'Dismiss',
    description:
      'The technology is dismissed since it was evaluated but not considered after the inital results.',
  },
];

export const technologyAreaHardcodedData: Array<TechnologyArea> = [
  {
    id: '1',
    name: 'Server Side Rendering',
    description:
      'Server Side Rendering (SSR) is the process of taking a client-side JavaScript Framework website and rendering it to static HTML and CSS on the server. Why is this important? We all want fast loading websites and SSR is a tool to help you get your website rendered faster.',
  },
  {
    id: '2',
    name: 'CSS',
    description:
      'Cascading Style Sheets (CSS) is a style sheet language used for describing the presentation of a document written in a markup language such as HTML. CSS is a cornerstone technology of the World Wide Web, alongside HTML and JavaScript.',
  },
  {
    id: '3',
    name: 'Web Rendering',
    description:
      'Web rendering is the process by which web browsers convert the HTML, CSS, and JavaScript into a visual representation of a website.',
  },
  {
    id: '4',
    name: 'Monorepo',
    description:
      'A monorepo is a single repository that stores all of your code and assets for all of your projects. It is a single source of truth for all of your code and assets, which can be used across many projects.',
  },
  // {
  //   id: '5',
  //   name: 'Programming Language',
  //   description:
  //     'A programming language is a formal language comprising a set of instructions that produce various kinds of output. Programming languages are used in computer programming to implement algorithms.',
  // },
];

export const technologyHardCodedData: Array<Technology> = [
  {
    id: '1',
    name: 'ReactJS',
    description: 'Some description for ReactJS',
    stage: technologyStageHardcodedData[0],
    areas: [technologyAreaHardcodedData[2]],
  },
  {
    id: '2',
    name: 'Angular',
    description: 'Some description for Angular',
    stage: technologyStageHardcodedData[0],
    areas: [technologyAreaHardcodedData[2]],
  },
  {
    id: '3',
    name: 'VueJS',
    description: 'Some description for VueJS',
    stage: technologyStageHardcodedData[3],
    areas: [technologyAreaHardcodedData[2]],
  },
  {
    id: '4',
    name: 'NextJS',
    description: 'Some description for NextJS',
    stage: technologyStageHardcodedData[1],
    areas: [technologyAreaHardcodedData[0], technologyAreaHardcodedData[2]],
  },
  {
    id: '5',
    name: 'NX',
    description: 'Some description for NX',
    stage: technologyStageHardcodedData[2],
    areas: [technologyAreaHardcodedData[3]],
  },
];
