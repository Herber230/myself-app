import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';
import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  loadProjectArchitecture,
  loadProjectLayers,
} from './load-project-architecture.uc.js';
import { loadProjectPage } from './load-project-page.uc.js';
import { loadProjectPipeline } from './load-project-pipeline.uc.js';

/** The value, which the fixture guarantees: fails loudly otherwise. */
function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('missing from the fixture');
  return value;
}

const ids = (records: readonly { id?: unknown }[]) =>
  records.map(each => each.id);

describe("a project's hexagon (ADR 0022)", () => {
  it('carries its runtimes in order, its parts with their lines, and its scenarios with their steps in order', async () => {
    const architecture = await loadProjectArchitecture(
      fixtureContent(),
      'engine',
    );
    expect(ids(architecture?.runtimes ?? [])).toEqual([
      'engine-browser',
      'engine-server',
    ]);
    const sql = architecture?.nodes.find(node => node.id === 'engine-sql');
    expect(ids(targetsOf(must(sql).connects))).toEqual(['engine-repository']);
    // An optional link is read by its id, never resolved.
    expect(sql?.runtime.id).toBe('engine-server');
    const [load] = architecture?.scenarios ?? [];
    expect(load?.scenario.id).toBe('engine-load');
    expect(ids(load?.steps ?? [])).toEqual(['engine-load-1', 'engine-load-2']);
    expect(ids(targetsOf(must(must(load).steps[0]).nodes))).toEqual([
      'engine-entity',
      'engine-repository',
    ]);
    expect(load?.steps[1]?.from.id).toBe('engine-sql');
  });

  it('has no scenarios when none is written', async () => {
    const architecture = await loadProjectArchitecture(
      fixtureContent({
        'architecture-scenarios.json': [],
        'scenario-steps.json': [],
      }),
      'engine',
    );
    expect(architecture?.scenarios).toEqual([]);
    expect(architecture?.nodes).toHaveLength(3);
  });

  it('is nothing for a project with no parts', async () => {
    expect(
      await loadProjectArchitecture(fixtureContent(), 'library'),
    ).toBeUndefined();
  });
});

describe("a project's layers (ADR 0022)", () => {
  it('carries its bands top first, their packages with imports, and the imports refused', async () => {
    const layers = await loadProjectLayers(fixtureContent(), 'engine');
    expect(ids(layers?.layers ?? [])).toEqual(['engine-top', 'engine-bottom']);
    const app = layers?.packages.find(each => each.id === 'engine-app');
    expect(ids(targetsOf(must(app).imports))).toEqual(['engine-core']);
    expect(app?.folder.id).toBe('engine-src');
    expect(ids(layers?.refused ?? [])).toEqual(['engine-core-to-app']);
  });

  it('is nothing for a project with no bands', async () => {
    expect(
      await loadProjectLayers(fixtureContent(), 'library'),
    ).toBeUndefined();
  });
});

describe("a project's pipeline (ADR 0023)", () => {
  it('carries its stages left to right, its jobs in order with what each needs, and its scenarios', async () => {
    const pipeline = await loadProjectPipeline(fixtureContent(), 'engine');
    expect(ids(pipeline?.stages ?? [])).toEqual([
      'engine-check',
      'engine-ship',
    ]);
    expect(ids(pipeline?.jobs ?? [])).toEqual(['engine-test', 'engine-deploy']);
    const deploy = pipeline?.jobs[1];
    expect(ids(targetsOf(must(deploy).needs))).toEqual(['engine-test']);
    expect(ids(targetsOf(must(deploy).decisions))).toEqual(['engine-0002']);
    const [ships] = pipeline?.scenarios ?? [];
    expect(ids(targetsOf(must(must(ships).steps[0]).jobs))).toEqual([
      'engine-test',
    ]);
    expect(ids(targetsOf(must(must(ships).steps[0]).skips))).toEqual([
      'engine-deploy',
    ]);
  });

  it('has no scenarios when none is written', async () => {
    const pipeline = await loadProjectPipeline(
      fixtureContent({
        'pipeline-scenarios.json': [],
        'pipeline-steps.json': [],
      }),
      'engine',
    );
    expect(pipeline?.scenarios).toEqual([]);
  });

  it('is nothing for a project with no stages', async () => {
    expect(
      await loadProjectPipeline(fixtureContent(), 'library'),
    ).toBeUndefined();
  });
});

describe('the project page', () => {
  it('carries the hexagon, the layers and the pipeline when the project has them', async () => {
    const page = await loadProjectPage(fixtureContent(), 'engine');
    expect(page?.architecture?.nodes).toHaveLength(3);
    expect(page?.layers?.packages).toHaveLength(2);
    expect(page?.pipeline?.jobs).toHaveLength(2);
  });

  it('leaves them out when it has none', async () => {
    const page = await loadProjectPage(fixtureContent(), 'library');
    expect(page).not.toHaveProperty('architecture');
    expect(page).not.toHaveProperty('layers');
    expect(page).not.toHaveProperty('pipeline');
  });
});
