import { Technology } from '@myself-app/domain';
import type { MetadataRoute } from 'next';

import { cvVariantParams } from '../content/cv';
import { loadEvery } from '../content/queries';
import { SITE_REPOSITORIES } from '../content/repositories';
import { SITE_PATHS, siteMapEntries } from '../site-map';
import { siteUrl } from '../site-url';

/** Written once into the export as `sitemap.xml`. */
export const dynamic = 'force-static';

/**
 * Every fixed page, the CV of each variant but the default (ADR 0012), and
 * each technology's page (ADR 0014).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [variants, technologies] = await Promise.all([
    cvVariantParams(SITE_REPOSITORIES),
    loadEvery(SITE_REPOSITORIES, Technology),
  ]);
  return siteMapEntries(siteUrl(), [
    ...SITE_PATHS,
    ...variants.map(({ variant }) => `/cv/${variant}`),
    ...technologies.map(each => `/tech-radar/${String(each.id)}`),
  ]);
}
