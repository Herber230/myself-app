/**
 * The locales this site publishes, and the one list routes, catalogs and
 * content validation read (ADR 0005): every localized text exists in each.
 *
 * entifix knows no locale of its own: a host narrows its `Locale` through
 * `LocaleRegister` (below), and declares the list at run time with
 * `defineLocales` — which the UI does as it installs the catalogs, beside the
 * default it routes to.
 *
 * ⚠️ It lives in the domain because `LocalizedText` and the rule that no
 * translation is missing are the content's, not the screen's. Which locale is
 * the default — where `/` goes, `x-default` — is routing, and lives with the
 * UI (#75). The adapter does not import these at all — it is locale-agnostic
 * and is handed the list.
 */
export const SITE_LOCALES = ['en', 'es'] as const;

export type SiteLocale = (typeof SITE_LOCALES)[number];

export function isSiteLocale(value: unknown): value is SiteLocale {
  return (
    typeof value === 'string' &&
    (SITE_LOCALES as readonly string[]).includes(value)
  );
}

declare module '@entifix/core' {
  /** entifix's `Locale` is this site's: a text in any other is a type error. */
  interface LocaleRegister {
    locale: SiteLocale;
  }
}
