import { join } from 'node:path';

import type { LocalizedText, Post } from '@myself-app/domain';
import {
  loadPost,
  loadPosts,
  previewsOf,
  relatedPosts,
} from '@myself-app/domain/use-cases';
import { screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { outlineOf } from '../../markdown/outline.js';
import { renderPostBody } from '../../organisms/post-body/post-body.js';
import { renderPage } from '../../test/render.js';
import { BLOG_READS, SITE_CONTENT } from '../../test/shipped-content.js';
import { PostPageView } from './post-page.js';

/** The app's `public/`, where the posts' images are. */
const PUBLIC = join(
  import.meta.dirname,
  '../../../../../../apps/myself-app/public',
);

/** What the app's route loads for a post, rendered by the template. */
async function pageOf(
  locale: 'en' | 'es',
  id: string,
  { includeDrafts = false, outlined = true } = {},
) {
  const reads = { ...BLOG_READS, includeDrafts };
  // The placeholders hold every kind of paragraph a post can, so they are the
  // template's fixtures, though they are drafts until written (#70); what is
  // related to one is read as the export reads it.
  const post = (await loadPost(SITE_CONTENT, id, {
    ...BLOG_READS,
    includeDrafts: true,
  })) as Post;
  const [[preview], posts] = await Promise.all([
    previewsOf(SITE_CONTENT, [post]),
    loadPosts(SITE_CONTENT, reads),
  ]);
  const markdown = (post.body as LocalizedText)[locale];
  const [related, body, outline] = await Promise.all([
    previewsOf(SITE_CONTENT, relatedPosts(post, posts)),
    renderPostBody({
      id,
      markdown,
      locale,
      sitePaths: ['/', '/tech-radar', '/blog'],
      publicDirectory: PUBLIC,
    }),
    outlined ? outlineOf(markdown, `posts/${id}.${locale}.md`) : [],
  ]);
  return (
    <PostPageView
      locale={locale}
      post={post}
      preview={preview!}
      outline={outline}
      related={related}
      body={body}
    />
  );
}

// The first body loads Shiki's grammars and themes: seconds, once.
beforeAll(async () => {
  await pageOf('en', 'coverage-at-one-hundred');
}, 60_000);

describe('a post’s page', () => {
  it('shows its title, dates, tags, body, technologies and related posts', async () => {
    await renderPage(pageOf('es', 'a-static-site-on-s3'), 'es');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Un sitio estático detrás de CloudFront, definido en Pulumi',
      }),
    ).toBeTruthy();
    // Over the article, and again at the sidebar's foot.
    expect(
      screen
        .getAllByRole('link', { name: '← Todas las entradas' })
        .map(link => (link as HTMLAnchorElement).pathname),
    ).toEqual(['/es/blog/', '/es/blog/']);
    expect(screen.getByText('Actualizada el 20 sept 2026')).toBeTruthy();
    expect(
      within(document.querySelector('.blog-article-header') as HTMLElement)
        .getByRole('link', { name: 'Infraestructura' })
        .getAttribute('href'),
    ).toBe('/es/blog/?tag=infrastructure');
    expect(document.querySelector('.post-body .post-lead')).toBeTruthy();
    expect(
      (
        document.querySelector('.post-body') as HTMLElement
      ).style.getPropertyValue('--post-note-label'),
    ).toBe('"Nota"');
    const radar = screen.getByRole('heading', { name: 'En el radar' })
      .nextElementSibling as HTMLElement;
    expect(
      within(radar)
        .getByRole('link', { name: 'Amazon CloudFront' })
        .getAttribute('href'),
    ).toBe('/es/tech-radar/cloudfront/');
  });

  it('lists the posts most related to it, never a draft', async () => {
    await renderPage(pageOf('en', 'entifix-in-the-browser'), 'en');
    const related = screen.getByRole('heading', { name: 'Related posts' })
      .nextElementSibling as HTMLElement;
    // It shares a tag with the drafts too, which are not exported.
    expect(
      within(related)
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual([
      'The first Entifix application',
      'Handling exceptions with Rxjs and React hooks',
    ]);
  });

  it('opens its table of contents beside it, folded on a phone before paint', async () => {
    await renderPage(pageOf('es', 'a-static-site-on-s3'), 'es');
    const sidebar = screen.getByRole('complementary', {
      name: 'En esta página',
    });
    expect(sidebar.querySelector('details')?.open).toBe(true);
    expect(within(sidebar).getByText('Ocultar el índice')).toBeTruthy();
    const outline = within(sidebar).getByRole('navigation', {
      name: 'En esta página',
    });
    const links = within(outline).getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    // Each a heading of the body.
    for (const link of links)
      expect(
        document.getElementById((link.getAttribute('href') as string).slice(1)),
      ).not.toBeNull();
    expect(
      within(sidebar)
        .getByRole('link', { name: 'Feed RSS' })
        .getAttribute('href'),
    ).toBe('/es/blog/rss.xml');
    const scripts = [...document.querySelectorAll('script')]
      .map(script => script.innerHTML)
      .join('\n');
    expect(scripts).toContain('.blog-sidebar-panel');
    expect(scripts).toContain('(width \\u003c 64rem)');
  });

  it('leaves the outline out with fewer than two sections', async () => {
    await renderPage(
      pageOf('en', 'coverage-at-one-hundred', { outlined: false }),
      'en',
    );
    expect(
      screen.queryByRole('navigation', { name: 'On this page' }),
    ).toBeNull();
  });

  it('shows no related posts or technologies where there are none', async () => {
    await renderPage(pageOf('en', 'coverage-at-one-hundred'), 'en');
    expect(screen.queryByRole('heading', { name: 'On the radar' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Related posts' })).toBeNull();
  });

  it('marks a draft as one', async () => {
    await renderPage(
      pageOf('en', 'effect-four', { includeDrafts: true }),
      'en',
    );
    const header = document.querySelector(
      '.blog-article-header',
    ) as HTMLElement;
    expect(within(header).getByText('Draft').className).toBe('post-card-draft');
  });
});
