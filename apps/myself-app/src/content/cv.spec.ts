import { CONTENT } from '@myself-app/content';
import { SITE_LOCALES } from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import { cvVariantParams, loadCvSelection, loadCvVariants } from './cv';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories } from './site-content';

const ids = (records: readonly { id: unknown }[]) =>
  records.map(each => each.id);

describe('the CV variants', () => {
  it('are sorted by order, the first being the default', async () => {
    const [variant] = structuredClone(CONTENT['cv-variants.json']) as Record<
      string,
      unknown
    >[];
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
  });

  it('get a page each, in every locale', async () => {
    const variants = ['full-stack', 'backend', 'frontend', 'devops'];
    expect(await cvVariantParams(SITE_REPOSITORIES, SITE_LOCALES)).toEqual(
      SITE_LOCALES.flatMap(locale =>
        variants.map(variant => ({ locale, variant })),
      ),
    );
  });
});

describe('what a variant selects', () => {
  it('is its technologies and employments, in the order it lists them', async () => {
    const selection = await loadCvSelection(SITE_REPOSITORIES, 'full-stack');
    expect(selection?.variant.id).toBe('full-stack');
    expect(ids(selection?.technologies ?? [])).toEqual([
      'typescript',
      'next-js',
      'effect',
      'nx',
      'playwright',
      'amazon-s3',
    ]);
    expect(ids(selection?.employments ?? [])).toEqual([
      'employer-one-engineer',
      'employer-two-engineer',
    ]);
  });

  it('is nothing for an id that names no variant', async () => {
    expect(await loadCvSelection(SITE_REPOSITORIES, 'astronaut')).toBe(
      undefined,
    );
  });
});
