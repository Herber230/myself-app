/**
 * The browser's filter against the build's adapter. The filter runs over plain
 * props; the check is that it keeps exactly what `load` would, through the
 * static adapter, for the same request — every quadrant, ring and area, alone
 * and combined.
 */
import { Quadrant, Ring, Technology, TechnologyArea } from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import { loadEvery } from '../../content/queries';
import { loadRadarEntries } from '../../content/radar';
import { SITE_REPOSITORIES } from '../../content/repositories';
import {
  isFiltering,
  matches,
  NO_FILTER,
  parseFilter,
  type RadarFilter,
  type RadarVocabulary,
  serializeFilter,
  toggled,
} from './radar-filter';
import type { QuadrantIndex, RadarEntry, RingIndex } from './types';

const byOrder = {
  sorting: [{ 0: { property: 'order', type: 'asc' } }],
} as const;

async function vocabulary(): Promise<RadarVocabulary> {
  const [quadrants, rings, areas] = await Promise.all([
    loadEvery(SITE_REPOSITORIES, Quadrant, byOrder as never),
    loadEvery(SITE_REPOSITORIES, Ring, byOrder as never),
    loadEvery(SITE_REPOSITORIES, TechnologyArea),
  ]);
  return {
    quadrants: quadrants.map(each => String(each.id)),
    rings: rings.map(each => String(each.id)),
    areas: areas.map(each => String(each.id)),
  };
}

const entry = (overrides: Partial<RadarEntry>): RadarEntry => ({
  id: 'x',
  label: { en: 'Contract testing', es: 'Pruebas de contrato' },
  quadrant: 0,
  ring: 1,
  movement: 'none',
  areas: ['testing'],
  ...overrides,
});

describe('the radar filter', () => {
  it('keeps what load keeps, for every quadrant, ring and area', async () => {
    const [words, entries] = await Promise.all([
      vocabulary(),
      loadRadarEntries(SITE_REPOSITORIES),
    ]);
    const quadrants = [undefined, 0, 1, 2, 3] as const;
    const rings = [undefined, 0, 1, 2, 3] as const;
    const areas = [undefined, ...words.areas];
    let checked = 0;
    for (const quadrant of quadrants) {
      for (const ring of rings) {
        for (const area of areas) {
          const filter: RadarFilter = {
            quadrants: quadrant === undefined ? [] : [quadrant],
            rings: ring === undefined ? [] : [ring],
            areas: area === undefined ? [] : [area],
            query: '',
          };
          const filtering = [
            ...(quadrant === undefined
              ? []
              : [
                  {
                    property: 'quadrant',
                    operator: 'eq',
                    value: words.quadrants[quadrant],
                  },
                ]),
            ...(ring === undefined
              ? []
              : [
                  {
                    property: 'ring',
                    operator: 'eq',
                    value: words.rings[ring],
                  },
                ]),
            ...(area === undefined
              ? []
              : [{ property: 'areas', operator: 'in', values: [area] }]),
          ];
          const loaded = await loadEvery(SITE_REPOSITORIES, Technology, {
            filtering,
          } as never);
          expect(
            entries
              .filter(each => matches(each, filter, 'en'))
              .map(each => each.id)
              .sort(),
            JSON.stringify(filter),
          ).toEqual(loaded.map(each => String(each.id)).sort());
          checked++;
        }
      }
    }
    expect(checked).toBe(25 * (words.areas.length + 1));
  });

  it('keeps every technology tagged with an area, and no other', async () => {
    const entries = await loadRadarEntries(SITE_REPOSITORIES);
    const kept = entries.filter(each =>
      matches(each, { ...NO_FILTER, areas: ['monorepo'] }, 'en'),
    );
    expect(kept.map(each => each.id).sort()).toEqual(['nx', 'pnpm']);
  });

  it('keeps an entry matching any value of a list, and all lists together', () => {
    const filter = { ...NO_FILTER, quadrants: [0, 2] as QuadrantIndex[] };
    expect(matches(entry({ quadrant: 2 }), filter, 'en')).toBe(true);
    expect(matches(entry({ quadrant: 1 }), filter, 'en')).toBe(false);
    expect(
      matches(entry({}), { ...filter, rings: [3] as RingIndex[] }, 'en'),
    ).toBe(false);
  });

  it('searches names in the reader’s language, ignoring case and accents', () => {
    const search = (query: string, locale: 'en' | 'es') =>
      matches(entry({}), { ...NO_FILTER, query }, locale);
    expect(search('  CONTRACT ', 'en')).toBe(true);
    expect(search('contrato', 'en')).toBe(false);
    expect(search('pruebas de contrató', 'es')).toBe(true);
  });

  it('says whether it filters anything', () => {
    expect(isFiltering(NO_FILTER)).toBe(false);
    expect(isFiltering({ ...NO_FILTER, query: '  ' })).toBe(false);
    expect(isFiltering({ ...NO_FILTER, query: 'next' })).toBe(true);
    expect(isFiltering({ ...NO_FILTER, quadrants: [1] })).toBe(true);
    expect(isFiltering({ ...NO_FILTER, rings: [1] })).toBe(true);
    expect(isFiltering({ ...NO_FILTER, areas: ['css'] })).toBe(true);
  });
});

describe('the radar filter in a URL', () => {
  const words: RadarVocabulary = {
    quadrants: ['techniques', 'tools', 'platforms', 'languages'],
    rings: ['adopt', 'trial', 'assess', 'hold'],
    areas: ['css', 'monorepo'],
  };

  it('round-trips, by id', () => {
    const filter: RadarFilter = {
      quadrants: [1],
      rings: [0, 1],
      areas: ['css'],
      query: 'next js',
    };
    const search = serializeFilter(filter, words);
    expect(search).toBe(
      '?quadrant=tools&ring=adopt&ring=trial&area=css&q=next+js',
    );
    expect(parseFilter(search, words)).toEqual(filter);
  });

  it('is empty when nothing is filtered, and drops what it does not know', () => {
    expect(serializeFilter(NO_FILTER, words)).toBe('');
    expect(parseFilter('', words)).toEqual(NO_FILTER);
    expect(parseFilter('?ring=never&area=cobol&quadrant=x', words)).toEqual(
      NO_FILTER,
    );
  });
});

describe('a toggle', () => {
  it('adds a value, and takes it out again', () => {
    expect(toggled([1], 2)).toEqual([1, 2]);
    expect(toggled([1, 2], 1)).toEqual([2]);
  });
});
