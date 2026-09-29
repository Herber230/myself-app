import type { EntityId } from '@entifix/core';

import type { Post } from '../../entities/post.entity.js';

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
