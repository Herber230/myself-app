/**
 * How the CV writes its dates and links (ADR 0012). Formatted at build, in the
 * reader's language, so a Spanish sheet never shows an English month.
 */
import type { SiteLocale } from '../../site-locales';

/** The two ways one sheet is written. */
export const CV_MODES = ['human', 'ats'] as const;
export type CvMode = (typeof CV_MODES)[number];

/**
 * A month and year: `Jan 2022`, `ene 2022`. In UTC, because content dates are
 * written as calendar days and parse to midnight UTC.
 */
export function formatMonth(date: Date, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '');
}

/** `Jan 2022 – Present`, or `Jan 2019 – Dec 2021`. */
export function formatPeriod(
  start: Date,
  end: Date | undefined,
  locale: SiteLocale,
  present: string,
): string {
  const last = end === undefined ? present : formatMonth(end, locale);
  return `${formatMonth(start, locale)} – ${last}`;
}

/** `2007 – 2014`, or one year when both fall in it. */
export function formatYears(start: Date, end: Date | undefined): string {
  const first = start.getUTCFullYear();
  const last = end?.getUTCFullYear();
  return last === undefined || last === first
    ? String(first)
    : `${first} – ${last}`;
}

/**
 * A link as a reader would type it: no scheme, no `www.`, no trailing slash;
 * an email address for `mailto:`. An ATS reads this text, not the link target.
 */
export function readableUrl(url: string): string {
  return url
    .replace(/^mailto:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}
