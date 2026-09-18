/**
 * The translate function every server component calls. Two failures it exists
 * to catch: `getServerT` reading a request header a static export does not
 * have, and a key resolving to itself because the catalogs were never
 * installed into this bundle.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from '../site-locales';
import { siteT } from './server';

describe('the server translate function', () => {
  it('reads the site namespace in every locale', () => {
    for (const locale of SITE_LOCALES) {
      const translated = siteT(locale)('siteName');
      expect(typeof translated, locale).toBe('string');
      // i18next echoes the key when nothing resolves it, which is what a
      // catalog missing from this bundle looks like.
      expect(translated, locale).not.toBe('siteName');
      expect(translated.length, locale).toBeGreaterThan(0);
    }
  });

  it('translates the same key differently in the two locales', () => {
    // Pinned so a `siteT` that ignored its argument — and answered in the
    // default locale whatever it was asked — would fail here.
    expect(siteT('en')('techRadar')).not.toBe(siteT('es')('techRadar'));
  });
});
