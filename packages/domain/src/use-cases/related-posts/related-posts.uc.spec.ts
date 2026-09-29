import { describe, expect, it } from 'vitest';

import { Post } from '../../entities/post.entity.js';
import { relatedPosts } from './related-posts.uc.js';

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

describe('related posts', () => {
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
    expect(relatedPosts(subject, posts).map(each => each.id)).toEqual([
      'two-tags',
      'one-tag-new',
      'one-tag-old',
    ]);
  });
});
