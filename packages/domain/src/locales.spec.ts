import type { Locale } from '@entifix/core';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { isSiteLocale, SITE_LOCALES } from './locales.js';

describe('the site locales', () => {
  it('are English and Spanish, English first', () => {
    expect(SITE_LOCALES).toEqual(['en', 'es']);
  });

  it("are entifix's Locale, through LocaleRegister", () => {
    expectTypeOf<Locale>().toEqualTypeOf<(typeof SITE_LOCALES)[number]>();
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
