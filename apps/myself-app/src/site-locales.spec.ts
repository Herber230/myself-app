import { LOCALES } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import {
  isSiteLocale,
  localeAlternates,
  localePath,
  SITE_DEFAULT_LOCALE,
  SITE_LOCALES,
} from './site-locales';

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

  it('recognises a site locale and nothing else', () => {
    expect(isSiteLocale('en')).toBe(true);
    expect(isSiteLocale('es')).toBe(true);
    expect(isSiteLocale('pt')).toBe(false);
    expect(isSiteLocale('')).toBe(false);
    expect(isSiteLocale(undefined)).toBe(false);
  });
});

describe('a locale path', () => {
  it('ends with the slash the export writes', () => {
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('es', '/cv')).toBe('/es/cv/');
    expect(localePath('en', '/tech-radar/')).toBe('/en/tech-radar/');
  });

  it('names every locale as an alternate, and English as the default', () => {
    expect(localeAlternates('es', '/cv')).toEqual({
      canonical: '/es/cv/',
      languages: { en: '/en/cv/', es: '/es/cv/', 'x-default': '/en/cv/' },
    });
  });
});
