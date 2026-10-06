import {
  type CvSheet,
  loadCvSheet,
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
      within(screen.getByRole('main'))
        .getByRole('link', { name: 'myself-app' })
        .getAttribute('href'),
    ).toBe('/en/projects/myself-app/');
    expect(
      screen.getByRole('link', { name: 'Website' }).getAttribute('href'),
    ).toBe('https://www.typescriptlang.org');
    expect(
      screen.getByRole('link', { name: 'Source' }).getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });

  it('lists the posts about it, and has no such list when there are none', async () => {
    await renderPage(pageOf('en', 'react'), 'en');
    expect(
      screen
        .getByRole('link', {
          name: 'Handling exceptions with Rxjs and React hooks',
        })
        .getAttribute('href'),
    ).toBe('/en/blog/rxjs-exceptions-react-hooks/');
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

  it('names the jobs it was used at, newest first, before the projects', async () => {
    const detail = (await loadTechnologyDetail(
      SITE_CONTENT,
      'typescript',
    )) as TechnologyDetail;
    const cv = (await loadCvSheet(SITE_CONTENT, 'full-stack')) as CvSheet;
    // Two jobs, as the content's link would resolve them.
    const employments = cv.employments
      .slice(0, 2)
      .map(({ period, employer }) => ({ period, employer }));
    await renderPage(
      Promise.resolve(
        <TechnologyPageView
          locale="en"
          detail={{ ...detail, employments }}
          posts={[]}
        />,
      ),
      'en',
    );
    const used = screen.getByRole('heading', { name: 'Where I used it' })
      .nextElementSibling as HTMLElement;
    const items = within(used)
      .getAllByRole('listitem')
      .map(each => each.textContent);
    expect(items.slice(0, 3)).toEqual([
      'Frontend Software Engineer at VanaNov 2025 – Present',
      'Frontend Software Engineer at HealthCare.comNov 2020 – Nov 2025',
      'entifixA project on this site',
    ]);
  });

  it('shows its areas and links, and says when nothing has used it', async () => {
    const detail = (await loadTechnologyDetail(
      SITE_CONTENT,
      'static-first-delivery',
    )) as TechnologyDetail;
    await renderPage(
      Promise.resolve(
        <TechnologyPageView
          locale="es"
          detail={{ ...detail, employments: [], projects: [] }}
          posts={[]}
        />,
      ),
      'es',
    );
    expect(screen.getByText('Áreas')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Sitio web' })).toBeNull();
    expect(
      screen.getByText(
        'Ni un trabajo ni un proyecto de este sitio la ha usado todavía.',
      ),
    ).toBeTruthy();
  });
});
