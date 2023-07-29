import { TechnologyArea, TechnologyStage } from '@domain/entities';
import { TRBlip } from '@presentation-app/organisms/tech-radar';

export const areas = ['serverSideRendering', 'CSS', 'webRendering', 'monorepo'];

export const entries: Array<TRBlip> = [
  {
    id: 1,
    quadrant: 1,
    ring: 2,
    label: 'ReactJS',
    link: 'https://reactjs.org/',
    active: true,
    moved: 0,
  },
  {
    id: 2,
    quadrant: 1,
    ring: 2,
    label: 'NextJS',
    link: 'https://nextjs.org/',
    active: true,
    moved: 0,
  },
  {
    id: 3,
    quadrant: 2,
    ring: 2,
    label: 'GatsbyJS',
    link: 'https://www.gatsbyjs.com/',
    active: true,
    moved: 0,
  },
  {
    id: 4,
    quadrant: 3,
    ring: 2,
    label: 'Emotion',
    link: 'https://emotion.sh/',
    active: true,
    moved: 0,
  },
  {
    id: 5,
    quadrant: 1,
    ring: 4,
    label: 'Styled Components',
    link: 'https://styled-components.com/',
    active: true,
    moved: 0,
  },
  {
    id: 6,
    quadrant: 1,
    ring: 3,
    label: 'TailwindCSS',
    link: 'https://tailwindcss.com/',
    active: true,
    moved: 0,
  },
];

// =====================================================================================

export const allTechnologyAreas: Array<TechnologyArea> = [
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
  {
    id: '5',
    name: 'Programming Language',
    description:
      'A programming language is a formal language comprising a set of instructions that produce various kinds of output. Programming languages are used in computer programming to implement algorithms.',
  },
];

export const selectedTechnologyAreas = allTechnologyAreas.slice(0, 2);

export const allTechnologyStages: Array<TechnologyStage> = [
  {
    id: '1',
    order: 1,
    name: 'Adopt',
    description: 'Adopt (or use) the technology. It is ready for use.',
  },
  {
    id: '2',
    order: 2,
    name: 'Trial',
    description:
      'Trial the technology. It is worth spending time to understand its value.',
  },
  {
    id: '3',
    order: 3,
    name: 'Assess',
    description:
      'Assess the technology. It is worth spending time to understand its value.',
  },
  {
    id: '4',
    order: 4,
    name: 'Hold',
    description:
      'Hold (or stop using) the technology. It is not worth spending time to understand its value.',
  },
];

export const selectedTechnologyStages = allTechnologyStages.slice(0, 2);
