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
      'next-js',
      'effect',
      'nx',
      'playwright',
      'amazon-s3',
    ]);
    expect(sheet?.employments.map(each => each.period.id)).toEqual([
      'employer-one-engineer',
      'employer-two-engineer',
    ]);
    expect(sheet?.employments.map(each => each.employer.id)).toEqual([
      'employer-one',
      'employer-two',
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
    const highlightsOf = async (variant: string) =>
      (await loadCvSheet(SITE_REPOSITORIES, variant))?.employments.map(each =>
        ids(each.highlights),
      );
    expect(await highlightsOf('backend')).toEqual([
      ['employer-one-engineer-2', 'employer-one-engineer-3'],
      ['employer-two-engineer-1'],
    ]);
    expect(await highlightsOf('frontend')).toEqual([
      ['employer-one-engineer-1'],
      ['employer-two-engineer-2'],
    ]);
    // Full-stack takes every focus, so every highlight.
    expect(await highlightsOf('full-stack')).toEqual([
      [
        'employer-one-engineer-1',
        'employer-one-engineer-2',
        'employer-one-engineer-3',
      ],
      [
        'employer-two-engineer-1',
        'employer-two-engineer-2',
        'employer-two-engineer-3',
      ],
    ]);
  });

  it('is nothing for an id that names no variant', async () => {
    expect(await loadCvSheet(SITE_REPOSITORIES, 'astronaut')).toBe(undefined);
  });
});
