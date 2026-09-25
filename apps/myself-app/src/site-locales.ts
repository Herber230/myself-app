/**
 * The site's locales, and the paths built from them.
 *
 * ⚠️ The list itself lives in `@myself-app/domain` (ADR 0005, revised). Content
 * validation needs it, and no package may import another — every layer below
 * the app declares `onlyDependOnLibsWithTags: []` — so the app is the wrong
 * place to hold it. It is re-exported here so every page still reads one
 * module, and so a locale is added in exactly one file.
 */
export {
  isSiteLocale,
  SITE_DEFAULT_LOCALE,
  SITE_LOCALES,
  type SiteLocale,
} from '@myself-app/domain';

import {
  SITE_DEFAULT_LOCALE,
  SITE_LOCALES,
  type SiteLocale,
} from '@myself-app/domain';

import { localePath } from './locale-path';

/** Re-exported; it lives apart so client code can import it alone. */
export { localePath };

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
