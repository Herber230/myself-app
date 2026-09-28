/**
 * Every page the export writes, locale-free and without its trailing slash:
 * the fixed ones, and those listed from the content. The sitemap lists them,
 * and a post may only link to one of them (ADR 0017).
 */
import { Technology } from '@myself-app/domain';

import { SITE_PATHS } from '../site-map';
import { loadPosts } from './blog';
import { cvVariantParams } from './cv';
import type { SiteContent } from './site-content';

export async function loadSitePaths(content: SiteContent): Promise<string[]> {
  const [variants, technologies, posts] = await Promise.all([
    cvVariantParams(content),
    content.loadAll(Technology),
    loadPosts(content),
  ]);
  return [
    ...SITE_PATHS,
    ...variants.map(({ variant }) => `/cv/${variant}`),
    ...technologies.map(each => `/tech-radar/${String(each.id)}`),
    ...posts.map(each => `/blog/${String(each.id)}`),
  ];
}
