/**
 * Content to blips. The failures this catches are a quadrant or ring drawn in
 * the wrong place because its order was read wrongly, and a movement arrow
 * that points the wrong way — neither of which any other check would notice.
 */
import { CONTENT } from '@myself-app/content';
import { describe, expect, it } from 'vitest';

import { layoutRadar } from '../components/tech-radar/layout';
import { loadPage } from './queries';
import { loadRadarEntries, movementOf, PREVIOUS_EDITION } from './radar';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories } from './site-content';

const at = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const EDITION = at('2026-01-01');

describe('a blip movement', () => {
  it('is none when it sat in the same ring at the last edition', () => {
    expect(movementOf([{ ring: 1, start: at('2023-01-01') }], EDITION)).toBe(
      'none',
    );
  });

  it('is new when it sat in no ring at the last edition', () => {
    expect(movementOf([{ ring: 2, start: at('2026-06-01') }], EDITION)).toBe(
      'new',
    );
  });

  it('is in when it moved towards the centre, and out when away', () => {
    const moved = (from: number, to: number) =>
      movementOf(
        [
          { ring: to, start: at('2026-03-01') },
          { ring: from, start: at('2023-01-01'), end: at('2026-03-01') },
        ],
        EDITION,
      );
    expect(moved(2, 1)).toBe('in');
    expect(moved(2, 3)).toBe('out');
    expect(moved(2, 2)).toBe('none');
  });

  it('is none for a technology with no period at all', () => {
    expect(movementOf([], EDITION)).toBe('none');
  });

  it('treats a period that ended exactly at the edition as over', () => {
    expect(
      movementOf([{ ring: 0, start: at('2023-01-01'), end: EDITION }], EDITION),
    ).toBe('new');
  });

  it('compares against the placeholder edition by default', () => {
    expect(PREVIOUS_EDITION.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(movementOf([{ ring: 0, start: at('2020-01-01') }])).toBe('none');
  });
});

describe('the radar entries read from content', () => {
  it('are one per technology, each placed and labelled in both languages', async () => {
    const entries = await loadRadarEntries(SITE_REPOSITORIES);
    expect(entries).toHaveLength(CONTENT['technologies.json'].length);
    for (const entry of entries) {
      expect(entry.label.en, entry.id).toBeTruthy();
      expect(entry.label.es, entry.id).toBeTruthy();
      expect([0, 1, 2, 3]).toContain(entry.quadrant);
      expect([0, 1, 2, 3]).toContain(entry.ring);
    }
  });

  it('draw a technique by its translated name', async () => {
    const entries = await loadRadarEntries(SITE_REPOSITORIES);
    const contract = entries.find(entry => entry.id === 'contract-testing');
    expect(contract?.label).toEqual({
      en: 'Contract testing',
      es: 'Pruebas de contrato',
    });
  });

  it('use every movement the chart can draw', async () => {
    const entries = await loadRadarEntries(SITE_REPOSITORIES);
    expect(new Set(entries.map(entry => entry.movement))).toEqual(
      new Set(['none', 'in', 'out', 'new']),
    );
  });

  it('lay out without an overlap or a stray', async () => {
    const layout = layoutRadar(await loadRadarEntries(SITE_REPOSITORIES));
    expect(layout.blips).toHaveLength(CONTENT['technologies.json'].length);
  });

  it('refuse a quadrant whose order the chart cannot draw', async () => {
    const quadrants = structuredClone(CONTENT['quadrants.json']) as {
      order: number;
    }[];
    quadrants[0].order = 7;
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'quadrants.json': quadrants,
    });
    await expect(loadRadarEntries(repositories)).rejects.toThrow(
      'quadrant techniques has order 7; the radar draws four, 0 to 3',
    );
  });

  it('refuse a ring nothing declares an order for', async () => {
    const rings = structuredClone(CONTENT['rings.json']) as {
      order: number;
    }[];
    rings[0].order = 1.5;
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'rings.json': rings,
    });
    await expect(loadRadarEntries(repositories)).rejects.toThrow(
      'has order 1.5',
    );
  });
});

describe('a query for an entity nothing serves', () => {
  it('fails with the entity name rather than returning nothing', async () => {
    class Unserved {
      id = 'x';
    }
    await expect(loadPage(new Map(), Unserved)).rejects.toThrow(
      'No repository is registered for Unserved',
    );
  });
});
