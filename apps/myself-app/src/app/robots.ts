import { siteRobots } from '@myself-app/implementation-ui/routing';
import type { MetadataRoute } from 'next';

import { siteUrl } from '../site-url';

/** Written once into the export as `robots.txt`. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return siteRobots(siteUrl());
}
