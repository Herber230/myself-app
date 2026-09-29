import type { EntityFilter } from '@entifix/core';
import {
  type StaticContent,
  targetsOf,
  type UnpagedRequest,
} from '@myself-app/entifix-incubator-static-adapter';

import { Post } from '../../entities/post.entity.js';
import { Tag } from '../../entities/tag.entity.js';
import { SITE_LOCALES, type SiteLocale } from '../../locales.js';
import type { LocalizedText } from '../../localized-text.js';
import type {
  BlogReadOptions,
  PostPreview,
  PreviewOptions,
} from './load-posts.types.js';

/*
 * The blog's reads (ADR 0017), through the `load` use case like every other
 * page read (ADR 0003, path A). A draft is read only when asked: the export,
 * the sitemap, the feed and `/data/post.json` never see one.
 */

const WORDS_PER_MINUTE = 200;

/** Minutes to read a Markdown text: its words, at a steady pace, at least one. */
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(word => /\w/.test(word)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const PUBLISHED: EntityFilter<Post> = {
  property: 'draft',
  operator: 'eq',
  value: false,
};

/** The request for every post a filter keeps, newest first. */
function postsRequest(
  { includeDrafts = false }: BlogReadOptions,
  filtering: readonly EntityFilter<Post>[] = [],
): UnpagedRequest<Post> {
  return {
    filtering: includeDrafts ? [...filtering] : [PUBLISHED, ...filtering],
    sorting: [{ 0: { property: 'publishedAt', type: 'desc' } }],
  };
}

/** Every post a filter keeps, newest first. */
export function loadPosts(
  content: StaticContent,
  options: BlogReadOptions = {},
  filtering: readonly EntityFilter<Post>[] = [],
): Promise<Post[]> {
  return content.loadAll(Post, postsRequest(options, filtering));
}

/** Every post's id, newest first: its page's slug. */
export function loadPostIds(
  content: StaticContent,
  options: BlogReadOptions = {},
): Promise<string[]> {
  return content.ids(Post, postsRequest(options));
}

/** One post, or `undefined` when there is none by that id to show. */
export async function loadPost(
  content: StaticContent,
  id: string,
  options: BlogReadOptions = {},
): Promise<Post | undefined> {
  const posts = await loadPosts(content, options);
  return posts.find(post => post.id === id);
}

/** Every tag, as the filter lists them. */
export function loadTags(content: StaticContent): Promise<Tag[]> {
  return content.loadAll(Tag);
}

/** The posts about a technology, newest first. */
export function loadPostsForTechnology(
  content: StaticContent,
  technology: string,
  options: BlogReadOptions = {},
): Promise<Post[]> {
  // `in` over a collection matches any of its ids, as Mongo's does.
  return loadPosts(content, options, [
    { property: 'technologies', operator: 'in', values: [technology] },
  ]);
}

/** One value per site locale, from each locale's body. */
function perLocale<T>(
  body: LocalizedText,
  of: (markdown: string) => T,
): Record<SiteLocale, T> {
  return Object.fromEntries(
    SITE_LOCALES.map(locale => [locale, of(body[locale])]),
  ) as Record<SiteLocale, T>;
}

/** The previews of these posts, in the order given. */
export async function previewsOf(
  content: StaticContent,
  posts: readonly Post[],
  { excerptOf }: PreviewOptions,
): Promise<PostPreview[]> {
  const resolved = await content.resolve(posts, ['tags', 'technologies']);
  // Validation has made every localized text and date present.
  return resolved.map(post => ({
    id: String(post.id),
    title: post.title as LocalizedText,
    summary: post.summary as LocalizedText,
    publishedAt: (post.publishedAt as Date).toISOString(),
    ...(post.updatedAt && { updatedAt: post.updatedAt.toISOString() }),
    draft: post.draft,
    readingMinutes: perLocale(post.body as LocalizedText, readingMinutes),
    excerpt: perLocale(post.body as LocalizedText, excerptOf),
    tags: targetsOf(post.tags).map(tag => ({
      id: String(tag.id),
      label: tag.label as LocalizedText,
    })),
    technologies: targetsOf(post.technologies).map(technology => ({
      id: String(technology.id),
      name: technology.name as LocalizedText,
    })),
  }));
}

/** Every post's preview, newest first. */
export async function loadPostPreviews(
  content: StaticContent,
  options: BlogReadOptions & PreviewOptions,
): Promise<PostPreview[]> {
  return previewsOf(content, await loadPosts(content, options), options);
}
