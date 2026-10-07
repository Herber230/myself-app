import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PostCard, type PostCardData } from './post-card.js';

const POST: PostCardData = {
  id: 'static-sites',
  href: '/en/blog/static-sites/',
  title: 'Static sites',
  summary: 'On S3.',
  publishedAt: '2026-06-12T00:00:00.000Z',
  date: '12 Jun 2026',
  readingTime: '3 min read',
  tags: [{ id: 'infrastructure', label: 'Infrastructure' }],
  technologies: [
    {
      id: 'amazon-s3',
      name: 'Amazon S3',
      href: '/en/tech-radar/amazon-s3/',
    },
    { id: 'plain', name: 'Plain' },
  ],
};

describe('a post’s card', () => {
  it('links its title, dates it, and lists its tags and technologies', () => {
    render(<PostCard post={POST} />);
    expect(
      screen
        .getByRole('heading', { level: 2, name: 'Static sites' })
        .querySelector('a')
        ?.getAttribute('href'),
    ).toBe('/en/blog/static-sites/');
    expect(screen.getByText('12 Jun 2026').getAttribute('datetime')).toBe(
      '2026-06-12T00:00:00.000Z',
    );
    expect(screen.getByText('3 min read')).toBeTruthy();
    expect(screen.getByText('On S3.')).toBeTruthy();
    expect(
      screen.getAllByRole('listitem').map(item => item.textContent),
    ).toEqual(['Infrastructure', 'Amazon S3', 'Plain']);
    // A technology with a page links to it; one without is its name.
    expect(
      screen.getByRole('link', { name: 'Amazon S3' }).getAttribute('href'),
    ).toBe('/en/tech-radar/amazon-s3/');
    expect(screen.queryByRole('link', { name: 'Plain' })).toBeNull();
    expect(document.querySelector('[data-featured]')).toBeNull();
    expect(document.querySelector('.post-card-draft')).toBeNull();
  });

  it('says it is a draft, and takes a lower heading under a post', () => {
    render(<PostCard post={{ ...POST, draft: 'Draft' }} heading="h3" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeTruthy();
    expect(screen.getByText('Draft').className).toBe('post-card-draft');
  });

  it('is featured with a label over it, when asked', () => {
    render(<PostCard post={POST} featured="Latest" />);
    expect(
      document.querySelector('article')?.hasAttribute('data-featured'),
    ).toBe(true);
    expect(screen.getByText('Latest').className).toBe('post-card-eyebrow');
  });
});
