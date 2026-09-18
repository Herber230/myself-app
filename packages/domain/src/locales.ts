import type { Locale } from '@entifix/core';

/**
 * The locales this site ships, and the one list routes, catalogs and content
 * validation read (ADR 0005).
 *
 * Declared here rather than taken from `@entifix/core`: entifix fixes its own
 * `LOCALES` to `['es', 'en']` with `es` as the default (entifix#35), and this
 * site defaults to English. `satisfies` keeps the list a subset of what entifix
 * can format and translate.
 *
 * ⚠️ It lives in the domain package, not in the app, because content is what
 * needs it and no package may import another (ADR 0004): every layer below the
 * app declares `onlyDependOnLibsWithTags: []`. `apps/myself-app/src/
 * site-locales.ts` re-exports these and adds the routing helpers. The adapter
 * does not import them at all — it is locale-agnostic and is handed the list.
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
