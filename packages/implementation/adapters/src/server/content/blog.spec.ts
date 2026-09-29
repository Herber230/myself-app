import {
  loadPost,
  loadPostPreviews,
  loadPosts,
  loadPostsForTechnology,
  loadTags,
} from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../shipped-content.fixture.js';

/** The excerpt is the UI's to read; here the body stands in for it. */
const PREVIEWS = { excerptOf: (markdown: string) => markdown };

const ids = (posts: readonly { id: unknown }[]) =>
  posts.map(post => String(post.id));

describe('the blog’s posts', () => {
  it('are newest first, and leave drafts out unless asked', async () => {
    expect(ids(await loadPosts(SITE_CONTENT))).toEqual([
      'entifix-in-the-browser',
      'a-static-site-on-s3',
      'coverage-at-one-hundred',
      'then-i-saw-you-dance',
      'books',
      'rxjs-exceptions-react-hooks',
      'what-do-you-think',
      'the-first-entifix-application',
      'the-embodiment-of-irony',
      'an-analogy-for-life-plans',
    ]);
    expect(ids(await loadPosts(SITE_CONTENT, { includeDrafts: true }))[0]).toBe(
      'effect-four',
    );
  });

  it('are found by id, and a draft only when drafts are shown', async () => {
    expect((await loadPost(SITE_CONTENT, 'a-static-site-on-s3'))?.id).toBe(
      'a-static-site-on-s3',
    );
    expect(await loadPost(SITE_CONTENT, 'effect-four')).toBeUndefined();
    expect(
      (
        await loadPost(SITE_CONTENT, 'effect-four', {
          includeDrafts: true,
        })
      )?.id,
    ).toBe('effect-four');
  });

  it('are listed for a technology they are about', async () => {
    expect(
      ids(await loadPostsForTechnology(SITE_CONTENT, 'cloudfront')),
    ).toEqual(['a-static-site-on-s3']);
    expect(
      ids(await loadPostsForTechnology(SITE_CONTENT, 'angularjs')),
    ).toEqual([]);
  });

  it('carry every tag the filter lists', async () => {
    expect(ids(await loadTags(SITE_CONTENT))).toContain('testing');
  });
});

describe('a post’s preview', () => {
  it('names its tags and technologies, and dates it', async () => {
    const [preview] = await loadPostPreviews(SITE_CONTENT, PREVIEWS);
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
    const previews = await loadPostPreviews(SITE_CONTENT, PREVIEWS);
    expect(
      previews.find(each => each.id === 'a-static-site-on-s3')?.updatedAt,
    ).toBe('2026-09-20T00:00:00.000Z');
  });
});
