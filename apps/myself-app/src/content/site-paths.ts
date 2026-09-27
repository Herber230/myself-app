/**
 * Every page the export writes, locale-free and without its trailing slash:
 * the fixed ones, and those listed from the content. The sitemap lists them,
 * and a post may only link to one of them (ADR 0017).
 */
import { Technology } from '@myself-app/domain';

import { SITE_PATHS } from '../site-map';
import { cvVariantParams } from './cv';
import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

export async function loadSitePaths(
  repositories: SiteRepositories,
): Promise<string[]> {
  const [variants, technologies] = await Promise.all([
    cvVariantParams(repositories),
    loadEvery(repositories, Technology),
  ]);
  return [
    ...SITE_PATHS,
    ...variants.map(({ variant }) => `/cv/${variant}`),
    ...technologies.map(each => `/tech-radar/${String(each.id)}`),
  ];
}
