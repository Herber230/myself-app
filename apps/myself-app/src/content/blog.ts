/**
 * The blog's reads (ADR 0017), through the `load` use case like every other
 * page read (ADR 0003, path A).
 *
 * A draft is read by `next dev` only: the export, the sitemap, the feed and
 * `/data/post.json` never see one.
 */
import type { EntityFilter, EntityId } from '@entifix/core';
import {
  type LocalizedText,
  Post,
  SITE_LOCALES,
  type SiteLocale,
  Tag,
} from '@myself-app/domain';
import {
  targetsOf,
  type UnpagedRequest,
} from '@myself-app/entifix-incubator-static-adapter';

import { excerptOf } from '../blog/markdown/excerpt';
import type { SiteContent } from './site-content';

/** Whether drafts are read: only while `next dev` serves the site. */
export const SHOW_DRAFTS = process.env.NODE_ENV === 'development';

export interface BlogReadOptions {
  readonly includeDrafts?: boolean;
}

/**
 * A post as its preview shows it: no body but its opening, links resolved to
 * names.
 */
export interface PostPreview {
  readonly id: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  /** ISO 8601, as the page formats it. */
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly draft: boolean;
  /** Minutes to read, per locale, from the body's words. */
  readonly readingMinutes: Readonly<Record<SiteLocale, number>>;
  /** The prose the body opens with, per locale, as plain text. */
  readonly excerpt: Readonly<Record<SiteLocale, string>>;
  readonly tags: readonly {
    readonly id: string;
    readonly label: LocalizedText;
  }[];
  readonly technologies: readonly {
    readonly id: string;
    readonly name: LocalizedText;
  }[];
}

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
  { includeDrafts = SHOW_DRAFTS }: BlogReadOptions,
  filtering: readonly EntityFilter<Post>[] = [],
): UnpagedRequest<Post> {
  return {
    filtering: includeDrafts ? [...filtering] : [PUBLISHED, ...filtering],
    sorting: [{ 0: { property: 'publishedAt', type: 'desc' } }],
  };
}

/** Every post a filter keeps, newest first. */
export function loadPosts(
  content: SiteContent,
  options: BlogReadOptions = {},
  filtering: readonly EntityFilter<Post>[] = [],
): Promise<Post[]> {
  return content.loadAll(Post, postsRequest(options, filtering));
}

/** Every post's id, newest first: its page's slug. */
export function loadPostIds(
  content: SiteContent,
  options: BlogReadOptions = {},
): Promise<string[]> {
  return content.ids(Post, postsRequest(options));
}

/** One post, or `undefined` when there is none by that id to show. */
export async function loadPost(
  content: SiteContent,
  id: string,
  options: BlogReadOptions = {},
): Promise<Post | undefined> {
  const posts = await loadPosts(content, options);
  return posts.find(post => post.id === id);
}

/** Every tag, as the filter lists them. */
export function loadTags(content: SiteContent): Promise<Tag[]> {
  return content.loadAll(Tag);
}

/** The previews of these posts, in the order given. */
export async function previewsOf(
  content: SiteContent,
  posts: readonly Post[],
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
    readingMinutes: Object.fromEntries(
      SITE_LOCALES.map(locale => [
        locale,
        readingMinutes((post.body as LocalizedText)[locale]),
      ]),
    ) as Record<SiteLocale, number>,
    excerpt: Object.fromEntries(
      SITE_LOCALES.map(locale => [
        locale,
        excerptOf((post.body as LocalizedText)[locale]),
      ]),
    ) as Record<SiteLocale, string>,
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
  content: SiteContent,
  options: BlogReadOptions = {},
): Promise<PostPreview[]> {
  return previewsOf(content, await loadPosts(content, options));
}

/** Two points per shared tag, one per shared technology. */
function relatedness(post: Post, other: Post): number {
  const shared = (mine: readonly EntityId[], theirs: readonly EntityId[]) =>
    mine.filter(id => theirs.includes(id)).length;
  return (
    2 * shared(post.tags.ids, other.tags.ids) +
    shared(post.technologies.ids, other.technologies.ids)
  );
}

const RELATED_POSTS = 3;

/**
 * The posts most related to one (ADR 0017): by shared tags and technologies,
 * newest first on a tie, never the post itself or one sharing nothing.
 */
export function relatedPosts(post: Post, posts: readonly Post[]): Post[] {
  return posts
    .filter(other => other.id !== post.id)
    .map(other => ({ other, score: relatedness(post, other) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.other.publishedAt as Date).getTime() -
          (a.other.publishedAt as Date).getTime(),
    )
    .slice(0, RELATED_POSTS)
    .map(({ other }) => other);
}

/** The posts about a technology, newest first. */
export function loadPostsForTechnology(
  content: SiteContent,
  technology: string,
  options: BlogReadOptions = {},
): Promise<Post[]> {
  // `in` over a collection matches any of its ids, as Mongo's does.
  return loadPosts(content, options, [
    { property: 'technologies', operator: 'in', values: [technology] },
  ]);
}
