/**
 * The landing page's sections below the hero, in page order (ADR 0008). Each
 * id is the section's `id` and its anchor's fragment.
 */
import { localePath, type SiteLocale } from './site-locales';

export const LANDING_SECTIONS = [
  'about',
  'projects',
  'entifix',
  'contact',
] as const;

export type LandingSection = (typeof LANDING_SECTIONS)[number];

/**
 * A section's anchor, as a full path: `/en/#projects`. Full rather than
 * `#projects`, so the same link works from the CV and the radar, and with
 * scripting off.
 */
export function sectionPath(locale: SiteLocale, section: LandingSection) {
  return `${localePath(locale, '/')}#${section}`;
}
