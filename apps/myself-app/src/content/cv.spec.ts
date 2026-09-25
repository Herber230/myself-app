import { CONTENT } from '@myself-app/content';
import { describe, expect, it } from 'vitest';

import {
  cvVariantParams,
  defaultCvVariantId,
  loadCvSheet,
  loadCvVariants,
} from './cv';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories } from './site-content';

const ids = (records: readonly { id: unknown }[]) =>
  records.map(each => each.id);

const records = (file: string) =>
  structuredClone(CONTENT[file]) as Record<string, unknown>[];

describe('the CV variants', () => {
  it('are sorted by order, the first being the default', async () => {
    const [variant] = records('cv-variants.json');
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'cv-variants.json': [
        { ...variant, id: 'backend', order: 2 },
        { ...variant, order: 1 },
      ],
    });
    expect(ids(await loadCvVariants(repositories))).toEqual([
      'full-stack',
      'backend',
    ]);
    expect(await defaultCvVariantId(repositories)).toBe('full-stack');
  });

  it('are the four ADR 0012 names, full-stack first', async () => {
    expect(ids(await loadCvVariants(SITE_REPOSITORIES))).toEqual([
      'full-stack',
      'backend',
      'frontend',
      'devops',
    ]);
  });

  it('get a page each, except the default, which has /cv/', async () => {
    expect(await cvVariantParams(SITE_REPOSITORIES)).toEqual([
      { variant: 'backend' },
      { variant: 'frontend' },
      { variant: 'devops' },
    ]);
  });
});

describe("a variant's sheet", () => {
  it('lists its technologies and employments in the order it gives them', async () => {
    const sheet = await loadCvSheet(SITE_REPOSITORIES, 'full-stack');
    expect(sheet?.variant.id).toBe('full-stack');
    expect(ids(sheet?.technologies ?? [])).toEqual([
      'typescript',
      'node-js',
      'react',
      'next-js',
      'nx',
      'kubernetes',
      'clean-architecture',
      'playwright',
    ]);
    expect(sheet?.employments.map(each => each.period.id)).toEqual([
      'vana-frontend-engineer',
      'healthcare-frontend-engineer',
      'tigo-innovation-developer',
      'tigo-software-architect',
      'ministerio-publico-analyst',
      'sisnova-analyst',
    ]);
    expect(sheet?.employments.map(each => each.employer.id)).toEqual([
      'vana',
      'healthcare-com',
      'tigo-guatemala',
      'tigo-guatemala',
      'ministerio-publico',
      'sisnova',
    ]);
  });

  it('carries the profile, its channels, education and certificates', async () => {
    const sheet = await loadCvSheet(SITE_REPOSITORIES, 'backend');
    expect(sheet?.profile.firstName).toBe('Herber');
    expect(ids(sheet?.channels ?? [])).toEqual(['email', 'github', 'linkedin']);
    expect(ids(sheet?.education ?? [])).toEqual([
      'usac-masters',
      'umes-licenciatura',
    ]);
    expect(ids(sheet?.certificates ?? [])).toHaveLength(3);
  });

  it('shows the highlights sharing one of its focuses, by their order', async () => {
    // The site has no highlight yet, so these are written for the check.
    const highlight = (
      id: string,
      period: string,
      focuses: string[],
      order: number,
    ) => ({ id, period, text: { en: id, es: id }, focuses, order });
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'employment-highlights.json': [
        highlight('migration', 'tigo-innovation-developer', ['backend'], 1),
        highlight('cluster', 'tigo-innovation-developer', ['devops'], 0),
        highlight('design', 'tigo-software-architect', ['backend'], 0),
        highlight(
          'experiments',
          'healthcare-frontend-engineer',
          ['frontend'],
          0,
        ),
      ],
    });
    const highlightsOf = async (variant: string) =>
      (await loadCvSheet(repositories, variant))?.employments.map(each =>
        ids(each.highlights),
      );
    expect(await highlightsOf('backend')).toEqual([
      ['migration'],
      ['design'],
      [],
      [],
    ]);
    expect(await highlightsOf('devops')).toEqual([['cluster'], []]);
    // Full-stack takes every focus, so every highlight.
    expect(await highlightsOf('full-stack')).toEqual([
      [],
      ['experiments'],
      ['cluster', 'migration'],
      ['design'],
      [],
      [],
    ]);
  });

  it('is nothing for an id that names no variant', async () => {
    expect(await loadCvSheet(SITE_REPOSITORIES, 'astronaut')).toBe(undefined);
  });
});
