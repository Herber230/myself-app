/**
 * The radar's filter (#41, ADR 0014, 0016): which parameters its query string
 * may carry, and the condition each becomes in an entifix load request.
 *
 * `?quadrant=tools&ring=adopt&ring=trial&area=css&q=next` asks for the
 * technologies in any of those quadrants, and any of those rings, and any of
 * those areas, whose name in the reader's language holds "next". The browser
 * answers it through the `load` use case, as a page answers at build time.
 */
import {
  anyOf,
  containing,
  defineUrlQuery,
  type UrlQuery,
  type UrlState,
} from '@myself-app/entifix-incubator-browser';

import type { SiteLocale } from '../../routing/site-locales.js';

/** The ids the URL names quadrants, rings and areas by. */
export interface RadarVocabulary {
  readonly quadrants: readonly string[];
  readonly rings: readonly string[];
  readonly areas: readonly string[];
}

export type RadarParam = 'quadrant' | 'ring' | 'area' | 'q';

export type RadarFilter = UrlState<RadarParam>;

export function radarQuery(
  vocabulary: RadarVocabulary,
): UrlQuery<RadarParam, SiteLocale> {
  return defineUrlQuery({
    params: {
      quadrant: { allowed: vocabulary.quadrants, condition: anyOf('quadrant') },
      ring: { allowed: vocabulary.rings, condition: anyOf('ring') },
      area: { allowed: vocabulary.areas, condition: anyOf('areas') },
      q: {
        single: true,
        condition: containing((locale: SiteLocale) => `name.${locale}`),
      },
    },
  });
}
