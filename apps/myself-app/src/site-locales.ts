import type { Locale } from '@entifix/core';

/**
 * The locales this site ships, and the one list routes, catalogs and content
 * validation read (ADR 0005).
 *
 * Declared here rather than taken from `@entifix/core`: entifix fixes its own
 * `LOCALES` to `['es', 'en']` with `es` as the default (entifix#35), and this
 * site defaults to English. `satisfies` keeps the list a subset of what entifix
 * can format and translate.
 */
export const SITE_LOCALES = ['en', 'es'] as const satisfies readonly Locale[];

export type SiteLocale = (typeof SITE_LOCALES)[number];

export const SITE_DEFAULT_LOCALE: SiteLocale = 'en';

export function isSiteLocale(value: unknown): value is SiteLocale {
  return (
    typeof value === 'string' &&
    (SITE_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * A site path under a locale, with the trailing slash the export writes
 * (`/en/cv/`). `path` is locale-free and starts with `/`.
 */
export function localePath(locale: SiteLocale, path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? `/${locale}/` : `/${locale}/${trimmed}/`;
}

/**
 * `alternates` metadata for one page: its canonical URL and an `hreflang`
 * entry per locale, with the default locale as `x-default`.
 */
export function localeAlternates(locale: SiteLocale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(
        SITE_LOCALES.map(each => [each, localePath(each, path)]),
      ),
      'x-default': localePath(SITE_DEFAULT_LOCALE, path),
    },
  };
}
