/**
 * What the app hands `defineCatalogs`. The failure this catches is a locale
 * added to `SITE_LOCALES` whose resources were never composed here, and a
 * default namespace that stops being entifix's — which renders a primitive's
 * raw key instead of its label.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from '../../site-locales';
import { DEFAULT_NS, NAMESPACES, SITE_RESOURCES } from './index';

describe('the composed resources', () => {
  it('carry both namespaces in every site locale', () => {
    for (const locale of SITE_LOCALES) {
      const resources = SITE_RESOURCES[locale];
      for (const namespace of NAMESPACES) {
        expect(resources, `${locale}.${namespace}`).toHaveProperty(namespace);
      }
    }
  });

  it('name controls as the default namespace', () => {
    // entifix's components call `useT()` with no namespace, so the default has
    // to be theirs; the site always names `site` through `siteT`.
    expect(DEFAULT_NS).toBe('controls');
    expect(NAMESPACES).toContain(DEFAULT_NS);
  });
});
