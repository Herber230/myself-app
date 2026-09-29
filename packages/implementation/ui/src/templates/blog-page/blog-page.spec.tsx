import { loadPostPreviews } from '@myself-app/domain/use-cases';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SourcesProvider } from '../../sources/sources.js';
import { renderPage } from '../../test/render.js';
import { BLOG_PREVIEWS, SITE_CONTENT } from '../../test/shipped-content.js';
import { BlogPageView } from './blog-page.js';

describe("the blog's home", () => {
  it('lists every post under its title, with the filter and the feed', async () => {
    const previews = await loadPostPreviews(SITE_CONTENT, BLOG_PREVIEWS);
    await renderPage(
      Promise.resolve(
        <SourcesProvider sources={browserSources}>
          <BlogPageView locale="es" previews={previews} />
        </SourcesProvider>,
      ),
      'es',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
    expect(document.querySelectorAll('.post-timeline-item')).toHaveLength(
      previews.length,
    );
    expect(
      screen.getByRole('link', { name: 'Feed RSS' }).getAttribute('href'),
    ).toBe('/es/blog/rss.xml');
  });
});
