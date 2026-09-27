/**
 * The radar's query string, and the build's and the browser's answers to it.
 *
 * The browser answers from `/data/technology.json` through the same `load`
 * use case the build answers from the content through. The check is that
 * both keep the same technologies — every quadrant, ring and area, alone and
 * combined, and a search — so the file and the pages cannot drift apart.
 */
import { Quadrant, Ring, Technology, TechnologyArea } from '@myself-app/domain';
import {
  loadThroughUseCase,
  staticJsonSource,
} from '@myself-app/entifix-browser';
import { describe, expect, it } from 'vitest';

import { dataFileContent } from '../../content/data-files';
import { loadEvery } from '../../content/queries';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { radarQuery, type RadarVocabulary } from './radar-filter';

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

/** The browser's source, over the file the export writes. */
async function browserSource() {
  const file = await dataFileContent(SITE_REPOSITORIES, 'technology.json');
  return staticJsonSource(
    Technology,
    '/data/technology.json',
    (async () => new Response(JSON.stringify(file))) as unknown as typeof fetch,
  );
}

const idsOf = (technologies: readonly Technology[]) =>
  technologies.map(each => String(each.id)).sort();

describe('the radar filter', () => {
  it('keeps the same technologies in the browser as at build, for every combination', async () => {
    const words = await vocabulary();
    const query = radarQuery(words);
    const repository = await (await browserSource())();
    const searches = [
      ...['', ...words.quadrants].flatMap(quadrant =>
        ['', ...words.rings].map(ring => `?quadrant=${quadrant}&ring=${ring}`),
      ),
      ...words.areas.map(area => `?area=${area}`),
      '?q=TYPE',
      '?q=tecnicas',
    ];
    for (const search of searches) {
      for (const locale of ['en', 'es'] as const) {
        const request = query.request<Technology>(query.parse(search), locale);
        const [atBuild, inBrowser] = await Promise.all([
          loadEvery(SITE_REPOSITORIES, Technology, request),
          loadThroughUseCase<Technology>(repository, {
            ...request,
            pageSize: Number.MAX_SAFE_INTEGER,
          }),
        ]);
        expect(idsOf(inBrowser.items), `${search} (${locale})`).toEqual(
          idsOf(atBuild),
        );
      }
    }
  });

  it('keeps every technology tagged with an area, and no other', async () => {
    const query = radarQuery(await vocabulary());
    const kept = await loadEvery(
      SITE_REPOSITORIES,
      Technology,
      query.request(query.parse('?area=monorepo'), 'en'),
    );
    expect(idsOf(kept)).toEqual(['monorepos', 'nx', 'pnpm']);
  });

  it('searches names in the reader’s language, ignoring case and accents', async () => {
    const query = radarQuery(await vocabulary());
    const search = async (q: string, locale: 'en' | 'es') =>
      idsOf(
        await loadEvery(
          SITE_REPOSITORIES,
          Technology,
          query.request(query.parse(`?q=${encodeURIComponent(q)}`), locale),
        ),
      );
    expect(await search('  TYPESCRIPT ', 'en')).toEqual(['typescript']);
    expect(await search('typescript', 'es')).toEqual(['typescript']);
  });
});

describe('the radar filter in a URL', () => {
  const query = radarQuery({
    quadrants: ['techniques', 'tools', 'platforms', 'languages'],
    rings: ['adopt', 'trial', 'assess', 'hold'],
    areas: ['css', 'monorepo'],
  });

  it('round-trips, by id', () => {
    const search = '?quadrant=tools&ring=adopt&ring=trial&area=css&q=next+js';
    const filter = query.parse(search);
    expect(filter).toEqual({
      quadrant: ['tools'],
      ring: ['adopt', 'trial'],
      area: ['css'],
      q: ['next js'],
    });
    expect(query.serialize(filter)).toBe(search);
  });

  it('is empty when nothing is filtered, and drops what it does not know', () => {
    expect(query.serialize(query.empty)).toBe('');
    expect(query.parse('')).toEqual(query.empty);
    expect(query.parse('?ring=never&area=cobol&quadrant=x')).toEqual(
      query.empty,
    );
  });
});
