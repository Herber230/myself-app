import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { loadPostPreviews } from '../../content/blog';
import { SITE_CONTENT } from '../../content/repositories';
import { siteT } from '../../i18n/server';
import type { PostCardData } from './post-card';
import { postCardOf } from './post-cards';
import { PostExplorer } from './post-explorer';

let posts: PostCardData[];

beforeAll(async () => {
  posts = (await loadPostPreviews(SITE_CONTENT)).map(preview =>
    postCardOf(preview, 'en', siteT('en')),
  );
  // The file the export writes, served where the explorer asks for it.
  const file = JSON.stringify(await SITE_CONTENT.dataFile('post.json'));
  vi.stubGlobal('fetch', async (url: string) =>
    url === '/data/post.json'
      ? new Response(file)
      : new Response('', { status: 404 }),
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  window.history.replaceState(null, '', '/en/blog/');
});

const explorer = () => (
  <PostExplorer
    posts={posts}
    locale="en"
    tags={[
      { id: 'entifix', name: 'entifix' },
      { id: 'testing', name: 'Testing' },
      { id: 'infrastructure', name: 'Infrastructure' },
    ]}
    technologies={[{ id: 'cloudfront', name: 'CloudFront' }]}
    years={['2026', '2025']}
    copy={{
      filters: 'Filter the posts',
      tag: 'Tag',
      technology: 'Technology',
      year: 'Year',
      search: 'Search titles',
      clear: 'Show every post',
      showing: 'Showing {{shown}} of {{total}}',
      empty: 'No post matches this filter.',
    }}
  />
);

const shownPosts = () =>
  [...document.querySelectorAll('article[data-post]')].map(post =>
    post.getAttribute('data-post'),
  );

describe('the blog’s posts and filter', () => {
  it('are every post in the static HTML, with no controls', () => {
    const html = renderToString(explorer());
    expect(html).not.toContain('Filter the posts');
    for (const post of posts) expect(html).toContain(post.title);
  });

  it('read the filter from the URL, and show what the use case keeps', async () => {
    window.history.replaceState(null, '', '/en/blog/?tag=testing');
    render(explorer());
    await waitFor(() =>
      expect(shownPosts()).toEqual(['coverage-at-one-hundred']),
    );
    expect(screen.getByText(`Showing 1 of ${posts.length}`)).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'Testing' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('write each control to the URL, and clear them all', async () => {
    render(explorer());
    fireEvent.click(screen.getByRole('button', { name: 'CloudFront' }));
    fireEvent.click(screen.getByRole('button', { name: '2026' }));
    expect(window.location.search).toBe('?tech=cloudfront&year=2026');
    await waitFor(() => expect(shownPosts()).toEqual(['a-static-site-on-s3']));

    fireEvent.click(screen.getByRole('button', { name: 'Infrastructure' }));
    fireEvent.click(screen.getByRole('button', { name: 'Infrastructure' }));
    expect(window.location.search).toBe('?tech=cloudfront&year=2026');

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'nothing like it' },
    });
    await waitFor(() =>
      expect(screen.getByText('No post matches this filter.')).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show every post' }));
    expect(window.location.search).toBe('');
    expect(shownPosts()).toHaveLength(posts.length);
  });

  it('follow the URL back and forward', async () => {
    render(explorer());
    act(() => {
      window.history.pushState(null, '', '/en/blog/?year=2025');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() =>
      expect(shownPosts()).toEqual(['coverage-at-one-hundred']),
    );
  });
});
