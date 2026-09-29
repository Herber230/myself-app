import { loadPostPreviews } from '@myself-app/domain/use-cases';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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

import { siteT } from '../../i18n/server.js';
import type { PostCardData } from '../../molecules/post-card/post-card.js';
import { postCardOf } from '../../molecules/post-card/post-cards.js';
import { SourcesProvider } from '../../sources/sources.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { BLOG_PREVIEWS } from '../../test/shipped-content.js';
import { PostExplorer } from './post-explorer.js';

let posts: PostCardData[];

beforeAll(async () => {
  posts = (await loadPostPreviews(SITE_CONTENT, BLOG_PREVIEWS)).map(preview =>
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
  <SourcesProvider sources={browserSources}>
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
        showSidebar: 'Show filters',
        hideSidebar: 'Hide filters',
      }}
      title="Blog"
      lead="Notes on what I build."
      feed={{ href: '/en/blog/rss.xml', label: 'RSS feed' }}
    />
  </SourcesProvider>
);

const shownPosts = () =>
  [...document.querySelectorAll('article[data-post]')].map(post =>
    post.getAttribute('data-post'),
  );

describe('the blog’s posts and filter', () => {
  it('are every post in the static HTML, and the filter as links', () => {
    const html = renderToString(explorer());
    for (const post of posts) expect(html).toContain(post.title);
    expect(html).toContain('href="/en/blog/?tag=testing"');
    expect(html).toContain('href="/en/blog/?tech=cloudfront"');
    expect(html).toContain('href="/en/blog/?year=2025"');
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain('aria-pressed');
  });

  it('open their sidebar, under the blog’s title, with the feed at its foot', () => {
    render(explorer());
    const sidebar = screen.getByRole('complementary', {
      name: 'Filter the posts',
    });
    expect(sidebar.querySelector('details')?.open).toBe(true);
    expect(within(sidebar).getByText('Hide filters')).toBeTruthy();
    expect(
      within(sidebar)
        .getByRole('link', { name: 'RSS feed' })
        .getAttribute('href'),
    ).toBe('/en/blog/rss.xml');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
    expect(screen.getByText('Notes on what I build.')).toBeTruthy();
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
