import {
  type StaticContent,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { Interest } from '../../entities/interest.entity.js';
import { InterestMedia } from '../../entities/interest-media.entity.js';
import type { Post } from '../../entities/post.entity.js';

/** An interest, with its gallery and the posts that grew out of it. */
export interface InterestSection {
  readonly interest: Interest;
  /** In its order. */
  readonly media: readonly InterestMedia[];
  /** In the order the interest lists them. */
  readonly posts: readonly Post[];
}

const BY_ORDER = [{ 0: { property: 'order', type: 'asc' } }] as const;

/**
 * The "Beyond the code" page: every interest in its order, each with its
 * photos and videos in theirs, and its posts resolved, so no page reads a
 * link itself (ADR 0018).
 */
export async function loadBeyondCode(
  content: StaticContent,
): Promise<InterestSection[]> {
  const [interests, media] = await Promise.all([
    content.loadAll(
      Interest,
      { sorting: [...BY_ORDER] },
      { resolve: ['posts'] },
    ),
    content.loadAll(InterestMedia, { sorting: [...BY_ORDER] }),
  ]);
  return interests.map(interest => ({
    interest,
    media: media.filter(each => each.interest.id === interest.id),
    posts: targetsOf(interest.posts),
  }));
}

/** The landing page's teaser: the interests, and the media it features. */
export interface BeyondCodeTeaser {
  readonly interests: readonly Interest[];
  readonly media: readonly InterestMedia[];
}

export async function loadBeyondCodeTeaser(
  content: StaticContent,
): Promise<BeyondCodeTeaser> {
  const [interests, media] = await Promise.all([
    content.loadAll(Interest, { sorting: [...BY_ORDER] }),
    content.loadAll(InterestMedia, {
      filtering: [{ property: 'featured', operator: 'eq', value: true }],
      sorting: [...BY_ORDER],
    }),
  ]);
  return { interests, media };
}
