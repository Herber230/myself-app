/**
 * Content to blips. The failures this catches are a quadrant or ring drawn in
 * the wrong place because its order was read wrongly, and a movement arrow
 * that points the wrong way — neither of which any other check would notice.
 */
import {
  loadEditionDate,
  loadRadarPlacements,
} from '@myself-app/domain/use-cases';
import { layoutRadar } from '@myself-app/entifix-incubator-react-controls';
import type { StaticContent } from '@myself-app/entifix-incubator-static-adapter';
import { buildSiteContent } from '@myself-app/implementation-adapters/server';
import { describe, expect, it } from 'vitest';

import { SITE_RECORDS as CONTENT } from '../../test/shipped-content.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { radarEntriesOf } from './entries.js';

const at = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const loadRadarEntries = async (content: StaticContent) =>
  radarEntriesOf(await loadRadarPlacements(content));

describe('the edition compared against', () => {
  it('is the latest in content', async () => {
    expect(await loadEditionDate(SITE_CONTENT)).toEqual(at('2026-09-25'));
  });
});

describe('the radar entries read from content', () => {
  it('are one per technology, each placed and labelled in both languages', async () => {
    const entries = await loadRadarEntries(SITE_CONTENT);
    expect(entries).toHaveLength(CONTENT['technologies.json'].length);
    for (const entry of entries) {
      expect(entry.label.en, entry.id).toBeTruthy();
      expect(entry.label.es, entry.id).toBeTruthy();
      expect([0, 1, 2, 3]).toContain(entry.quadrant);
      expect([0, 1, 2, 3]).toContain(entry.ring);
    }
  });

  it('draw a technique by its translated name', async () => {
    const entries = await loadRadarEntries(SITE_CONTENT);
    const clean = entries.find(entry => entry.id === 'clean-architecture');
    expect(clean?.label).toEqual({
      en: 'Clean Architecture',
      es: 'Arquitectura limpia',
    });
  });

  it('use every movement the chart can draw', async () => {
    // Against an edition from 2016, with TypeScript given a trial first: it
    // moved in, AngularJS moved out to hold, Angular stayed where it was, and
    // everything that arrived later is new.
    const periods = (
      CONTENT['technology-use-periods.json'] as { technology: string }[]
    ).filter(period => !['typescript', 'angular'].includes(period.technology));
    const content = buildSiteContent({
      ...CONTENT,
      'radar-editions.json': [{ id: 'then', date: '2016-01-01' }],
      'technology-use-periods.json': [
        ...periods,
        {
          id: 'typescript-trial',
          technology: 'typescript',
          ring: 'trial',
          start: '2014-07-01',
          end: '2017-08-01',
        },
        {
          id: 'typescript-adopt',
          technology: 'typescript',
          ring: 'adopt',
          start: '2017-08-01',
        },
        {
          id: 'angular-adopt',
          technology: 'angular',
          ring: 'adopt',
          start: '2014-07-01',
        },
      ],
    });
    const movements = new Map(
      (await loadRadarEntries(content)).map(entry => [
        entry.id,
        entry.movement,
      ]),
    );
    expect(movements.get('typescript')).toBe('in');
    expect(movements.get('angularjs')).toBe('out');
    expect(movements.get('angular')).toBe('none');
    expect(movements.get('react')).toBe('new');
  });

  it('show no movement in the first edition', async () => {
    const entries = await loadRadarEntries(SITE_CONTENT);
    expect(new Set(entries.map(entry => entry.movement))).toEqual(
      new Set(['none']),
    );
  });

  it('lay out without an overlap or a stray', async () => {
    const layout = layoutRadar(await loadRadarEntries(SITE_CONTENT));
    expect(layout.blips).toHaveLength(CONTENT['technologies.json'].length);
  });

  it('refuse a quadrant whose order the chart cannot draw', async () => {
    const quadrants = structuredClone(CONTENT['quadrants.json']) as {
      order: number;
    }[];
    quadrants[0].order = 7;
    const content = buildSiteContent({
      ...CONTENT,
      'quadrants.json': quadrants,
    });
    await expect(loadRadarEntries(content)).rejects.toThrow(
      'quadrant techniques has order 7; the radar draws four, 0 to 3',
    );
  });

  it('refuse a ring nothing declares an order for', async () => {
    const rings = structuredClone(CONTENT['rings.json']) as {
      order: number;
    }[];
    rings[0].order = 1.5;
    const content = buildSiteContent({
      ...CONTENT,
      'rings.json': rings,
    });
    await expect(loadRadarEntries(content)).rejects.toThrow('has order 1.5');
  });
});
