import { targetsOf } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { makeContentReader } from './content-reader.js';
import { Post } from './entities/post.entity.js';
import { Tag } from './entities/tag.entity.js';
import { fixtureContent } from './use-cases/content.fixture.js';

describe('a content reader', () => {
  const content = fixtureContent();

  it('loads every record a request keeps, sorted as asked', async () => {
    const posts = await content.loadAll(Post, {
      filtering: [{ property: 'draft', operator: 'eq', value: false }],
      sorting: [{ 0: { property: 'publishedAt', type: 'desc' } }],
    });
    expect(posts.map(post => post.id)).toEqual(['on-typescript', 'on-testing']);
  });

  it('resolves the links asked for while loading, and later', async () => {
    const [loaded] = await content.loadAll(
      Post,
      { filtering: [{ property: 'id', operator: 'eq', value: 'on-testing' }] },
      { resolve: ['tags'] },
    );
    expect(targetsOf(loaded!.tags).map(tag => tag.id)).toEqual(['testing']);

    const [later] = await content.loadAll(Post, {
      filtering: [{ property: 'id', operator: 'eq', value: 'on-typescript' }],
    });
    await content.resolve([later!], ['tags']);
    expect(targetsOf(later!.tags).map(tag => tag.id)).toEqual(['architecture']);
  });

  it('lists the ids a request keeps, as text', async () => {
    expect(await content.ids(Tag)).toEqual(['architecture', 'testing']);
  });

  it('refuses an entity no repository serves', async () => {
    await expect(makeContentReader([]).loadAll(Tag)).rejects.toThrow(
      'No repository serves Tag',
    );
  });
});
