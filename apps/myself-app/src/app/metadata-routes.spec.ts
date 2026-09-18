/**
 * `sitemap.xml` and `robots.txt` are static, and built from the site's URL.
 */
import { describe, expect, it } from 'vitest';

import { siteUrl } from '../site-url';
import * as robots from './robots';
import * as sitemap from './sitemap';

describe('the metadata routes', () => {
  it('are written once, at build', () => {
    expect(sitemap.dynamic).toBe('force-static');
    expect(robots.dynamic).toBe('force-static');
  });

  it('use the site URL', () => {
    const origin = siteUrl().origin;
    expect(sitemap.default()[0]?.url.startsWith(origin)).toBe(true);
    expect(robots.default().sitemap).toBe(`${origin}/sitemap.xml`);
  });
});
