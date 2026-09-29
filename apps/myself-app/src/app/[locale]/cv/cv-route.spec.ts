import { describe, expect, it } from 'vitest';

import { loadCvPage } from './cv-route';

describe('a CV route', () => {
  it('loads the default variant when the route names none', async () => {
    const page = await loadCvPage({ locale: 'en', mode: 'human' });
    expect(page.variantId).toBe(page.defaultVariant);
    expect(page.sheet.variant.id).toBe(page.defaultVariant);
    expect(page.variants.map(each => each.id)).toContain('backend');
  });

  it('loads the variant it names, in the mode it names', async () => {
    const page = await loadCvPage({
      locale: 'es',
      variant: 'backend',
      mode: 'ats',
    });
    expect(page).toMatchObject({ locale: 'es', mode: 'ats' });
    expect(page.sheet.variant.id).toBe('backend');
  });

  it('is not found for an unknown locale or variant', async () => {
    await expect(loadCvPage({ locale: 'fr', mode: 'human' })).rejects.toThrow();
    await expect(
      loadCvPage({ locale: 'en', variant: 'astronaut', mode: 'human' }),
    ).rejects.toThrow();
  });
});
