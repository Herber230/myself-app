import { screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';
import PostPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof PostPage>[0];

const propsOf = (locale: string, slug: string) =>
  paramsOf({ locale, slug }) as Props;

// The first body loads Shiki's grammars and themes: seconds, once.
beforeAll(async () => {
  await PostPage(propsOf('en', 'books'));
}, 60_000);

describe('a post’s page', () => {
  it('is written for every published post, and no other', async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: 'then-i-saw-you-dance' },
      { slug: 'books' },
      { slug: 'rxjs-exceptions-react-hooks' },
      { slug: 'what-do-you-think' },
      { slug: 'the-first-entifix-application' },
      { slug: 'the-embodiment-of-irony' },
      { slug: 'an-analogy-for-life-plans' },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it('shows its title, tags, body, technologies and related posts', async () => {
    await renderPage(
      PostPage(propsOf('es', 'rxjs-exceptions-react-hooks')),
      'es',
    );
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Manejar excepciones con Rxjs y hooks de React',
      }),
    ).toBeTruthy();
    // Over the article, and again at the sidebar's foot.
    expect(
      screen
        .getAllByRole('link', { name: '← Todas las entradas' })
        .map(link => (link as HTMLAnchorElement).pathname),
    ).toEqual(['/es/blog/', '/es/blog/']);
    expect(
      within(document.querySelector('.blog-article-header') as HTMLElement)
        .getByRole('link', { name: 'Arquitectura' })
        .getAttribute('href'),
    ).toBe('/es/blog/?tag=architecture');
    expect(document.querySelector('.post-body')).toBeTruthy();
    const radar = screen.getByRole('heading', { name: 'En el radar' })
      .nextElementSibling as HTMLElement;
    expect(
      within(radar).getByRole('link', { name: 'React' }).getAttribute('href'),
    ).toBe('/es/tech-radar/react/');
  });

  it('lists the posts most related to it, never a draft', async () => {
    await renderPage(
      PostPage(propsOf('en', 'the-first-entifix-application')),
      'en',
    );
    const related = screen.getByRole('heading', { name: 'Related posts' })
      .nextElementSibling as HTMLElement;
    // It shares a tag with the drafts too, which are not exported.
    expect(
      within(related)
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual(['Handling exceptions with Rxjs and React hooks']);
  });

  it('opens its table of contents beside it, read from the body', async () => {
    await renderPage(
      PostPage(propsOf('es', 'rxjs-exceptions-react-hooks')),
      'es',
    );
    const sidebar = screen.getByRole('complementary', {
      name: 'En esta página',
    });
    expect(sidebar.querySelector('details')?.open).toBe(true);
    const outline = within(sidebar).getByRole('navigation', {
      name: 'En esta página',
    });
    const links = within(outline).getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links)
      expect(
        document.getElementById((link.getAttribute('href') as string).slice(1)),
      ).not.toBeNull();
    expect(
      within(sidebar)
        .getByRole('link', { name: 'Feed RSS' })
        .getAttribute('href'),
    ).toBe('/es/blog/rss.xml');
  });

  it('shows no related posts or technologies where there are none', async () => {
    await renderPage(PostPage(propsOf('en', 'then-i-saw-you-dance')), 'en');
    expect(screen.queryByRole('heading', { name: 'On the radar' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Related posts' })).toBeNull();
  });

  it('is described as an article, canonical in both locales', async () => {
    const metadata = await generateMetadata(propsOf('en', 'books'));
    expect(metadata.title).toBe('Books — Blog — Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/en/blog/books/');
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2024-04-24T00:00:00.000Z',
    });
    // Its modified time, on a post updated since: `page.draft.spec.tsx`.
    expect(metadata.openGraph).not.toHaveProperty('modifiedTime');
  });

  it('is not found for another locale, a draft or no post', async () => {
    await expect(PostPage(propsOf('fr', 'books'))).rejects.toThrow();
    await expect(PostPage(propsOf('en', 'effect-four'))).rejects.toThrow();
    await expect(
      PostPage(propsOf('en', 'a-static-site-on-s3')),
    ).rejects.toThrow();
    await expect(PostPage(propsOf('en', 'nowhere'))).rejects.toThrow();
  });
});
