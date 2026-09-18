/**
 * One fact in two languages. The failure these exist to catch is a `localize`
 * that quietly falls back: validation has already made a missing locale
 * impossible, so a fallback would only hide the day that stops being true.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from './locales.js';
import {
  isLocalizedText,
  localize,
  type LocalizedText,
} from './localized-text.js';

const ROLE: LocalizedText = { en: 'Tech Lead', es: 'Líder técnico' };

describe('localize', () => {
  it('answers in the locale it was asked for', () => {
    expect(localize(ROLE, 'en')).toBe('Tech Lead');
    expect(localize(ROLE, 'es')).toBe('Líder técnico');
  });

  it('has an answer for every site locale', () => {
    for (const locale of SITE_LOCALES) {
      expect(localize(ROLE, locale), locale).toBeTypeOf('string');
    }
  });
});

describe('the localized-text shape', () => {
  it('accepts a string under every site locale', () => {
    expect(isLocalizedText(ROLE)).toBe(true);
  });

  it('rejects a value that is not an object of strings', () => {
    expect(isLocalizedText({ en: 'only English' })).toBe(false);
    expect(isLocalizedText({ en: 'x', es: 42 })).toBe(false);
    expect(isLocalizedText('a plain string')).toBe(false);
    expect(isLocalizedText(['en', 'es'])).toBe(false);
    expect(isLocalizedText(null)).toBe(false);
    expect(isLocalizedText(undefined)).toBe(false);
  });
});
