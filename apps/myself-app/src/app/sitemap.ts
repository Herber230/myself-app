import type { MetadataRoute } from 'next';

import { cvVariantParams } from '../content/cv';
import { SITE_REPOSITORIES } from '../content/repositories';
import { SITE_PATHS, siteMapEntries } from '../site-map';
import { siteUrl } from '../site-url';

/** Written once into the export as `sitemap.xml`. */
export const dynamic = 'force-static';

/** Every fixed page, and the CV of each variant but the default (ADR 0012). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const variants = await cvVariantParams(SITE_REPOSITORIES);
  return siteMapEntries(siteUrl(), [
    ...SITE_PATHS,
    ...variants.map(({ variant }) => `/cv/${variant}`),
  ]);
}
