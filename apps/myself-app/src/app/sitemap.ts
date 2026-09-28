import type { MetadataRoute } from 'next';

import { SITE_CONTENT } from '../content/repositories';
import { loadSitePaths } from '../content/site-paths';
import { siteMapEntries } from '../site-map';
import { siteUrl } from '../site-url';

/** Written once into the export as `sitemap.xml`. */
export const dynamic = 'force-static';

/**
 * Every fixed page, the CV of each variant but the default (ADR 0012), each
 * technology's page (ADR 0014) and each post (ADR 0017).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return siteMapEntries(siteUrl(), await loadSitePaths(SITE_CONTENT));
}
