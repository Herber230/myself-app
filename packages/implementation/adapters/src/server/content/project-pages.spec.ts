import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  loadArchitectureDecision,
  loadDecisionRoutes,
  loadProjectIds,
  loadProjectPage,
} from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../shipped-content.fixture.js';

/** This repository's root, from the adapters package where specs run. */
const REPO_ROOT = join(process.cwd(), '../../..');

describe('the project pages (#77)', () => {
  it('are one per featured project, entifix first', async () => {
    expect(await loadProjectIds(SITE_CONTENT)).toEqual([
      'entifix',
      'r10c',
      'myself-app',
    ]);
  });

  it.each(['entifix', 'r10c', 'myself-app'])(
    '%s has an overview, patterns, a file tree and decisions',
    async id => {
      const page = await loadProjectPage(SITE_CONTENT, id);
      expect(page?.project.overview?.en).toBeTruthy();
      expect(page?.patterns.length).toBeGreaterThanOrEqual(4);
      expect(page?.paths.length).toBeGreaterThanOrEqual(8);
      expect(page?.decisions.length).toBeGreaterThanOrEqual(4);
    },
  );

  it('lists only paths this repository has, so its tree cannot drift', async () => {
    const page = await loadProjectPage(SITE_CONTENT, 'myself-app');
    const missing = (page?.paths ?? [])
      .map(row => row.path)
      .filter(path => !existsSync(join(REPO_ROOT, path)));
    expect(missing).toEqual([]);
  });
});

describe('the decision records (#77)', () => {
  it('are every record of the three repositories', async () => {
    const routes = await loadDecisionRoutes(SITE_CONTENT);
    expect(routes).toContainEqual({ project: 'myself-app', number: '0001' });
    expect(routes).toContainEqual({ project: 'entifix', number: '0001' });
    expect(routes).toContainEqual({ project: 'r10c', number: '0059' });
  });

  it('carry what supersedes them, and what they supersede', async () => {
    const landing = await loadArchitectureDecision(SITE_CONTENT, {
      project: 'myself-app',
      number: '0008',
    });
    expect(landing?.decision.status).toBe('superseded-in-part');
    expect(landing?.supersededBy.map(each => each.id)).toEqual([
      'myself-app-0011',
    ]);
    expect(landing?.decision.body).toContain('/projects/myself-app/adr/0003/');
  });
});
