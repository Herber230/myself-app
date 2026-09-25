/**
 * `sitemap.xml` and `robots.txt` are static, and built from the site's URL.
 */
import { describe, expect, it } from 'vitest';

import { siteUrl } from '../site-url';
import * as robots from './robots';
import * as sitemap from './sitemap';

describe('the metadata routes', () => {
  it('list each CV variant but the default, and no ATS page', async () => {
    const urls = (await sitemap.default()).map(entry => entry.url);
    expect(urls.filter(url => url.includes('/cv/'))).toEqual(
      ['cv', 'cv/backend', 'cv/frontend', 'cv/devops'].flatMap(path =>
        ['en', 'es'].map(locale => `${siteUrl().origin}/${locale}/${path}/`),
      ),
    );
  });

  it('list every technology page, in both locales', async () => {
    const urls = (await sitemap.default()).map(entry => entry.url);
    for (const locale of ['en', 'es']) {
      expect(urls).toContain(
        `${siteUrl().origin}/${locale}/tech-radar/typescript/`,
      );
    }
  });

  it('are written once, at build', () => {
    expect(sitemap.dynamic).toBe('force-static');
    expect(robots.dynamic).toBe('force-static');
  });

  it('use the site URL', async () => {
    const origin = siteUrl().origin;
    const entries = await sitemap.default();
    expect(entries[0]?.url.startsWith(origin)).toBe(true);
    expect(robots.default().sitemap).toBe(`${origin}/sitemap.xml`);
  });
});
