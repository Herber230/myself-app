import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadProjectIds, loadProjectPage } from './load-project-page.uc.js';

describe('the project pages', () => {
  it('exist for the featured projects, in their order', async () => {
    expect(await loadProjectIds(fixtureContent())).toEqual([
      'library',
      'engine',
    ]);
  });

  it('carry the project, its technologies, patterns, paths and decisions', async () => {
    const page = await loadProjectPage(fixtureContent(), 'engine');
    expect(page?.project.overview).toEqual({
      en: 'The engine, in en.',
      es: 'The engine, in es.',
    });
    expect(page?.technologies.map(each => each.id)).toEqual([
      'typescript',
      'react',
    ]);
    expect(page?.patterns.map(each => each.id)).toEqual([
      'engine-entities',
      'engine-ports',
    ]);
    expect(page?.paths.map(each => each.path)).toEqual(['src/', 'docs/adr/']);
    expect(page?.decisions.map(each => each.id)).toEqual([
      'engine-0001',
      'engine-0002',
    ]);
  });

  it('keep each project to its own records', async () => {
    const page = await loadProjectPage(fixtureContent(), 'library');
    expect(page?.patterns.map(each => each.id)).toEqual(['library-books']);
    expect(page?.paths).toEqual([]);
    expect(page?.decisions.map(each => each.id)).toEqual(['library-0001']);
  });

  it('are nothing for a project not featured, or none at all', async () => {
    expect(await loadProjectPage(fixtureContent(), 'side-project')).toBe(
      undefined,
    );
    expect(await loadProjectPage(fixtureContent(), 'nothing')).toBe(undefined);
  });
});
