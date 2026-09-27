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
  await PostPage(propsOf('en', 'coverage-at-one-hundred'));
}, 60_000);

describe('a post’s page', () => {
  it('is written for every published post, and no other', async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: 'entifix-in-the-browser' },
      { slug: 'a-static-site-on-s3' },
      { slug: 'coverage-at-one-hundred' },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it('shows its title, dates, tags, body, technologies and related posts', async () => {
    await renderPage(PostPage(propsOf('es', 'a-static-site-on-s3')), 'es');
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
      screen
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
    await renderPage(PostPage(propsOf('en', 'entifix-in-the-browser')), 'en');
    const related = screen.getByRole('heading', { name: 'Related posts' })
      .nextElementSibling as HTMLElement;
    // It shares a tag with the draft too, which is not exported.
    expect(
      within(related)
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual(['A static site behind CloudFront, defined in Pulumi']);
  });

  it('shows no related posts or technologies where there are none', async () => {
    await renderPage(PostPage(propsOf('en', 'coverage-at-one-hundred')), 'en');
    expect(screen.queryByRole('heading', { name: 'On the radar' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Related posts' })).toBeNull();
  });

  it('is described as an article, canonical in both locales', async () => {
    const metadata = await generateMetadata(
      propsOf('en', 'a-static-site-on-s3'),
    );
    expect(metadata.title).toBe(
      'A static site behind CloudFront, defined in Pulumi — Blog — Herber Colop',
    );
    expect(metadata.alternates?.canonical).toBe(
      '/en/blog/a-static-site-on-s3/',
    );
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-06-12T00:00:00.000Z',
      modifiedTime: '2026-09-20T00:00:00.000Z',
    });
    const first = await generateMetadata(
      propsOf('en', 'entifix-in-the-browser'),
    );
    expect(first.openGraph).not.toHaveProperty('modifiedTime');
  });

  it('is not found for another locale, a draft or no post', async () => {
    await expect(
      PostPage(propsOf('fr', 'a-static-site-on-s3')),
    ).rejects.toThrow();
    await expect(PostPage(propsOf('en', 'effect-four'))).rejects.toThrow();
    await expect(PostPage(propsOf('en', 'nowhere'))).rejects.toThrow();
  });
});
