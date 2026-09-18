import { LOCALES } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { isSiteLocale, SITE_DEFAULT_LOCALE, SITE_LOCALES } from './locales.js';

describe('the site locales', () => {
  it('are English and Spanish, English first and by default', () => {
    expect(SITE_LOCALES).toEqual(['en', 'es']);
    expect(SITE_DEFAULT_LOCALE).toBe('en');
  });

  it('are all locales entifix knows', () => {
    for (const locale of SITE_LOCALES) {
      expect(LOCALES).toContain(locale);
    }
  });

  it('do not take entifix default, which is the other one', () => {
    // entifix#35: its own list is r10c's, `es` first. The site's default is
    // English, which is why the list is declared here at all.
    expect(SITE_DEFAULT_LOCALE).not.toBe(LOCALES[0]);
  });

  it('recognises a site locale and nothing else', () => {
    expect(isSiteLocale('en')).toBe(true);
    expect(isSiteLocale('es')).toBe(true);
    expect(isSiteLocale('pt')).toBe(false);
    expect(isSiteLocale('')).toBe(false);
    expect(isSiteLocale(undefined)).toBe(false);
    expect(isSiteLocale(42)).toBe(false);
  });
});
