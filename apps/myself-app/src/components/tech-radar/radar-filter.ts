/**
 * Which blips a filter keeps (#41, ADR 0014): by quadrant, ring and area, and
 * a search over names. Each list keeps an entry that matches any of its
 * values, and the lists and the search combine with `and`; an empty list or
 * search keeps everything. An area matches any of an entry's `areas`, the
 * array-membership rule the static adapter's `in` applies at build time.
 *
 * Plain functions over `RadarEntry`, so the browser filters the props the
 * build passed down and no entifix code ships with it (ADR 0003).
 */
import type { SiteLocale } from '../../site-locales';
import type { QuadrantIndex, RadarEntry, RingIndex } from './types';

export interface RadarFilter {
  readonly quadrants: readonly QuadrantIndex[];
  readonly rings: readonly RingIndex[];
  readonly areas: readonly string[];
  readonly query: string;
}

export const NO_FILTER: RadarFilter = {
  quadrants: [],
  rings: [],
  areas: [],
  query: '',
};

/** The ids the URL names quadrants and rings by, in index order. */
export interface RadarVocabulary {
  readonly quadrants: readonly string[];
  readonly rings: readonly string[];
  readonly areas: readonly string[];
}

/** Lower case, without accents: "Técnicas" is found by "tecnicas". */
function folded(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function keeps<T>(values: readonly T[], match: (value: T) => boolean) {
  return values.length === 0 || values.some(match);
}

export function isFiltering(filter: RadarFilter): boolean {
  return (
    filter.quadrants.length > 0 ||
    filter.rings.length > 0 ||
    filter.areas.length > 0 ||
    filter.query.trim() !== ''
  );
}

export function matches(
  entry: RadarEntry,
  filter: RadarFilter,
  locale: SiteLocale,
): boolean {
  const query = folded(filter.query.trim());
  return (
    keeps(filter.quadrants, quadrant => quadrant === entry.quadrant) &&
    keeps(filter.rings, ring => ring === entry.ring) &&
    keeps(filter.areas, area => entry.areas.includes(area)) &&
    folded(entry.label[locale]).includes(query)
  );
}

/** The indices of the ids a parameter names, in index order, unknown ones dropped. */
function indicesOf<T extends number>(
  params: URLSearchParams,
  name: string,
  ids: readonly string[],
): T[] {
  const named = new Set(params.getAll(name));
  return ids.flatMap((id, index) => (named.has(id) ? [index as T] : []));
}

/** `?quadrant=tools&ring=adopt&ring=trial&area=css&q=next`, read back. */
export function parseFilter(
  search: string,
  vocabulary: RadarVocabulary,
): RadarFilter {
  const params = new URLSearchParams(search);
  const areas = new Set(params.getAll('area'));
  return {
    quadrants: indicesOf<QuadrantIndex>(
      params,
      'quadrant',
      vocabulary.quadrants,
    ),
    rings: indicesOf<RingIndex>(params, 'ring', vocabulary.rings),
    areas: vocabulary.areas.filter(area => areas.has(area)),
    query: params.get('q') ?? '',
  };
}

/** The query string for a filter, `''` when it filters nothing. */
export function serializeFilter(
  filter: RadarFilter,
  vocabulary: RadarVocabulary,
): string {
  const params = new URLSearchParams();
  for (const quadrant of filter.quadrants) {
    params.append('quadrant', vocabulary.quadrants[quadrant]);
  }
  for (const ring of filter.rings) {
    params.append('ring', vocabulary.rings[ring]);
  }
  for (const area of filter.areas) params.append('area', area);
  if (filter.query.trim() !== '') params.set('q', filter.query);
  const search = params.toString();
  return search === '' ? '' : `?${search}`;
}

/** `values` with `value` added, or taken out when it is already there. */
export function toggled<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter(each => each !== value)
    : [...values, value];
}
