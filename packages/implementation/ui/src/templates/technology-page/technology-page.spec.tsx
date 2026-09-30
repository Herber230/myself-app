import {
  loadPostsForTechnology,
  loadTechnologyDetail,
  type TechnologyDetail,
} from '@myself-app/domain/use-cases';
import { cleanup, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderPage } from '../../test/render.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { TechnologyPageView } from './technology-page.js';

/** What the app's route loads for a technology, rendered by the template. */
async function pageOf(locale: 'en' | 'es', id: string) {
  const detail = (await loadTechnologyDetail(
    SITE_CONTENT,
    id,
  )) as TechnologyDetail;
  const posts = await loadPostsForTechnology(SITE_CONTENT, id);
  return <TechnologyPageView locale={locale} detail={detail} posts={posts} />;
}

describe("a technology's page", () => {
  it('says where it sits, how it moved and where I used it', async () => {
    await renderPage(pageOf('en', 'typescript'), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'TypeScript' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '← Back to the radar' }),
    ).toHaveProperty('pathname', '/en/tech-radar/');
    expect(screen.getByText('Languages & frameworks')).toBeTruthy();

    const history = screen.getByRole('heading', { name: 'How it moved' })
      .nextElementSibling as HTMLElement;
    expect(within(history).getAllByRole('listitem').length).toBeGreaterThan(0);

    expect(
      screen.getByRole('link', { name: 'myself-app' }).getAttribute('href'),
    ).toBe('/en/projects/myself-app/');
    expect(
      screen.getByRole('link', { name: 'Website' }).getAttribute('href'),
    ).toBe('https://www.typescriptlang.org');
    expect(
      screen.getByRole('link', { name: 'Source' }).getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });

  it('lists the posts about it, and has no such list when there are none', async () => {
    await renderPage(pageOf('en', 'cloudfront'), 'en');
    expect(
      screen
        .getByRole('link', {
          name: 'A static site behind CloudFront, defined in Pulumi',
        })
        .getAttribute('href'),
    ).toBe('/en/blog/a-static-site-on-s3/');
    cleanup();
    await renderPage(pageOf('en', 'angularjs'), 'en');
    expect(
      screen.queryByRole('heading', { name: 'Posts about it' }),
    ).toBeNull();
  });

  it('links only what a technology has', async () => {
    await renderPage(pageOf('en', 'amazon-s3'), 'en');
    expect(screen.getByRole('link', { name: 'Website' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Source' })).toBeNull();
  });

  it('shows its areas and links, and says when no project uses it', async () => {
    await renderPage(pageOf('es', 'static-first-delivery'), 'es');
    expect(screen.getByText('Áreas')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Sitio web' })).toBeNull();
    expect(
      screen.getByText('Ningún proyecto de este sitio la usa todavía.'),
    ).toBeTruthy();
  });
});
