/**
 * The blog's filter (ADR 0016, 0017): the parameters its query string may
 * carry, and the condition each becomes in an entifix load request.
 *
 * `?tag=testing&tech=effect&year=2026&q=static` asks for the posts with any
 * of those tags, and any of those technologies, published in any of those
 * years, whose title in the reader's language holds "static".
 */
import {
  anyOf,
  containing,
  defineUrlQuery,
  inAnyYear,
  type UrlQuery,
} from '@myself-app/entifix-browser';

import type { SiteLocale } from '../../site-locales';

/** The values the URL may name, each as it appears there. */
export interface BlogVocabulary {
  readonly tags: readonly string[];
  readonly technologies: readonly string[];
  readonly years: readonly string[];
}

export type BlogParam = 'tag' | 'tech' | 'year' | 'q';

export function blogQuery(
  vocabulary: BlogVocabulary,
): UrlQuery<BlogParam, SiteLocale> {
  return defineUrlQuery({
    params: {
      tag: { allowed: vocabulary.tags, condition: anyOf('tags') },
      tech: {
        allowed: vocabulary.technologies,
        condition: anyOf('technologies'),
      },
      year: { allowed: vocabulary.years, condition: inAnyYear('publishedAt') },
      q: {
        single: true,
        condition: containing((locale: SiteLocale) => `title.${locale}`),
      },
    },
    sorting: [{ 0: { property: 'publishedAt', type: 'desc' } }],
  });
}
