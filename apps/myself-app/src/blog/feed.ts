/**
 * The blog's RSS 2.0 feed for one locale (ADR 0017): every published post,
 * newest first, each linking to its page. Written once into the export.
 */
import type { LocalizedText } from '@myself-app/domain';

import { postPath } from '../components/blog/post-cards';
import { inLocale } from '../components/cv/cv-format';
import { loadPosts } from '../content/blog';
import type { SiteRepositories } from '../content/site-content';
import { siteT } from '../i18n/server';
import { localePath, type SiteLocale } from '../site-locales';

/** Text safe inside an XML element. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderFeed(
  repositories: SiteRepositories,
  locale: SiteLocale,
  base: URL,
): Promise<string> {
  const t = siteT(locale);
  const posts = await loadPosts(repositories, { includeDrafts: false });
  const absolute = (path: string) => new URL(path, base).href;
  const items = posts.map(post => {
    const link = absolute(postPath(locale, String(post.id)));
    return [
      '    <item>',
      `      <title>${escapeXml(inLocale(post.title as LocalizedText, locale))}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${(post.publishedAt as Date).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(inLocale(post.summary as LocalizedText, locale))}</description>`,
      '    </item>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(t('blogPage.feedTitle', { name: t('siteName') }))}</title>`,
    `    <link>${absolute(localePath(locale, '/blog'))}</link>`,
    `    <description>${escapeXml(t('blogLead'))}</description>`,
    `    <language>${locale}</language>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
