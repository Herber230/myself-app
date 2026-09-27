import { describe, expect, it } from 'vitest';

import { paramsOf } from '../../../../test/render';
import * as route from './route';

type Context = Parameters<typeof route.GET>[1];

describe('the feed route', () => {
  it('is written once per locale, at build', () => {
    expect(route.dynamic).toBe('force-static');
    expect(route.dynamicParams).toBe(false);
    expect(route.generateStaticParams()).toEqual([
      { locale: 'en' },
      { locale: 'es' },
    ]);
  });

  it('answers the locale’s feed as RSS', async () => {
    const response = await route.GET(
      new Request('http://localhost/en/blog/rss.xml'),
      paramsOf({ locale: 'en' }) as Context,
    );
    expect(response.headers.get('content-type')).toBe(
      'application/rss+xml; charset=utf-8',
    );
    expect(await response.text()).toContain('<language>en</language>');
  });

  it('is not found for any other locale', async () => {
    await expect(
      route.GET(
        new Request('http://localhost/fr/blog/rss.xml'),
        paramsOf({ locale: 'fr' }) as Context,
      ),
    ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });
});
