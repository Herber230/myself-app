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

  it('shows how it is built, its overview, patterns, file tree and records', async () => {
    const page = (await loadProjectPage(
      SITE_CONTENT,
      'myself-app',
    )) as ProjectPage;
    await pageOf(page, 'es');
    expect(screen.getByText('The overview.')).toBeTruthy();
    for (const heading of [
      'Decisiones que evolucionan',
      'Resumen',
      'Patrones',
      'Estructura de archivos',
      'Todos los registros',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading }),
      ).toBeTruthy();
    }
    // The band comes first, before the overview.
    const band = document.getElementById('lifecycle') as HTMLElement;
    expect(
      band.compareDocumentPosition(
        document.getElementById('overview') as HTMLElement,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByText(
        /^Los registros están escritos en inglés\. Los registros/,
      ),
    ).toBeTruthy();
    expect(screen.getByText('packages/')).toBeTruthy();
    // A pattern links to the records that decided it, in the explorer.
    const patterns = document.getElementById('patterns') as HTMLElement;
    expect(
      within(patterns)
        .getByRole('link', { name: 'ADR 0016' })
        .getAttribute('href'),
    ).toBe('?adr=0016#decisions');
    // A path links into the repository.
    expect(
      document
        .querySelector('#structure a.file-tree-link')
        ?.getAttribute('href'),
    ).toBe('https://github.com/Herber230/myself-app/tree/main/apps/');
    expect(document.querySelectorAll('[data-slot="split-row"]')).toHaveLength(
      page.decisions.length,
    );
    expect(document.getElementById('decisions')).not.toBeNull();
    // Its four parts, each a link of the outline.
    const outline = screen.getByRole('navigation', { name: 'En esta página' });
    expect(
      within(outline)
        .getAllByRole('link')
        .map(link => link.getAttribute('href')),
    ).toEqual(['#overview', '#patterns', '#structure', '#decisions']);
  });

  it('offers no actions where a project links nothing', async () => {
    const records = SITE_RECORDS['projects.json'] as Record<string, unknown>[];
    const content = buildSiteContent({
      ...SITE_RECORDS,
      'projects.json': records.map(record => {
        if (record.id !== 'entifix') return record;
        const { url: _url, repositoryUrl: _source, ...rest } = record;
        return rest;
      }),
    });
    await pageOf((await loadProjectPage(content, 'entifix')) as ProjectPage);
    expect(document.querySelector('.page-header-actions')).toBeNull();
    // Without a repository, its paths are names, not links.
    expect(document.querySelector('.file-tree-link')).toBeNull();
    expect(document.querySelector('.file-tree-name')).not.toBeNull();
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

  it('has neither the lifecycle nor the explorer for a project with no records here', async () => {
    await pageOf((await loadProjectPage(SITE_CONTENT, 'r10c')) as ProjectPage);
    expect(
      screen.getByRole('heading', { level: 1, name: 'r10c' }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Patterns' })).toBeTruthy();
    expect(document.getElementById('lifecycle')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'All records' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'All records' })).toBeNull();
  });
});
