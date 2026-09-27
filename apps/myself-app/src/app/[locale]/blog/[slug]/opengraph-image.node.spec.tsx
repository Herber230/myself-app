import { describe, expect, it } from 'vitest';

import { paramsOf } from '../../../../test/render';
import * as route from './opengraph-image';

describe('a post’s social image', () => {
  it('is written once per post and locale, at build, as a PNG', async () => {
    expect(route.dynamic).toBe('force-static');
    expect(route.contentType).toBe('image/png');
    expect(route.size).toEqual({ width: 1200, height: 630 });
    expect(route.alt).toBe('Herber Colop — Blog');
    const params = await route.generateStaticParams();
    expect(params).toContainEqual({
      locale: 'es',
      slug: 'a-static-site-on-s3',
    });
    expect(params).toHaveLength(6);
  });

  it('draws the post’s title', async () => {
    const response = await route.default(
      paramsOf({ locale: 'es', slug: 'a-static-site-on-s3' }),
    );
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('is not found for another locale, or no post', async () => {
    await expect(
      route.default(paramsOf({ locale: 'fr', slug: 'a-static-site-on-s3' })),
    ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    await expect(
      route.default(paramsOf({ locale: 'en', slug: 'nowhere' })),
    ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });
});
