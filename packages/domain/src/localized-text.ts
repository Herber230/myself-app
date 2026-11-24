import type { SiteLocale } from './locales.js';

/**
 * One fact, in every language the site ships (ADR 0005). Only the text varies:
 * a record is written once, and a date or a URL on it is not written twice.
 *
 * It is held by a member declared `type: 'localized'` (entifix#36), which
 * validation checks for every site locale before anything is served. That is
 * why this is every locale, where entifix's own `LocalizedText` is partial: by
 * the time a page reads one, none can be missing.
 */
export type LocalizedText = Record<SiteLocale, string>;

/**
 * The reader's language, with no fallback.
 *
 * Nothing falls back at render time on purpose: validation has already made a
 * missing locale impossible, so a fallback here would only hide the day that
 * stops being true. entifix's own `localize`, which falls back to the default
 * locale, is not used for the same reason.
 */
export function localize(text: LocalizedText, locale: SiteLocale): string {
  return text[locale];
}
