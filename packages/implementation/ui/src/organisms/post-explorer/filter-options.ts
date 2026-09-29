/**
 * What the blog's filter offers (ADR 0017): every tag, technology and year a
 * post names, in the reader's language. Built at build, for the blog's home
 * and a post's sidebar alike.
 */
import { localize, type LocalizedText } from '@myself-app/domain';
import type { PostPreview } from '@myself-app/domain/use-cases';

import type { SiteLocale } from '../../routing/site-locales.js';

export interface FilterOption {
  readonly id: string;
  readonly name: string;
}

/** Names, in the reader's language, sorted as they would look them up. */
function namesOf(
  records: readonly { id: string; text: LocalizedText }[],
  locale: SiteLocale,
): FilterOption[] {
  const unique = new Map(records.map(each => [each.id, each.text]));
  return [...unique]
    .map(([id, text]) => ({ id, name: localize(text, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function filterOptionsOf(
  previews: readonly PostPreview[],
  locale: SiteLocale,
): {
  tags: FilterOption[];
  technologies: FilterOption[];
  /** Newest first, as the posts are. */
  years: string[];
} {
  return {
    tags: namesOf(
      previews.flatMap(each =>
        each.tags.map(tag => ({ id: tag.id, text: tag.label })),
      ),
      locale,
    ),
    technologies: namesOf(
      previews.flatMap(each =>
        each.technologies.map(technology => ({
          id: technology.id,
          text: technology.name,
        })),
      ),
      locale,
    ),
    years: [...new Set(previews.map(each => each.publishedAt.slice(0, 4)))],
  };
}
