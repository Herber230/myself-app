/**
 * A project's page and each of its decision records' (#77).
 */
import { localePath } from './locale-path.js';
import type { SiteLocale } from './site-locales.js';

/**
 * The projects the nav's menu leads to, in the landing page's order. The nav
 * is on every page, and no page loads the projects for it, so they are named
 * here; the app's spec holds this list to the featured projects' content.
 */
export const NAV_PROJECTS = [
  { id: 'entifix', name: 'entifix' },
  { id: 'myself-app', name: 'myself-app' },
] as const;

/** Whether `path`, locale-free, is a project's page or one of its records. */
export function isProjectPath(path: string, projectId: string): boolean {
  const page = `/projects/${projectId}`;
  return path === page || path.startsWith(`${page}/`);
}

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
