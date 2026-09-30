/**
 * A project's page and each of its decision records' (#77).
 */
import { localePath } from './locale-path.js';
import type { SiteLocale } from './site-locales.js';

/** `/en/projects/entifix/`. */
export function projectPath(locale: SiteLocale, projectId: string): string {
  return localePath(locale, `/projects/${projectId}`);
}

/** The anchor of a project page's decision records. */
export const DECISIONS_ANCHOR = 'decisions';

/** `/en/projects/entifix/adr/0001/`: `number` as the record's file writes it. */
export function decisionPath(
  locale: SiteLocale,
  projectId: string,
  number: string,
): string {
  return localePath(locale, `/projects/${projectId}/adr/${number}`);
}
