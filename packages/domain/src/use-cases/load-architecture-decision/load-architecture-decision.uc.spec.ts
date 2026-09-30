import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  loadArchitectureDecision,
  loadDecisionRoutes,
} from './load-architecture-decision.uc.js';

describe('the decision records', () => {
  it('each have a route: the project, and the number in four digits', async () => {
    const routes = await loadDecisionRoutes(fixtureContent());
    expect(routes).toHaveLength(3);
    expect(routes).toContainEqual({ project: 'engine', number: '0002' });
    expect(routes).toContainEqual({ project: 'library', number: '0001' });
  });

  it('carry the body, the project and what they supersede', async () => {
    const page = await loadArchitectureDecision(fixtureContent(), {
      project: 'engine',
      number: '0002',
    });
    expect(page?.decision.title).toBe('Ports everywhere');
    expect(page?.decision.body).toBe('## Context\n\nA second one.');
    expect(page?.decision.summary).toBe(
      'Every edge is a port.\nAdapters sit outside.',
    );
    expect(page?.project.id).toBe('engine');
    expect(page?.supersedes.map(each => each.id)).toEqual(['engine-0001']);
    expect(page?.supersededBy).toEqual([]);
  });

  it('find what supersedes them from the other side of the link', async () => {
    const page = await loadArchitectureDecision(fixtureContent(), {
      project: 'engine',
      number: '0001',
    });
    expect(page?.decision.status).toBe('superseded-in-part');
    expect(page?.supersedes).toEqual([]);
    expect(page?.supersededBy.map(each => each.id)).toEqual(['engine-0002']);
  });

  it('order what they supersede by number', async () => {
    const content = fixtureContent({
      'adrs.json': [
        {
          id: 'engine-0001',
          number: 1,
          title: 'One',
          status: 'superseded',
          date: '2025-01-01',
          area: 'a',
          project: 'engine',
        },
        {
          id: 'engine-0002',
          number: 2,
          title: 'Two',
          status: 'superseded',
          date: '2025-01-02',
          area: 'a',
          project: 'engine',
        },
        {
          id: 'engine-0003',
          number: 3,
          title: 'Three',
          status: 'accepted',
          date: '2025-01-03',
          area: 'a',
          project: 'engine',
          supersedes: ['engine-0002', 'engine-0001'],
        },
      ],
    });
    const page = await loadArchitectureDecision(content, {
      project: 'engine',
      number: '0003',
    });
    expect(page?.supersedes.map(each => each.id)).toEqual([
      'engine-0001',
      'engine-0002',
    ]);
  });

  it('are nothing for a route that names no record', async () => {
    expect(
      await loadArchitectureDecision(fixtureContent(), {
        project: 'engine',
        number: '0009',
      }),
    ).toBe(undefined);
  });
});
