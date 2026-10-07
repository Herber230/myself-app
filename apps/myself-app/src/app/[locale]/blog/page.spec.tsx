import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../test/render';
import BlogPage, { generateMetadata } from './page';

type Props = Parameters<typeof BlogPage>[0];

const propsOf = (locale: string) => paramsOf({ locale }) as Props;

describe('the blog’s home', () => {
  it('lists every published post, newest first, under its year', async () => {
    await renderPage(BlogPage(propsOf('en')), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
    const main = within(screen.getByRole('main'));
    expect(
      main
        .getAllByRole('heading', { level: 2 })
        .map(heading => heading.textContent),
    ).toEqual(['2024', '2021', '2020', '2019']);
    const titles = main
      .getAllByRole('heading', { level: 3 })
      .map(heading => heading.textContent);
    expect(titles).toHaveLength(7);
    expect(titles.slice(0, 3)).toEqual([
      'And then I saw you dance…',
      'Books',
      'Handling exceptions with Rxjs and React hooks',
    ]);
    // The newest, featured.
    expect(
      document
        .querySelector('article[data-featured]')
        ?.getAttribute('data-post'),
    ).toBe('then-i-saw-you-dance');
    expect(titles.at(-1)).toBe('An analogy for life plans');
    expect(
      screen.getByRole('link', { name: 'RSS feed' }).getAttribute('href'),
    ).toBe('/en/blog/rss.xml');
  });

  it('offers a filter by tag, technology and year, in the reader’s language', async () => {
    await renderPage(BlogPage(propsOf('es')), 'es');
    expect(await screen.findByRole('group', { name: 'Etiqueta' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ficción' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'React' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '2021' })).toBeTruthy();
  });

  it('is described, canonical in both locales, and points at its feed', async () => {
    const metadata = await generateMetadata(propsOf('es'));
    expect(metadata.title).toBe('Blog — Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/es/blog/');
    expect(metadata.alternates?.types).toEqual({
      'application/rss+xml': '/es/blog/rss.xml',
    });
  });

  it('is not found for any other locale', async () => {
    await expect(BlogPage(propsOf('fr'))).rejects.toThrow();
    await expect(generateMetadata(propsOf('fr'))).rejects.toThrow();
  });
});
