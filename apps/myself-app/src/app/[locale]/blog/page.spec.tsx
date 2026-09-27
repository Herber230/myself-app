import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../test/render';
import BlogPage, { generateMetadata } from './page';

type Props = Parameters<typeof BlogPage>[0];

const propsOf = (locale: string) => paramsOf({ locale }) as Props;

describe('the blog’s home', () => {
  it('lists every published post, newest first', async () => {
    await renderPage(BlogPage(propsOf('en')), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeTruthy();
    const titles = screen
      .getAllByRole('heading', { level: 2 })
      .map(heading => heading.textContent);
    expect(titles).toEqual([
      'One use case, two repositories: entifix in the browser',
      'A static site behind CloudFront, defined in Pulumi',
      'Coverage at one hundred, on the machine that wrote the code',
    ]);
    expect(
      screen.getByRole('link', { name: 'RSS feed' }).getAttribute('href'),
    ).toBe('/en/blog/rss.xml');
  });

  it('offers a filter by tag, technology and year, in the reader’s language', async () => {
    await renderPage(BlogPage(propsOf('es')), 'es');
    expect(await screen.findByRole('group', { name: 'Etiqueta' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pruebas' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Amazon CloudFront' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '2025' })).toBeTruthy();
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
