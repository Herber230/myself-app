import type { Locale } from '@entifix/core';

/**
 * The locales this site publishes, and the one list routes, catalogs and
 * content validation read (ADR 0005): every localized text exists in each.
 *
 * Declared here rather than taken from `@entifix/core`: entifix fixes its own
 * `LOCALES` to `['es', 'en']` with `es` as the default (entifix#35), and this
 * site defaults to English. `satisfies` keeps the list a subset of what entifix
 * can format and translate.
 *
 * ⚠️ It lives in the domain because `LocalizedText` and the rule that no
 * translation is missing are the content's, not the screen's. Which locale is
 * the default — where `/` goes, `x-default` — is routing, and lives with the
 * UI (#75). The adapter does not import these at all — it is locale-agnostic
 * and is handed the list.
 */
export const SITE_LOCALES = ['en', 'es'] as const satisfies readonly Locale[];

export type SiteLocale = (typeof SITE_LOCALES)[number];

export function isSiteLocale(value: unknown): value is SiteLocale {
  return (
    typeof value === 'string' &&
    (SITE_LOCALES as readonly string[]).includes(value)
  );
}
