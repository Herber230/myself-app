import {
  loadProjectPage,
  type ProjectPage,
} from '@myself-app/domain/use-cases';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import { buildSiteContent } from '@myself-app/implementation-adapters/server';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SourcesProvider } from '../../sources/sources.js';
import { renderPage } from '../../test/render.js';
import { SITE_CONTENT, SITE_RECORDS } from '../../test/shipped-content.js';
import { ProjectPageView } from './project-page.js';

async function pageOf(page: ProjectPage, locale: 'en' | 'es' = 'en') {
  await renderPage(
    Promise.resolve(
      <SourcesProvider sources={browserSources}>
        <ProjectPageView
          locale={locale}
          page={page}
          overview={<p>The overview.</p>}
        />
      </SourcesProvider>,
    ),
    locale,
  );
}

describe("a project's page", () => {
  it('says what it is, what it is built with, and links its source', async () => {
    const page = (await loadProjectPage(
      SITE_CONTENT,
      'myself-app',
    )) as ProjectPage;
    await pageOf(page);
    expect(
      screen.getByRole('heading', { level: 1, name: 'myself-app' }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: '← Back to the projects' })
        .getAttribute('href'),
    ).toBe('/en/#projects');
    const technologies = screen.getByRole('list', {
      name: 'Technologies in myself-app',
    });
    expect(
      within(technologies)
        .getByRole('link', { name: 'Pulumi' })
        .getAttribute('href'),
    ).toBe('/en/tech-radar/pulumi/');
    expect(
      screen
        .getByRole('link', { name: 'Read the source' })
        .getAttribute('href'),
    ).toBe('https://github.com/Herber230/myself-app');
    expect(screen.queryByRole('link', { name: 'Visit the site' })).toBeNull();
  });

  it('shows its overview, patterns, file tree and decisions', async () => {
    const page = (await loadProjectPage(
      SITE_CONTENT,
      'myself-app',
    )) as ProjectPage;
    await pageOf(page, 'es');
    expect(screen.getByText('The overview.')).toBeTruthy();
    for (const heading of [
      'Resumen',
      'Patrones',
      'Estructura de archivos',
      'Decisiones de arquitectura',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading }),
      ).toBeTruthy();
    }
    expect(
      screen.getByText('Los registros están escritos en inglés.'),
    ).toBeTruthy();
    expect(screen.getByText('packages/')).toBeTruthy();
    expect(document.querySelectorAll('[data-slot="split-row"]')).toHaveLength(
      page.decisions.length,
    );
    expect(document.getElementById('decisions')).not.toBeNull();
  });

  it('links a site where a project has one', async () => {
    const records = SITE_RECORDS['projects.json'] as Record<string, unknown>[];
    const content = buildSiteContent({
      ...SITE_RECORDS,
      'projects.json': records.map(record =>
        record.id === 'entifix'
          ? { ...record, url: 'https://entifix.example' }
          : record,
      ),
    });
    await pageOf((await loadProjectPage(content, 'entifix')) as ProjectPage);
    expect(
      screen.getByRole('link', { name: 'Visit the site' }).getAttribute('href'),
    ).toBe('https://entifix.example');
  });
});
