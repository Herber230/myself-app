import type { MetadataRoute } from 'next';

import { siteMapEntries } from '../site-map';
import { siteUrl } from '../site-url';

/** Written once into the export as `sitemap.xml`. */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return siteMapEntries(siteUrl());
}
