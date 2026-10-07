import { loadProjectIds, loadProjectPage } from '@myself-app/domain/use-cases';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../shipped-content.fixture.js';

/**
 * What validation cannot see, because a rule reads one file (ADR 0022, 0023):
 * a scenario's step travels a line the hexagon draws, and lights only that
 * project's parts; an import refused is not also allowed; a pipeline's step
 * runs and skips only that pipeline's jobs.
 */
const pages = async () =>
  Promise.all(
    (await loadProjectIds(SITE_CONTENT)).map(async id => ({
      id,
      page: await loadProjectPage(SITE_CONTENT, id),
    })),
  );

describe('the architecture content, across its files', () => {
  it('travels only lines the hexagon draws, between parts of the same project', async () => {
    const wrong: string[] = [];
    for (const { id, page } of await pages()) {
      const architecture = page?.architecture;
      if (architecture === undefined) continue;
      const parts = new Set(architecture.nodes.map(node => String(node.id)));
      const lines = new Set(
        architecture.nodes.flatMap(node =>
          targetsOf(node.connects).flatMap(target => [
            `${String(node.id)}>${String(target.id)}`,
            `${String(target.id)}>${String(node.id)}`,
          ]),
        ),
      );
      for (const { steps } of architecture.scenarios) {
        for (const step of steps) {
          for (const node of targetsOf(step.nodes)) {
            if (!parts.has(String(node.id))) {
              wrong.push(`${String(step.id)} lights ${String(node.id)}`);
            }
          }
          if (step.from.id === undefined) continue;
          const line = `${String(step.from.id)}>${String(step.to.id)}`;
          if (!lines.has(line))
            wrong.push(`${String(step.id)} travels ${line}`);
        }
      }
      expect(architecture.nodes.length, id).toBeGreaterThan(0);
    }
    expect(wrong).toEqual([]);
  });

  it('never refuses an import it also allows', async () => {
    const both: string[] = [];
    for (const { page } of await pages()) {
      const layers = page?.layers;
      if (layers === undefined) continue;
      const allowed = new Set(
        layers.packages.flatMap(each =>
          targetsOf(each.imports).map(
            target => `${String(each.id)}>${String(target.id)}`,
          ),
        ),
      );
      for (const edge of layers.refused) {
        const key = `${String(edge.from.id)}>${String(edge.to.id)}`;
        if (allowed.has(key)) both.push(key);
      }
    }
    expect(both).toEqual([]);
  });

  it("runs and skips only its own pipeline's jobs", async () => {
    const wrong: string[] = [];
    for (const { page } of await pages()) {
      const pipeline = page?.pipeline;
      if (pipeline === undefined) continue;
      const jobs = new Set(pipeline.jobs.map(job => String(job.id)));
      for (const { steps } of pipeline.scenarios) {
        for (const step of steps) {
          for (const job of [
            ...targetsOf(step.jobs),
            ...targetsOf(step.skips),
          ]) {
            if (!jobs.has(String(job.id))) {
              wrong.push(`${String(step.id)} names ${String(job.id)}`);
            }
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });
});
