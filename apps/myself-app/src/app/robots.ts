import type { MetadataRoute } from 'next';

import { siteRobots } from '../site-map';
import { siteUrl } from '../site-url';

/** Written once into the export as `robots.txt`. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return siteRobots(siteUrl());
}
