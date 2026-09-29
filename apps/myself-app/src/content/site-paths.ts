/**
 * Every page the export writes, locale-free and without its trailing slash:
 * the fixed ones, and those listed from the content. The sitemap lists them,
 * and a post may only link to one of them (ADR 0017).
 */
import { Technology } from '@myself-app/domain';
import { loadPostIds } from '@myself-app/domain/use-cases';
import { cvVariantParams } from '@myself-app/domain/use-cases';
import type { StaticContent as SiteContent } from '@myself-app/entifix-incubator-static-adapter';
import { SITE_PATHS } from '@myself-app/implementation-ui/routing';

import { BLOG_READS } from './blog-reads';

export async function loadSitePaths(content: SiteContent): Promise<string[]> {
  const [variants, technologies, posts] = await Promise.all([
    cvVariantParams(content),
    content.ids(Technology),
    loadPostIds(content, BLOG_READS),
  ]);
  return [
    ...SITE_PATHS,
    ...variants.map(({ variant }) => `/cv/${variant}`),
    ...technologies.map(id => `/tech-radar/${id}`),
    ...posts.map(id => `/blog/${id}`),
  ];
}
