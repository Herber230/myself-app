import { SITE_LOCALES, type SiteLocale } from './locales.js';

/**
 * One fact, in every language the site ships (ADR 0005). Only the text varies:
 * a record is written once, and a date or a URL on it is not written twice.
 *
 * ⚠️ It rides on a member declared `type: 'string'`, which the metadata knows
 * as text. That works because entifix's mapping passes non-relation values
 * through untouched, and it is the workaround entifix#36 asks a consumer to
 * prove before a real type is designed. Two consequences, both enforced by
 * `LOCALIZED_MEMBERS` below: such a member is never `filterable` or `sortable`,
 * because a generic comparison would compare an object as text, and the
 * adapter has to check completeness itself, because core will not.
 */
export type LocalizedText = Record<SiteLocale, string>;

/**
 * The reader's language, with no fallback.
 *
 * Nothing falls back at render time on purpose: validation has already made a
 * missing locale impossible, so a fallback here would only hide the day that
 * stops being true. entifix's own `es` fallback is unreachable for the same
 * reason.
 */
export function localize(text: LocalizedText, locale: SiteLocale): string {
  return text[locale];
}

/**
 * Whether a value could be a `LocalizedText` at all — an object with a string
 * under every site locale. The adapter reports *which* locale is missing from
 * *which* record; this only answers the shape question.
 */
export function isLocalizedText(value: unknown): value is LocalizedText {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return SITE_LOCALES.every(locale => typeof candidate[locale] === 'string');
}
