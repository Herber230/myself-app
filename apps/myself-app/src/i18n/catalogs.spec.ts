import { describe, expect, it } from 'vitest';

import { SITE_DEFAULT_LOCALE, SITE_LOCALES } from '../site-locales';
import { SITE_CATALOGS } from './catalogs/site';

/**
 * What the type-level parity check (`CatalogShape`) cannot see: an empty
 * string, and a catalog object whose keys only match on paper.
 */

/** Every leaf's dotted key and value. */
function leaves(catalog: object, prefix = ''): [string, unknown][] {
  return Object.entries(catalog).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? leaves(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value] as [string, unknown]],
  );
}

describe('the site catalogs', () => {
  const reference = leaves(SITE_CATALOGS[SITE_DEFAULT_LOCALE]);

  it('read a catalog with keys in it', () => {
    // Pinned: a `leaves` that stopped descending would compare nothing.
    expect(reference.length).toBeGreaterThanOrEqual(10);
  });

  it('exist for every site locale and no other', () => {
    expect(Object.keys(SITE_CATALOGS).sort()).toEqual([...SITE_LOCALES].sort());
  });

  it.each(SITE_LOCALES)('%s has exactly the default locale’s keys', locale => {
    const keys = leaves(SITE_CATALOGS[locale]).map(([key]) => key);
    expect(keys.sort()).toEqual(reference.map(([key]) => key).sort());
  });

  it.each(SITE_LOCALES)('%s has no empty or non-string entry', locale => {
    for (const [key, value] of leaves(SITE_CATALOGS[locale])) {
      expect(typeof value, `${locale} › ${key}`).toBe('string');
      expect((value as string).trim(), `${locale} › ${key}`).not.toBe('');
    }
  });
});
