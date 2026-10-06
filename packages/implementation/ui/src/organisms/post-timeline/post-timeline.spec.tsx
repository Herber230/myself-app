import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PostCardData } from '../../molecules/post-card/post-card.js';
import { byYear, PostTimeline } from './post-timeline.js';

const post = (id: string, publishedAt: string): PostCardData => ({
  id,
  href: `/en/blog/${id}/`,
  title: id,
  summary: `About ${id}.`,
  publishedAt,
  date: publishedAt.slice(0, 10),
  readingTime: '1 min read',
  tags: [],
  technologies: [],
});

const POSTS = [
  post('newest', '2024-09-12T00:00:00.000Z'),
  post('older', '2024-04-24T00:00:00.000Z'),
  post('oldest', '2021-06-19T00:00:00.000Z'),
];

describe('the posts as a timeline', () => {
  it('groups them under the year each was published in, in their order', () => {
    expect(byYear(POSTS).map(([year, posts]) => [year, posts.length])).toEqual([
      ['2024', 2],
      ['2021', 1],
    ]);
    render(<PostTimeline posts={POSTS} />);
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map(year => year.textContent),
    ).toEqual(['2024', '2021']);
    expect(document.querySelector('[data-featured]')).toBeNull();
  });

  it('features the first post alone, when asked', () => {
    render(<PostTimeline posts={POSTS} featured="Latest" />);
    const featured = document.querySelectorAll('article[data-featured]');
    expect(featured).toHaveLength(1);
    expect(within(featured[0] as HTMLElement).getByText('Latest')).toBeTruthy();
    expect(featured[0]?.getAttribute('data-post')).toBe('newest');
  });
});
