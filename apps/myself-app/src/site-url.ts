/**
 * The site's own origin, for every absolute URL the build writes: canonical
 * and hreflang links, the sitemap, robots.txt.
 *
 * Set by `NEXT_PUBLIC_SITE_URL` where the site is deployed (ADR 0007); until
 * then it is the local static server `serve-out` starts.
 */
export const LOCAL_SITE_URL = 'http://localhost:3100';

export function siteUrl(
  env: Readonly<Record<string, string | undefined>> = process.env,
): URL {
  return new URL(env['NEXT_PUBLIC_SITE_URL'] || LOCAL_SITE_URL);
}
