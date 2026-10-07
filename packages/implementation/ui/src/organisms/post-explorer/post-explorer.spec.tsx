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
import { setViewportWidth } from '../../test/match-media.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { BLOG_READS } from '../../test/shipped-content.js';
import { PostExplorer } from './post-explorer.js';

let posts: PostCardData[];

beforeAll(async () => {
  posts = (await loadPostPreviews(SITE_CONTENT, BLOG_READS)).map(preview =>
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

const TECHNOLOGIES = [
  { id: 'react', name: 'React' },
  { id: 'typescript', name: 'TypeScript' },
];

const explorer = (technologies = TECHNOLOGIES) => (
  <SourcesProvider sources={browserSources}>
    <PostExplorer
      posts={posts}
      locale="en"
      tags={[
        { id: 'essays', name: 'Essays' },
        { id: 'fiction', name: 'Fiction' },
        { id: 'architecture', name: 'Architecture' },
      ]}
      technologies={technologies}
      years={['2024', '2021', '2019']}
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
        placeholder: 'TypeScript…',
        active: '{{n}} active',
        remove: 'Remove {{name}}',
        hideSidebar: 'Hide filters',
        latest: 'Latest',
        moreTechnologies: 'Technology ({{n}})',
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
    expect(html).toContain('href="/en/blog/?tag=fiction"');
    expect(html).toContain('href="/en/blog/?tech=react"');
    expect(html).toContain('href="/en/blog/?year=2021"');
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain('aria-pressed');
  });

  it('open their sidebar, under the blog’s title, with the feed beside it', () => {
    render(explorer());
    const sidebar = screen.getByRole('complementary', {
      name: 'Filter the posts',
    });
    expect(sidebar.querySelector('details')?.open).toBe(true);
    expect(within(sidebar).getByText('Hide filters')).toBeTruthy();
    expect(
      within(sidebar).queryByRole('link', { name: 'RSS feed' }),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'RSS feed' }).getAttribute('href'),
    ).toBe('/en/blog/rss.xml');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
    expect(screen.getByText('Notes on what I build.')).toBeTruthy();
  });

  it('read the filter from the URL, and show what the use case keeps', async () => {
    window.history.replaceState(null, '', '/en/blog/?tag=fiction');
    render(explorer());
    await waitFor(() => expect(shownPosts()).toEqual(['then-i-saw-you-dance']));
    expect(screen.getByText(`Showing 1 of ${posts.length}`)).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'Fiction' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('write each control to the URL, and clear them all', async () => {
    render(explorer());
    fireEvent.click(screen.getByRole('button', { name: 'React' }));
    fireEvent.click(screen.getByRole('button', { name: '2021' }));
    expect(window.location.search).toBe('?tech=react&year=2021');
    await waitFor(() =>
      expect(shownPosts()).toEqual(['rxjs-exceptions-react-hooks']),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Essays' }));
    fireEvent.click(screen.getByRole('button', { name: 'Essays' }));
    expect(window.location.search).toBe('?tech=react&year=2021');

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
      window.history.pushState(null, '', '/en/blog/?year=2019');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() =>
      expect(shownPosts()).toEqual(['an-analogy-for-life-plans']),
    );
  });

  it('count and remove what is in force, the card closed on a phone', async () => {
    window.history.replaceState(null, '', '/en/blog/?tag=essays&q=books');
    const { container } = render(explorer());
    expect(await screen.findByText('2 active')).toBeTruthy();
    expect(
      container.querySelector<HTMLDetailsElement>(
        '[data-slot="filter-panel-details"]',
      )?.open,
    ).toBe(true);
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Search titles: “books”' }),
    );
    expect(window.location.search).toBe('?tag=essays');
    act(() => setViewportWidth(390));
    expect(
      container.querySelector<HTMLDetailsElement>(
        '[data-slot="filter-panel-details"]',
      )?.open,
    ).toBe(false);
  });

  it('feature the newest post, until a filter is in force', async () => {
    render(explorer());
    const featured = () =>
      [...document.querySelectorAll('article[data-featured]')].map(post =>
        post.getAttribute('data-post'),
      );
    expect(featured()).toEqual([posts[0]?.id]);
    expect(screen.getByText('Latest')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fiction' }));
    await waitFor(() => expect(featured()).toEqual([]));
  });

  it('fold a long list of technologies, and open it while one is chosen', () => {
    const many = Array.from({ length: 6 }, (_, index) => ({
      id: `tech-${index}`,
      name: `Tech ${index}`,
    }));
    const { unmount } = render(explorer(many));
    const fold = () =>
      document.querySelector<HTMLDetailsElement>('.blog-filter-more');
    expect(fold()?.open).toBe(false);
    expect(screen.getByText('Technology (6)')).toBeTruthy();
    unmount();

    window.history.replaceState(null, '', '/en/blog/?tech=tech-1');
    render(explorer(many));
    expect(fold()?.open).toBe(true);
  });

  it('show a short list of technologies open', () => {
    render(explorer());
    expect(
      document.querySelector<HTMLDetailsElement>('.blog-filter-more')?.open,
    ).toBe(true);
  });
});
