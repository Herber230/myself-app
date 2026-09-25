/**
 * Where a technology sits on the radar — its legend entry's anchor, linked to
 * from the landing page's projects (#30) — and its own page (#42, ADR 0014).
 */
import { localePath } from '../../locale-path';
import type { SiteLocale } from '../../site-locales';

/** The legend entry's `id`: `tech-next-js`. */
export function radarEntryId(technologyId: string): string {
  return `tech-${technologyId}`;
}

/** `/en/tech-radar/#tech-next-js`. */
export function radarEntryPath(
  locale: SiteLocale,
  technologyId: string,
): string {
  return `${localePath(locale, '/tech-radar')}#${radarEntryId(technologyId)}`;
}

/** `/en/tech-radar/next-js/`: the technology's own page. */
export function technologyPath(
  locale: SiteLocale,
  technologyId: string,
): string {
  return localePath(locale, `/tech-radar/${technologyId}`);
}
