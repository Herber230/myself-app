/**
 * What search engines are told about the export: every page in every locale
 * (`sitemap.xml`), and where that list is (`robots.txt`).
 *
 * Both are written once during `next build`, like every other file of the
 * export. The URLs are absolute, so they are right only once
 * `NEXT_PUBLIC_SITE_URL` names the deployed site.
 */
import type { MetadataRoute } from 'next';

import { localeAlternates, localePath, SITE_LOCALES } from './site-locales';

/** Every page under `app/[locale]/`, locale-free. */
export const SITE_PATHS = ['/', '/cv', '/tech-radar'] as const;

export function siteMapEntries(base: URL): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, base).href;
  return SITE_PATHS.flatMap(path =>
    SITE_LOCALES.map(locale => ({
      url: absolute(localePath(locale, path)),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(localeAlternates(locale, path).languages).map(
            ([language, href]) => [language, absolute(href)],
          ),
        ),
      },
    })),
  );
}

export function siteRobots(base: URL): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', base).href,
  };
}
