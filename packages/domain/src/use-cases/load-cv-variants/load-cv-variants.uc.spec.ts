import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  cvVariantParams,
  defaultCvVariantId,
  loadCvVariants,
} from './load-cv-variants.uc.js';

describe('the CV variants', () => {
  it('are sorted by order, the first being the default', async () => {
    const content = fixtureContent();
    const variants = await loadCvVariants(content);
    expect(variants.map(each => each.id)).toEqual(['full-stack', 'backend']);
    expect(await defaultCvVariantId(content)).toBe('full-stack');
  });

  it('get a page each, except the default, which has /cv/', async () => {
    expect(await cvVariantParams(fixtureContent())).toEqual([
      { variant: 'backend' },
    ]);
  });
});
