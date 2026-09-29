import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  loadPost,
  loadPostIds,
  loadPostPreviews,
  loadPosts,
  loadPostsForTechnology,
  loadTags,
  readingMinutes,
} from './load-posts.uc.js';

const ids = (records: readonly { id: unknown }[] = []) =>
  records.map(each => String(each.id));

/** An excerpt that shows which body it was taken from. */
const excerptOf = (markdown: string) => markdown.slice(0, 5);

describe('the posts', () => {
  it('are newest first, and leave drafts out unless asked', async () => {
    const content = fixtureContent();
    expect(ids(await loadPosts(content))).toEqual([
      'on-typescript',
      'on-testing',
    ]);
    expect(ids(await loadPosts(content, { includeDrafts: true }))).toEqual([
      'a-draft',
      'on-typescript',
      'on-testing',
    ]);
    expect(await loadPostIds(content)).toEqual(['on-typescript', 'on-testing']);
  });

  it('are found by id, and a draft only when drafts are shown', async () => {
    const content = fixtureContent();
    expect((await loadPost(content, 'on-testing'))?.id).toBe('on-testing');
    expect(await loadPost(content, 'a-draft')).toBeUndefined();
    expect(
      (await loadPost(content, 'a-draft', { includeDrafts: true }))?.id,
    ).toBe('a-draft');
  });

  it('are listed for a technology they are about', async () => {
    const content = fixtureContent();
    expect(ids(await loadPostsForTechnology(content, 'jest'))).toEqual([
      'on-testing',
    ]);
    expect(ids(await loadPostsForTechnology(content, 'react'))).toEqual([]);
  });

  it('come with every tag the filter lists', async () => {
    expect(ids(await loadTags(fixtureContent()))).toEqual([
      'architecture',
      'testing',
    ]);
  });
});

describe('a preview', () => {
  it('names its tags and technologies, dates it and opens its body', async () => {
    const [latest, older] = await loadPostPreviews(fixtureContent(), {
      excerptOf,
    });
    expect(latest).toMatchObject({
      id: 'on-typescript',
      publishedAt: '2026-03-01T00:00:00.000Z',
      draft: false,
      excerpt: { en: 'Types', es: 'Tipos' },
      readingMinutes: { en: 1, es: 1 },
      tags: [{ id: 'architecture', label: { en: 'architecture' } }],
      technologies: [{ id: 'typescript' }],
    });
    expect(latest?.updatedAt).toBeUndefined();
    expect(older?.updatedAt).toBe('2025-02-01T00:00:00.000Z');
    expect(older?.readingMinutes).toEqual({ en: 3, es: 1 });
  });
});

describe('reading time', () => {
  it('counts words at two hundred a minute, and at least one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('a few words, and ::: markup')).toBe(1);
    expect(readingMinutes('word '.repeat(401))).toBe(3);
  });
});
