import { describe, expect, it } from 'vitest';

import { paramsOf } from '../../test/render';
import * as openGraph from './opengraph-image';
import * as twitter from './twitter-image';

describe.each([
  ['opengraph-image', openGraph],
  ['twitter-image', twitter],
])('%s', (_, route) => {
  it('is written once per locale, at build, as a PNG', () => {
    expect(route.dynamic).toBe('force-static');
    expect(route.contentType).toBe('image/png');
    expect(route.size).toEqual({ width: 1200, height: 630 });
    expect(route.alt).toBe('Herber Colop');
    expect(route.generateStaticParams()).toEqual([
      { locale: 'en' },
      { locale: 'es' },
    ]);
  });

  it('draws the image for a site locale', async () => {
    const response = await route.default(paramsOf({ locale: 'es' }));
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('is not found for any other segment', async () => {
    await expect(route.default(paramsOf({ locale: 'fr' }))).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404',
    );
  });
});
