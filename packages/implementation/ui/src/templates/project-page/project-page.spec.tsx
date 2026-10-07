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

/** This repository's release policy, as the route reads it. */
const RELEASE = {
  version: '1.10.0',
  repositoryUrl: 'https://github.com/Herber230/myself-app',
  types: [
    { type: 'feat', level: 'minor' as const, section: 'Features' },
    { type: 'docs' },
  ],
};

async function pageOf(
  page: ProjectPage,
  locale: 'en' | 'es' = 'en',
  release?: typeof RELEASE,
) {
  await renderPage(
    Promise.resolve(
      <SourcesProvider sources={browserSources}>
        <ProjectPageView
          locale={locale}
          page={page}
          overview={<p>The overview.</p>}
          release={release}
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

  it('shows how it is built: overview, patterns, architecture, structure, delivery and the archive', async () => {
    const page = (await loadProjectPage(
      SITE_CONTENT,
      'myself-app',
    )) as ProjectPage;
    await pageOf(page, 'es', RELEASE);
    expect(screen.getByText('The overview.')).toBeTruthy();
    for (const heading of [
      'Decisiones que evolucionan',
      'Resumen',
      'Patrones',
      'Arquitectura',
      'Estructura',
      'Entrega',
      'Archivo de decisiones',
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
    // The archive says what it is, then how it is kept.
    expect(
      screen.getByText(
        /^Cada registro de decisión de arquitectura \(ADR\) de myself-app/,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /^Los registros están escritos en inglés\. Los registros/,
      ),
    ).toBeTruthy();
    // A pattern links to the records that decided it, in the explorer.
    const patterns = document.getElementById('patterns') as HTMLElement;
    expect(
      within(patterns)
        .getByRole('link', { name: 'ADR 0016' })
        .getAttribute('href'),
    ).toBe('?adr=0016#decisions');
    // The hexagon, the layers with their folders linked into the repository,
    // and the pipeline with the release decision under it.
    expect(
      screen.getByRole('group', { name: 'Puertos y adaptadores' }),
    ).toBeTruthy();
    expect(
      document
        .querySelector('#structure a.architecture-path')
        ?.getAttribute('href'),
    ).toBe(
      'https://github.com/Herber230/myself-app/tree/main/apps/myself-app/',
    );
    expect(document.querySelector('.file-tree')).toBeNull();
    expect(
      screen.getByRole('group', { name: 'Pipeline de entrega' }),
    ).toBeTruthy();
    expect(screen.getByText('¿Qué publicaría este commit?')).toBeTruthy();
    expect(document.querySelectorAll('[data-slot="split-row"]')).toHaveLength(
      page.decisions.length,
    );
    // Its parts, each a link of the outline.
    const outline = screen.getByRole('navigation', { name: 'En esta página' });
    expect(
      within(outline)
        .getAllByRole('link')
        .map(link => link.getAttribute('href')),
    ).toEqual([
      '#overview',
      '#patterns',
      '#architecture',
      '#structure',
      '#delivery',
      '#decisions',
    ]);
  });

  it('shows the pipeline without the release decision when given no policy', async () => {
    const page = (await loadProjectPage(
      SITE_CONTENT,
      'myself-app',
    )) as ProjectPage;
    await pageOf(page);
    expect(
      screen.getByRole('group', { name: 'Delivery pipeline' }),
    ).toBeTruthy();
    expect(screen.queryByText('What would this commit release?')).toBeNull();
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
    // Without a repository, its folders are names, not links.
    expect(document.querySelector('#structure a.architecture-path')).toBeNull();
    expect(
      document.querySelector('#structure code.architecture-path'),
    ).not.toBeNull();
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

  it('keeps the file tree, and has neither views nor records, for a project with none of them', async () => {
    const {
      architecture: _architecture,
      layers: _layers,
      pipeline: _pipeline,
      ...rest
    } = (await loadProjectPage(SITE_CONTENT, 'entifix')) as ProjectPage;
    await pageOf({ ...rest, decisions: [] });
    expect(screen.getByRole('heading', { name: 'Patterns' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Architecture' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Delivery' })).toBeNull();
    expect(document.getElementById('lifecycle')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Decision archive' }),
    ).toBeNull();
    expect(
      document
        .querySelector('#structure a.file-tree-link')
        ?.getAttribute('href'),
    ).toBe('https://github.com/r10c-technologies/entifix/tree/main/packages/');
    const outline = screen.getByRole('navigation', { name: 'On this page' });
    expect(
      within(outline)
        .getAllByRole('link')
        .map(link => link.getAttribute('href')),
    ).toEqual(['#overview', '#patterns', '#structure']);
  });

  it('keeps the file tree’s names unlinked without a repository', async () => {
    const {
      layers: _layers,
      project,
      ...rest
    } = (await loadProjectPage(SITE_CONTENT, 'entifix')) as ProjectPage;
    // An entity, so its repository is cleared rather than left out.
    project.repositoryUrl = undefined;
    await pageOf({ ...rest, project });
    expect(document.querySelector('.file-tree-link')).toBeNull();
    expect(document.querySelector('.file-tree-name')).not.toBeNull();
  });
});
