/**
 * A post's preview as its card shows it (ADR 0017): translated, formatted and
 * linked at build, for a server page and the browser's filter alike.
 */
import type { PostPreview } from '@myself-app/domain/use-cases';
import type { TFunction } from 'i18next';

import { localePath } from '../../locale-path';
import type { SiteLocale } from '../../site-locales';
import { inLocale } from '../cv/cv-format';
import type { PostCardData } from './post-card';

/** `27 Sep 2026`, or `27 sept 2026`: the day, as the reader writes it. */
export function formatDay(date: Date, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '');
}

export function postPath(locale: SiteLocale, id: string): string {
  return localePath(locale, `/blog/${id}`);
}

export function postCardOf(
  preview: PostPreview,
  locale: SiteLocale,
  t: TFunction<'site'>,
): PostCardData {
  return {
    id: preview.id,
    href: postPath(locale, preview.id),
    title: inLocale(preview.title, locale),
    summary: inLocale(preview.summary, locale),
    excerpt: preview.excerpt[locale],
    publishedAt: preview.publishedAt,
    date: formatDay(new Date(preview.publishedAt), locale),
    readingTime: t('blogPage.readingTime', {
      minutes: preview.readingMinutes[locale],
    }),
    ...(preview.draft && { draft: t('blogPage.draft') }),
    tags: preview.tags.map(tag => ({
      id: tag.id,
      label: inLocale(tag.label, locale),
    })),
    technologies: preview.technologies.map(technology => ({
      id: technology.id,
      name: inLocale(technology.name, locale),
    })),
  };
}
