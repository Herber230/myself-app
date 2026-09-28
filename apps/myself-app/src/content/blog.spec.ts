import { Post } from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import {
  loadPost,
  loadPostPreviews,
  loadPosts,
  loadPostsForTechnology,
  loadTags,
  readingMinutes,
  relatedPosts,
  SHOW_DRAFTS,
} from './blog';
import { SITE_REPOSITORIES } from './repositories';

const ids = (posts: readonly { id: unknown }[]) =>
  posts.map(post => String(post.id));

describe('the blog’s posts', () => {
  it('are newest first, and leave drafts out unless asked', async () => {
    expect(SHOW_DRAFTS).toBe(false);
    expect(ids(await loadPosts(SITE_REPOSITORIES))).toEqual([
      'entifix-in-the-browser',
      'a-static-site-on-s3',
      'coverage-at-one-hundred',
    ]);
    expect(
      ids(await loadPosts(SITE_REPOSITORIES, { includeDrafts: true }))[0],
    ).toBe('effect-four');
  });

  it('are found by id, and a draft only when drafts are shown', async () => {
    expect((await loadPost(SITE_REPOSITORIES, 'a-static-site-on-s3'))?.id).toBe(
      'a-static-site-on-s3',
    );
    expect(await loadPost(SITE_REPOSITORIES, 'effect-four')).toBeUndefined();
    expect(
      (
        await loadPost(SITE_REPOSITORIES, 'effect-four', {
          includeDrafts: true,
        })
      )?.id,
    ).toBe('effect-four');
  });

  it('are listed for a technology they are about', async () => {
    expect(
      ids(await loadPostsForTechnology(SITE_REPOSITORIES, 'cloudfront')),
    ).toEqual(['a-static-site-on-s3']);
    expect(
      ids(await loadPostsForTechnology(SITE_REPOSITORIES, 'angularjs')),
    ).toEqual([]);
  });

  it('carry every tag the filter lists', async () => {
    expect(ids(await loadTags(SITE_REPOSITORIES))).toContain('testing');
  });
});

describe('a post’s preview', () => {
  it('names its tags and technologies, and dates it', async () => {
    const [preview] = await loadPostPreviews(SITE_REPOSITORIES);
    expect(preview?.id).toBe('entifix-in-the-browser');
    expect(preview?.publishedAt).toBe('2026-09-27T00:00:00.000Z');
    expect(preview?.updatedAt).toBeUndefined();
    expect(preview?.tags[0]).toEqual({
      id: 'entifix',
      label: { en: 'entifix', es: 'entifix' },
    });
    expect(preview?.technologies.map(each => each.id)).toContain('effect');
    expect(preview?.readingMinutes.en).toBeGreaterThanOrEqual(1);
  });

  it('carries the date it was last updated, when it was', async () => {
    const previews = await loadPostPreviews(SITE_REPOSITORIES);
    expect(
      previews.find(each => each.id === 'a-static-site-on-s3')?.updatedAt,
    ).toBe('2026-09-20T00:00:00.000Z');
  });
});

describe('reading time', () => {
  it('counts words at two hundred a minute, and at least one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('a few words, and ::: markup')).toBe(1);
    expect(readingMinutes('word '.repeat(401))).toBe(3);
  });
});

describe('related posts', () => {
  const post = (
    id: string,
    tags: string[],
    technologies: string[],
    publishedAt: string,
  ) => {
    const record = new Post();
    record.id = id;
    record.tags.setIds(tags);
    record.technologies.setIds(technologies);
    record.publishedAt = new Date(publishedAt);
    return record;
  };

  it('rank by shared tags, then technologies, then date, and drop the rest', () => {
    const subject = post('subject', ['a', 'b'], ['x'], '2026-01-01');
    const posts = [
      subject,
      post('one-tag-old', ['a'], [], '2024-01-01'),
      post('one-tag-new', ['b'], [], '2025-01-01'),
      post('technology', [], ['x'], '2026-02-01'),
      post('two-tags', ['a', 'b'], [], '2023-01-01'),
      post('nothing', ['c'], ['y'], '2026-03-01'),
    ];
    expect(ids(relatedPosts(subject, posts))).toEqual([
      'two-tags',
      'one-tag-new',
      'one-tag-old',
    ]);
  });
});
