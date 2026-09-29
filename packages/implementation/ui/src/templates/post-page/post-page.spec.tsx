import { join } from 'node:path';

import type { LocalizedText, Post } from '@myself-app/domain';
import {
  loadPost,
  loadPostPreviews,
  loadPosts,
  previewsOf,
  relatedPosts,
} from '@myself-app/domain/use-cases';
import { screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { renderPostBody } from '../../organisms/post-body/post-body.js';
import { renderPage } from '../../test/render.js';
import { BLOG_PREVIEWS, SITE_CONTENT } from '../../test/shipped-content.js';
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
  { includeDrafts = false } = {},
) {
  const reads = { ...BLOG_PREVIEWS, includeDrafts };
  const post = (await loadPost(SITE_CONTENT, id, reads)) as Post;
  const [[preview], posts, previews] = await Promise.all([
    previewsOf(SITE_CONTENT, [post], reads),
    loadPosts(SITE_CONTENT, reads),
    loadPostPreviews(SITE_CONTENT, reads),
  ]);
  const [related, body] = await Promise.all([
    previewsOf(SITE_CONTENT, relatedPosts(post, posts), reads),
    renderPostBody({
      id,
      markdown: (post.body as LocalizedText)[locale],
      locale,
      sitePaths: ['/', '/tech-radar', '/blog'],
      publicDirectory: PUBLIC,
    }),
  ]);
  return (
    <PostPageView
      locale={locale}
      post={post}
      preview={preview!}
      previews={previews}
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
    expect(
      screen.getByRole('link', { name: '← Todas las entradas' }),
    ).toHaveProperty('pathname', '/es/blog/');
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
    // It shares a tag with the draft too, which is not exported.
    expect(
      within(related)
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual([
      'The first Entifix application',
      'A static site behind CloudFront, defined in Pulumi',
      'Handling exceptions with Rxjs and React hooks',
    ]);
  });

  it('folds its sidebar away, with the filter as links to the blog', async () => {
    await renderPage(pageOf('es', 'a-static-site-on-s3'), 'es');
    const sidebar = screen.getByRole('complementary', {
      name: 'Filtrar las entradas',
    });
    expect(sidebar.querySelector('details')?.open).toBe(false);
    expect(within(sidebar).getByText('Mostrar filtros')).toBeTruthy();
    expect(
      within(sidebar)
        .getByRole('link', { name: 'Pruebas' })
        .getAttribute('href'),
    ).toBe('/es/blog/?tag=testing');
    expect(
      within(sidebar).getByRole('link', { name: '2019' }).getAttribute('href'),
    ).toBe('/es/blog/?year=2019');
    expect(
      within(sidebar)
        .getByRole('link', { name: 'Feed RSS' })
        .getAttribute('href'),
    ).toBe('/es/blog/rss.xml');
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
    expect(screen.getByText('Draft').className).toBe('post-card-draft');
  });
});
