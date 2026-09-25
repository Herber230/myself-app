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

/** Every page under `app/[locale]/` whose path is fixed, locale-free. */
export const SITE_PATHS = ['/', '/cv', '/tech-radar'] as const;

/** The CV page of each variant but the default: listed from the content. */
export const CV_VARIANT_ROUTE = '/cv/[variant]';

/** Each technology's page (ADR 0014): listed from the content. */
export const TECHNOLOGY_ROUTE = '/tech-radar/[technology]';

/**
 * The CV's ATS pages, left out: each is `noindex`, with its human page as
 * canonical (ADR 0012).
 */
export const UNLISTED_ROUTES = ['/cv/ats', '/cv/[variant]/ats'] as const;

/** The sitemap: `paths` in every locale, `SITE_PATHS` unless told otherwise. */
export function siteMapEntries(
  base: URL,
  paths: readonly string[] = SITE_PATHS,
): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, base).href;
  return paths.flatMap(path =>
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
