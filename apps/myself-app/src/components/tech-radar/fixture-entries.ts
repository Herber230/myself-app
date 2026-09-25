/**
 * A fixed radar for the layout's specs, which no page imports.
 *
 * The page reads its entries from content (`src/content/radar.ts`). The specs
 * do not, on purpose: they pin properties of the layout — every segment
 * covered, every movement drawn, the same export twice — and content that
 * changes with a CV edit would move what they pin. These twenty entries were
 * the placeholder the control was built against, and the content package was
 * seeded from them.
 */
import type { RadarEntry } from './types';

export const FIXTURE_RADAR_ENTRIES: readonly RadarEntry[] = [
  // Quadrant 0 — techniques.
  {
    id: 'trunk-based-development',
    label: {
      en: 'Trunk-based development',
      es: 'Desarrollo sobre la rama principal',
    },
    quadrant: 0,
    ring: 0,
    movement: 'none',
    areas: [],
  },
  {
    id: 'static-first-delivery',
    label: { en: 'Static-first delivery', es: 'Entrega estática primero' },
    quadrant: 0,
    ring: 0,
    movement: 'in',
    areas: [],
  },
  {
    id: 'contract-testing',
    label: { en: 'Contract testing', es: 'Pruebas de contrato' },
    quadrant: 0,
    ring: 1,
    movement: 'none',
    areas: [],
  },
  {
    id: 'property-based-testing',
    label: {
      en: 'Property-based testing',
      es: 'Pruebas basadas en propiedades',
    },
    quadrant: 0,
    ring: 2,
    movement: 'new',
    areas: [],
  },
  {
    id: 'hand-written-release-notes',
    label: {
      en: 'Hand-written release notes',
      es: 'Notas de versión escritas a mano',
    },
    quadrant: 0,
    ring: 3,
    movement: 'out',
    areas: [],
  },

  // Quadrant 1 — tools.
  {
    id: 'nx',
    label: { en: 'Nx', es: 'Nx' },
    quadrant: 1,
    ring: 0,
    movement: 'in',
    areas: [],
  },
  {
    id: 'pnpm',
    label: { en: 'pnpm', es: 'pnpm' },
    quadrant: 1,
    ring: 0,
    movement: 'none',
    areas: [],
  },
  {
    id: 'playwright',
    label: { en: 'Playwright', es: 'Playwright' },
    quadrant: 1,
    ring: 1,
    movement: 'none',
    areas: [],
  },
  {
    id: 'biome',
    label: { en: 'Biome', es: 'Biome' },
    quadrant: 1,
    ring: 2,
    movement: 'new',
    areas: [],
  },
  {
    id: 'jest',
    label: { en: 'Jest', es: 'Jest' },
    quadrant: 1,
    ring: 3,
    movement: 'out',
    areas: [],
  },

  // Quadrant 2 — platforms.
  {
    id: 'amazon-s3',
    label: { en: 'Amazon S3', es: 'Amazon S3' },
    quadrant: 2,
    ring: 0,
    movement: 'none',
    areas: [],
  },
  {
    id: 'cloudfront',
    label: { en: 'CloudFront', es: 'CloudFront' },
    quadrant: 2,
    ring: 1,
    movement: 'in',
    areas: [],
  },
  {
    id: 'cloudflare-workers',
    label: { en: 'Cloudflare Workers', es: 'Cloudflare Workers' },
    quadrant: 2,
    ring: 2,
    movement: 'new',
    areas: [],
  },
  {
    id: 'heroku',
    label: { en: 'Heroku', es: 'Heroku' },
    quadrant: 2,
    ring: 3,
    movement: 'out',
    areas: [],
  },

  // Quadrant 3 — languages and frameworks.
  {
    id: 'typescript',
    label: { en: 'TypeScript', es: 'TypeScript' },
    quadrant: 3,
    ring: 0,
    movement: 'none',
    areas: [],
  },
  {
    id: 'next-js',
    label: { en: 'Next.js', es: 'Next.js' },
    quadrant: 3,
    ring: 0,
    movement: 'in',
    areas: [],
  },
  {
    id: 'effect',
    label: { en: 'Effect', es: 'Effect' },
    quadrant: 3,
    ring: 1,
    movement: 'in',
    areas: [],
  },
  {
    id: 'tailwind-css',
    label: { en: 'Tailwind CSS', es: 'Tailwind CSS' },
    quadrant: 3,
    ring: 1,
    movement: 'none',
    areas: [],
  },
  {
    id: 'svelte',
    label: { en: 'Svelte', es: 'Svelte' },
    quadrant: 3,
    ring: 2,
    movement: 'new',
    areas: [],
  },
  {
    id: 'angularjs',
    label: { en: 'AngularJS', es: 'AngularJS' },
    quadrant: 3,
    ring: 3,
    movement: 'out',
    areas: [],
  },
];
